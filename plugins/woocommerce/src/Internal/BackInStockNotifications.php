<?php
/**
 * Back In Stock Notifications class file.
 */

declare( strict_types = 1);

namespace Automattic\WooCommerce\Internal;

use Automattic\WooCommerce\Internal\Utilities\DatabaseUtil;
use Automattic\WooCommerce\Proxies\LegacyProxy;

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

		//TODO: can init run only in some contexts? admin + front end, rest api if it's related to BIS, but it needs to react to changes in stock levels, so can it actually be reduced..?
		self::$db_utils = wc_get_container()->get( DatabaseUtil::class );

		// Include BIS files
		include_once WC_ABSPATH . '/includes/bis/class-wc-bis-notifications.php';

		// Hook into feature flag changes
		add_action( 'update_option_wc_feature_woocommerce_bis_notifications_enabled', array( __CLASS__, 'maybe_setup_events' ), 10, 2 );
		
		// Hook into WC updates
		add_action( 'woocommerce_update', array( __CLASS__, 'maybe_setup_events' ) );

		// Check during admin init
		if ( is_admin() ) {
			// Check if events need to be created during admin init.
			add_action( 'admin_init', array( __CLASS__, 'check_events' ) );

			// Create DB tables if they don't exist. This will be removed in the future to reduce the number of DB calls.
			if ( ! self::bis_tables_exist() ) {
				self::create_database_tables();
			}
		}

		$wc_bis = wc_get_container()->get( LegacyProxy::class )->call_function( 'WC_BIS' );
		$wc_bis->initialize_plugin();

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

		if ( function_exists( 'WC_BIS' ) ) {
			// This skips the initialization of BIS plugin to avoid duplicate code & fatal errors.
			// BIS plugin is then deactivated during plugins_loaded.10 from \Automattic\WooCommerce\Packages::on_init().
			remove_action( 'plugins_loaded', array( WC_BIS(), 'initialize_plugin' ), 9 );

			// Strictly speaking, it's not necessarily an activation request, but when WC_BIS() is present before
			// loading BIS from core, it will fatal during init(), so init() needs to be skipped.
			// This should only be triggered once after a plugin update during the reuqest when BIS plugin is deactivated.
			self::$is_activation_request = true;
		}

		// Set flag for activation request to prevent fatal errors when BIS is activated while WC+BIS is already active.
		$bis_plugin_name = 'woocommerce-back-in-stock-notifications/woocommerce-back-in-stock-notifications.php';

		// Check for CLI activation via WP-CLI
		if ( defined('WP_CLI') && WP_CLI ) {
			global $argv;
			if ( is_array( $argv ) && in_array( 'plugin', $argv ) && in_array( 'activate', $argv ) && in_array( $bis_plugin_name, $argv ) ) {
				self::$is_activation_request = true;
				return;
			}
		}

		// Check for AJAX activation (network admin)
		if ( wp_doing_ajax() ) {
			if ( isset( $_REQUEST['action'] ) && $_REQUEST['action'] === 'activate-plugin' ) {
				if ( isset( $_REQUEST['plugin'] ) && $_REQUEST['plugin'] === $bis_plugin_name ) {
					self::$is_activation_request = true;
					return;
				}
			}
		}

		// Check for regular activation requests
		if ( isset( $_REQUEST['action'] ) ) {
			// Single plugin activation
			if ( $_REQUEST['action'] === 'activate' && isset( $_REQUEST['plugin'] ) && $_REQUEST['plugin'] === $bis_plugin_name ) {
				self::$is_activation_request = true;
				return;
			}

			// Bulk plugin activation
			if ( $_REQUEST['action'] === 'activate-selected' && isset( $_REQUEST['checked'] ) && is_array( $_REQUEST['checked'] ) && in_array( $bis_plugin_name, $_REQUEST['checked'] ) ) {
				self::$is_activation_request = true;
				return;
			}
		}
	}

	public static function get_bis_db_schema() : string {
		if ( ! self::is_enabled() ) {
			return '';
		}

		if ( ! class_exists( 'WC_BIS_Install' ) ) {
			include_once WC_ABSPATH . '/includes/bis/class-wc-bis-install.php';
		}


		return wc_get_container()->get( LegacyProxy::class )->call_static( 'WC_BIS_Install', 'get_schema' );
	}

	/**
	 * Check if BIS tables exist.
	 *
	 * Adapted from \Automattic\WooCommerce\Internal\DataStores\Orders\DataSynchronizer::check_orders_table_exists.
	 *
	 * @return bool
	 */
	public static function bis_tables_exist(): bool {

		if ( ! class_exists( 'WC_BIS_Install' ) ) {
			include_once WC_ABSPATH . '/includes/bis/class-wc-bis-install.php';
		}

		$missing_tables = self::$db_utils->get_missing_tables( wc_get_container()->get( LegacyProxy::class )->call_static( 'WC_BIS_Install', 'get_schema' ) );

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
		if ( ! class_exists( 'WC_BIS_Install' ) ) {
			include_once WC_ABSPATH . '/includes/bis/class-wc-bis-install.php';
		}

		$db_schema = wc_get_container()->get( LegacyProxy::class )->call_static( 'WC_BIS_Install', 'get_schema' );
		self::$db_utils->dbdelta( $db_schema );
		$success = self::bis_tables_exist();
		if ( ! $success ) {
			$missing_tables = self::$db_utils->get_missing_tables( $db_schema );
			$missing_tables = implode( ', ', $missing_tables );
			$logger = wc_get_container()->get( LegacyProxy::class )->call_function( 'wc_get_logger' );
			$logger->error( "Back In Stock Notifications tables are missing in the database and couldn't be created. The missing tables are: $missing_tables" );
		}
		return $success;
	}

	//TODO: decide what to do with this.
	/**
	 * Run this on option update, i.e. not on each request, preferably?
	 *
	 * @return void
	 */
	public static function activate_bis() {
		if ( ! self::is_enabled() ) {
			return;
		}

		// Activate notices.

		// Welcome notice on activation.
		// \WC_BIS_Admin_Notices::add_maintenance_notice( 'welcome' );

		// Run a loopback test after activation. Will only run once if successful.
		\WC_BIS_Admin_Notices::add_maintenance_notice( 'loopback' );

		// Run an AS test after activation. Will only run once if successful.
		if ( method_exists( WC(), 'queue' ) ) {
			\WC_BIS_Admin_Notices::add_maintenance_notice( 'queue' );
		}
	}

	/**
	 * Check if events need to be created during admin init.
	 * This catches cases where the option was changed directly in the database.
	 */
	public static function check_events() {
		// Only check occasionally to avoid unnecessary DB calls
		$last_check = get_option( 'wc_bis_events_last_check', 0 );
		if ( time() - $last_check < DAY_IN_SECONDS ) {
			return;
		}

		update_option( 'wc_bis_events_last_check', time() );
		self::maybe_setup_events();
	}

	public static function maybe_setup_events( $old_value = null, $new_value = null ) {
		// For option change, check if being disabled
		if ( isset( $old_value ) && isset( $new_value ) && $new_value === 'no' ) {
			self::cleanup_events();
			return;
		}

		if ( ! self::is_enabled() ) {
			return;
		}

		if ( ! wp_next_scheduled( 'wc_bis_daily' ) ) {
			wc_get_container()->get( LegacyProxy::class )->call_static( 'WC_BIS_Install', 'create_events' );
		}
	}

	/**
	 * Clean up scheduled events when WooCommerce is deactivated.
	 * This should be called from WooCommerce's deactivation hook.
	 */
	public static function cleanup_events() {
		$timestamp = wp_next_scheduled( 'wc_bis_daily' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'wc_bis_daily' );
		}
	}
}
