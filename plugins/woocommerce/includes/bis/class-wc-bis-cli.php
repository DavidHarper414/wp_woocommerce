<?php
/**
 * WC_BIS_CLI class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * DB updating and other stuff via WP-CLI.
 *
 * @class    WC_BIS_CLI
 * @version  1.0.0
 */
class WC_BIS_CLI {

	/**
	 * Load required files and hooks.
	 */
	public function __construct() {
		$this->includes();
		$this->hooks();
	}

	/**
	 * Load command files.
	 */
	private function includes() {
		require_once WC_BIS_ABSPATH . 'includes/cli/class-wc-bis-cli-update.php';
	}

	/**
	 * Sets up and hooks WP CLI to our CLI code.
	 */
	private function hooks() {
		WP_CLI::add_hook( 'after_wp_load', 'WC_BIS_CLI_Update::register_command' );
	}
}

new WC_BIS_CLI();
