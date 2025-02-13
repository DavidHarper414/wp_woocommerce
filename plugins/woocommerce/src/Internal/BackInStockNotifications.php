<?php
/**
 * Back In Stock Notifications class file.
 */

declare( strict_types = 1);

namespace Automattic\WooCommerce\Internal;

use Automattic\WooCommerce\Packages;
use Automattic\WooCommerce\Internal\Utilities\DatabaseUtil;

defined( 'ABSPATH' ) || exit;

/**
 * Class to initiate Back In Stock Notifications functionality in core.
 */
class BackInStockNotifications {

	private static $db_utils;

	private static $is_activation_request = false;

	/**
	 * Class initialization
	 *
	 * @internal
	 */
	final public static function init() {

		// If this is an activation request for BIS, included code can't be loaded, as it will end up with a fatal error.
		if ( ! self::is_enabled() || self::$is_activation_request ) { 
			return;
		}
		//TODO: can this run only in some contexts? admin + front end, rest api if it's related to BIS, but it needs to react to changes in stock levels, so can it actually be reduced..?
		self::$db_utils = wc_get_container()->get( DatabaseUtil::class );

		include_once WC_ABSPATH . '/includes/bis/class-wc-bis-notifications.php';

		WC_BIS()->initialize_plugin();

	}

	/**
	 * Returns true if the feature is enabled for all users during the rollout period.
	 *
	 * As of WooCommerce 9.9, Back In Stock Notifications will be merged, but disabled for all users.
	 * As of WooCommerce 10.0, Back In Stock Notifications will be enabled for 5% of users.
	 * As of WooCommerce 10.1, Back In Stock Notifications will be enabled for all users.
	 *
	 * Feature can be disabled via option `update_option( 'wc_feature_woocommerce_bis_notifications_enabled', 'no' )`,
	 * even when this method returns true.
	 *
	 * See also \Automattic\WooCommerce\Packages::get_enabled_packages.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return true;

	}

	/**
	 * If WooCommerce Back In Stock Notifications gets activated forcibly, without WooCommerce active
	 * (e.g. via '--skip-plugins'), remove WooCommerce Back In Stock Notifications initialization functions
	 * early on in the 'plugins_loaded' timeline.
	 *
	 * This is called from \Automattic\WooCommerce\Packages::prepare_packages.
	 */
	public static function prepare() {

		if ( ! self::is_enabled() ) {
			return;
		}

		if ( function_exists( 'wc_bis_get_notifications' ) ) {
			//TODO: check if this is needed & works.
			remove_action( 'plugins_loaded', array( \WC_BIS_Notifications::instance(), 'initialize_plugin' ), 9 );
		}

		// Set flag for activation request to prevent fatal errors.
		$bis_plugin_name = 'woocommerce-back-in-stock-notifications/woocommerce-back-in-stock-notifications.php';

		// Check for CLI activation via WP-CLI
		if ( defined('WP_CLI') && WP_CLI ) {
			global $argv;
			if ( is_array( $argv ) && in_array( 'plugin', $argv ) && in_array( 'activate', $argv ) && in_array( $bis_plugin_name, $argv ) ) {
				self::$is_activation_request = true;
				return;
			}
		}

		// Check for AJAX activation
		if ( wp_doing_ajax() && isset( $_REQUEST['action'] ) && $_REQUEST['action'] === 'activate-plugin' ) {
			if ( isset( $_REQUEST['plugin'] ) && $_REQUEST['plugin'] === $bis_plugin_name ) {
				self::$is_activation_request = true;
				return;
			}
		}

		// Check for regular activation request (e.g., from plugins page)
		if ( isset( $_REQUEST['action'] ) && $_REQUEST['action'] === 'activate' ) {
			if ( isset( $_REQUEST['plugin'] ) && $_REQUEST['plugin'] === $bis_plugin_name ) {
				self::$is_activation_request = true;
				return;
			}
		}

		// TODO: check if this also covers activation via woocommerce.com.

	}

	/**
	 * Check if BIS tables exist.
	 *
	 * Adapted from \Automattic\WooCommerce\Internal\DataStores\Orders\DataSynchronizer::check_orders_table_exists.
	 *
	 * @return bool
	 */
	public static function check_bis_tables_exist(): bool {
		$missing_tables = self::$db_utils->get_missing_tables( WC_BIS_Install::get_schema() );

		if ( 0 === count( $missing_tables ) ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Create BIS db tables when feature is enabled after WC installation has run.
	 *
	 * Adapted from \Automattic\WooCommerce\Internal\DataStores\Orders\DataSynchronizer::create_database_tables.
	 *
	 * @return mixed
	 */
	public static function create_database_tables() {
		self::$db_utils->dbdelta( WC_BIS_Install::get_schema() );
		$success = self::check_bis_tables_exist();
		if ( ! $success ) {
			$missing_tables = self::$db_utils->get_missing_tables( WC_BIS_Install::get_schema() );
			$missing_tables = implode( ', ', $missing_tables );
			$logger = wc_get_container()->get( LegacyProxy::class )->call_function( 'wc_get_logger' );
			$logger->error( "Back In Stock Notifications tables are missing in the database and couldn't be created. The missing tables are: $missing_tables" );
		}
		return $success;
	}

	/**
	 * Run this on option update, i.e. not on each request, preferably?
	 *
	 * @return void
	 */
	public static function activate_bis() {
		if ( ! self::is_enabled() ) {
			return;
		}

		// Create DB tables.
		if ( ! self::check_bis_tables_exist() ) {
			self::create_database_tables();
		}

		// Schedule jobs.
		WC_BIS_Install::create_events();

		// Activate notices.

		// Welcome notice on activation.
		WC_BIS_Admin_Notices::add_maintenance_notice( 'welcome' );

		// Run a loopback test after activation. Will only run once if successful.
		WC_BIS_Admin_Notices::add_maintenance_notice( 'loopback' );

		// Run an AS test after activation. Will only run once if successful.
		if ( method_exists( WC(), 'queue' ) ) {
			WC_BIS_Admin_Notices::add_maintenance_notice( 'queue' );
		}

		// Flush rules to include our new endpoint.
		flush_rewrite_rules();
	}
}
