<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\EmailEditor;

use MailPoet\EmailEditor\Engine\Settings_Controller;
use MailPoet\EmailEditor\Engine\Theme_Controller;
use MailPoet\EmailEditor\Engine\User_Theme;
use MailPoet\EmailEditor\EmailEditorContainer;

defined( 'ABSPATH' ) || exit;

class PageRenderer {
	private Settings_Controller $settingsController;
	private Theme_Controller $themeController;
	private User_Theme $userTheme;

	public function __construct() {
		$editorContainer = EmailEditorContainer::container();
		$this->settingsController = $editorContainer->get( Settings_Controller::class );
		$this->themeController = $editorContainer->get( Theme_Controller::class );
		$this->userTheme = $editorContainer->get( User_Theme::class );
	}

	public function render() {
		$postId = isset($_GET['post']) ? intval($_GET['post']) : 0;
		$post = get_post($postId);
		$currentPostType = $post->post_type;

		if (!$post instanceof \WP_Post || $currentPostType !== Integration::EMAIL_POST_TYPE) {
			return;
		}

		$emailEditorAssetsPath = WC_ABSPATH . WC_ADMIN_DIST_JS_FOLDER . 'email-editor/';
		$emailEditorAssetsUrl = WC()->plugin_url() . '/' . WC_ADMIN_DIST_JS_FOLDER . 'email-editor/';


		// Email editor rich text JS - Because the Personalization Tags depend on Gutenberg 19.8.0 and higher
		// the following code replaces used Rich Text for the version containing the necessary changes.
		$assetsParams = require $emailEditorAssetsPath . 'rich-text.asset.php';
		wp_deregister_script('wp-rich-text');
		wp_enqueue_script(
			'wp-rich-text',
			$emailEditorAssetsUrl . 'rich-text.js',
			$assetsParams['dependencies'],
			$assetsParams['version'],
			true
		);
		// End of replacing Rich Text package.

		$fileName = 'index';
		$assetsParams = require $emailEditorAssetsPath . "{$fileName}.asset.php";

		wp_enqueue_script(
			'mailpoet_email_editor',
			$emailEditorAssetsUrl . "{$fileName}.js",
			$assetsParams['dependencies'],
			$assetsParams['version'],
			true
		);
		wp_enqueue_style(
			'mailpoet_email_editor',
			$emailEditorAssetsUrl . "{$fileName}.css",
			[],
			$assetsParams['version']
		);

		$currentUserEmail = wp_get_current_user()->user_email;
		wp_localize_script(
			'mailpoet_email_editor',
			'MailPoetEmailEditor',
			[
				'current_post_type' => esc_js($currentPostType),
				'current_post_id' => $post->ID,
				'current_wp_user_email' => esc_js($currentUserEmail),
				'editor_settings' => $this->settingsController->get_settings(),
				'editor_theme' => $this->themeController->get_base_theme()->get_raw_data(),
				'user_theme_post_id' => $this->userTheme->get_user_theme_post()->ID,
				'urls' => [
					'listings' => admin_url('edit.php?post_type=' . Integration::EMAIL_POST_TYPE),
					'send' => admin_url('edit.php?post_type=' . Integration::EMAIL_POST_TYPE),
				],
			]
		);

		// Load CSS from Post Editor
		wp_enqueue_style('wp-edit-post');
		// Load CSS for the format library - used for example in popover
		wp_enqueue_style('wp-format-library');

		// Enqueue media library scripts
		wp_enqueue_media();

		$this->preload_rest_api_data($post);

		require_once ABSPATH . 'wp-admin/admin-header.php';
		echo '<div id="mailpoet-email-editor" class="block-editor block-editor__container hide-if-no-js"></div>';
	}

	private function preload_rest_api_data(\WP_Post $post): void {
		$emailPostType = $post->post_type;
		$userThemePostId = $this->userTheme->get_user_theme_post()->ID;
		$templateSlug = get_post_meta($post->ID, '_wp_page_template', true);
		$routes = [
			"/wp/v2/{$emailPostType}/" . intval($post->ID) . '?context=edit',
			"/wp/v2/types/{$emailPostType}?context=edit",
			'/wp/v2/global-styles/' . intval($userThemePostId) . '?context=edit', // Global email styles
			'/wp/v2/block-patterns/patterns',
			'/wp/v2/templates?context=edit',
			'/wp/v2/block-patterns/categories',
			'/wp/v2/settings',
			'/wp/v2/types?context=view',
			'/wp/v2/taxonomies?context=view',
		];

		if ($templateSlug) {
			$routes[] = '/wp/v2/templates/lookup?slug=' . $templateSlug;
		} else {
			$routes[] = "/wp/v2/{$emailPostType}?context=edit&per_page=30&status=publish,sent";
		}

		// Preload the data for the specified routes
		$preloadData = array_reduce(
			$routes,
			'rest_preload_api_request',
			[]
		);

		// Add inline script to set up preloading middleware
		wp_add_inline_script(
			'wp-blocks',
			sprintf(
				'wp.apiFetch.use( wp.apiFetch.createPreloadingMiddleware( %s ) );',
				wp_json_encode($preloadData)
			)
		);
	}
}
