<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\Admin\EmailEditor;

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
	}

	public function addEmailPostType(array $postTypes): array {
		$postTypes[] = [
			'name' => self::EMAIL_POST_TYPE,
			'args' => [
				'labels' => [
					'name' => __('Woo Emails', 'email-editor-demo'),
					'singular_name' => __('Woo Email', 'email-editor-demo'),
					'add_new_item' => __('Add New Woo Email', 'email-editor-demo'),
					'edit_item' => __('Edit Woo Email', 'email-editor-demo'),
					'new_item' => __('New Woo Email', 'email-editor-demo'),
					'view_item' => __('View Woo Email', 'email-editor-demo'),
					'search_items' => __('Search Woo Emails', 'email-editor-demo')
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
}
