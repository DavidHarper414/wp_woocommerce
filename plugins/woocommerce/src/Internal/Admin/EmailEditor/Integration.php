<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\Admin\EmailEditor;

use MailPoet\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use MailPoet\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;
use Automattic\WooCommerce\Internal\Admin\EmailEditor\Patterns\PatternsController;
use Automattic\WooCommerce\Internal\Admin\EmailEditor\Templates\TemplatesController;

defined( 'ABSPATH' ) || exit;

class Integration {
	const EMAIL_POST_TYPE = 'woo_mail';

	private PageRenderer $editorPageRenderer;

	private PatternsController $patternsController;

	private TemplatesController $templatesController;

	public function init(
		PageRenderer  $editorPageRenderer,
		PatternsController $patternsController,
		TemplatesController $templatesController
	): void {
		$this->editorPageRenderer = $editorPageRenderer;
		$this->patternsController = $patternsController;
		$this->templatesController = $templatesController;

		$this->initialize();
	}

	public function initialize () {
		add_filter('mailpoet_email_editor_post_types', [$this, 'addEmailPostType']);
		add_filter('mailpoet_is_email_editor_page', [$this, 'isEditorPage'], 10, 1);
		add_filter('replace_editor', [$this, 'replaceEditor'], 10, 2);
		// register patterns
		$this->patternsController->registerPatterns();
		// register templates
		$this->templatesController->initialize();
		$this->registerPersonalizationTags();
	}

	public function addEmailPostType(array $postTypes): array {
		$postTypes[] = [
			'name' => self::EMAIL_POST_TYPE,
			'args' => [
				'labels' => [
					'name' => __('Woo Emails', 'woocommerce'),
					'singular_name' => __('Woo Email', 'woocommerce'),
					'add_new_item' => __('Add New Woo Email', 'woocommerce'),
					'edit_item' => __('Edit Woo Email', 'woocommerce'),
					'new_item' => __('New Woo Email', 'woocommerce'),
					'view_item' => __('View Woo Email', 'woocommerce'),
					'search_items' => __('Search Woo Emails', 'woocommerce')
				],
				'rewrite' => ['slug' => self::EMAIL_POST_TYPE],
				'supports' => ['title', 'editor'],
				'public' => true,
				'show_ui' => true,
				'show_in_menu' => true,
				'show_in_rest' => true
			],
		];
		return $postTypes;
	}

	public function isEditorPage(bool $isEditorPage): bool {
		if ($isEditorPage) {
			return $isEditorPage;
		}

		// We need to check early if we are on the email editor page. The check runs early so we can't use current_screen() here.
		if (is_admin() && isset($_GET['post']) && isset($_GET['action']) && $_GET['action'] === 'edit') {
			$post = get_post((int)$_GET['post']);
			return $post && $post->post_type === self::EMAIL_POST_TYPE;
		}

		return false;
	}

	public function replaceEditor($replace, $post) {
		$currentScreen = get_current_screen();
		if ($post->post_type === self::EMAIL_POST_TYPE && $currentScreen) {
			$this->editorPageRenderer->render();
			return true;
		}
		return $replace;
	}

	public function registerPersonalizationTags() {
		add_filter('mailpoet_email_editor_register_personalization_tags', function( Personalization_Tags_Registry $registry ): Personalization_Tags_Registry {
			$registry->register(new Personalization_Tag(
				__('Shopper Email', 'woocommerce'),
				'woocommerce/shopper-email',
				__('Shopper', 'woocommerce'),
				function (array $context, array $args = []): string {
					return $context['recipient_email'] ?? '';
				},
			));

			// Site Personalization Tags
			$registry->register(new Personalization_Tag(
				__('Site Title', 'woocommerce'),
				'woocommerce/site-title',
				__('Site', 'woocommerce'),
				function (array $context, array $args = []): string {
					return htmlspecialchars_decode(get_bloginfo('name'));
				},
			));
			$registry->register(new Personalization_Tag(
				__('Homepage URL', 'woocommerce'),
				'woocommerce/site-homepage-url',
				__('Site', 'woocommerce'),
				function (array $context, array $args = []): string {
					return get_bloginfo('url');
				},
			));
			return $registry;
		});
	}
}
