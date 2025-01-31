<?php
/**
 * WC_BIS_Admin_Activity_Page class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_BIS_Admin_Activity_Page Class.
 */
class WC_BIS_Admin_Activity_Page {

	/**
	 * Page home URL.
	 *
	 * @const PAGE_URL
	 */
	const PAGE_URL = 'admin.php?page=bis_activity';

	/**
	 * Render page.
	 */
	public static function output() {

		$search = isset( $_REQUEST['s'] ) ? sanitize_text_field( $_REQUEST['s'] ) : '';
		$table  = new WC_BIS_Activity_List_Table();
		$table->prepare_items();

		include __DIR__ . '/views/html-admin-activity.php';
	}
}
