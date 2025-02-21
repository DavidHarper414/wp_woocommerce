<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\EmailEditor;

use Automattic\WooCommerce\Internal\EmailEditor\Patterns\PatternsController;
use Automattic\WooCommerce\Internal\EmailEditor\Templates\TemplatesController;

defined( 'ABSPATH' ) || exit;

class Integration {
	const EMAIL_POST_TYPE = 'woo_mail';

	private PageRenderer $editor_page_renderer;

	public function init(): void {
		$this->init_hooks();
		$this->register_hooks();
	}

	/**
	 * These classes have an register init method.
	 */
	public function init_hooks() {
		$container = wc_get_container();
		$container->get( PatternsController::class );
		$container->get( TemplatesController::class );
		$container->get( PersonalizationTagManager::class );
		$this->editor_page_renderer = $container->get( PageRenderer::class );
	}

	public function register_hooks() {
		add_filter('mailpoet_email_editor_post_types', [$this, 'add_email_post_type']);
		add_filter('mailpoet_is_email_editor_page', [$this, 'is_editor_page'], 10, 1);
		add_filter('replace_editor', [$this, 'replace_editor'], 10, 2);
	}

	public function add_email_post_type(array $postTypes): array {
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
				'show_ui' => true,  // showing in the admin UI is temporary, it will be removed in the future
				'show_in_menu' => true,
				'show_in_rest' => true
			],
		];
		return $postTypes;
	}

	public function is_editor_page(bool $isEditorPage): bool {
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

	public function replace_editor($replace, $post) {
		$current_screen = get_current_screen();
		if ($post->post_type === self::EMAIL_POST_TYPE && $current_screen) {
			$this->editor_page_renderer->render();
			return true;
		}
		return $replace;
	}
}
