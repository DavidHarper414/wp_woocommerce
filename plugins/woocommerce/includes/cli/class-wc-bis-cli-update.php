<?php
/**
 * WC_BIS_CLI_Update class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Allows DB updates via WP-CLI.
 *
 * @class    WC_BIS_CLI_Update
 * @version  1.0.0
 */
class WC_BIS_CLI_Update {

	/**
	 * Registers the update command.
	 */
	public static function register_command() {
		WP_CLI::add_command( 'wc bis update', array( 'WC_BIS_CLI_Update', 'update' ) );
	}

	/**
	 * Runs all pending WooCommerce database updates.
	 */
	public static function update() {

		global $wpdb;

		$wpdb->hide_errors();

		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-install.php';
		require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-notices.php';
		require_once WC_BIS_ABSPATH . 'includes/wc-bis-update-functions.php';

		$current_db_version = get_option( 'wc_bis_db_version', null );
		$update_count       = 0;

		set_transient( 'wc_bis_update_cli_init', 'yes', DAY_IN_SECONDS );

		foreach ( WC_BIS_Install::get_db_update_callbacks() as $version => $update_callbacks ) {
			if ( is_null( $current_db_version ) || version_compare( $current_db_version, $version, '<' ) ) {
				foreach ( $update_callbacks as $update_callback ) {
					WP_CLI::log( sprintf( 'Calling update function "%s"...', $update_callback ) );
					call_user_func( $update_callback );
					++$update_count;
				}
			}
		}

		delete_transient( 'wc_bis_update_cli_init' );

		WC_BIS_Admin_Notices::remove_maintenance_notice( 'update' );
		WP_CLI::success( sprintf( '%1$d updates complete. Database upgraded to version %2$s.', absint( $update_count ), get_option( 'wc_bis_db_version' ) ) );
	}
}
