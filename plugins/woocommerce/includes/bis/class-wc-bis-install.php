<?php
/**
 * WC_BIS_Install class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles installation and updating tasks.
 *
 * @class    WC_BIS_Install
 * @version  x.x.x
 */
class WC_BIS_Install {

	/**
	 * Background update class.
	 *
	 * @var WC_BIS_Background_Updater
	 */
	private static $background_updater;

	/**
	 * Whether install() ran in this request.
	 *
	 * @var boolean
	 */
	private static $is_install_request;

	/**
	 * Hook in.
	 */
	public static function init() {

		// Installation and DB updates handling.
		add_action( 'init', array( __CLASS__, 'init_background_updater' ), 5 );

		//TODO: Haven't ported the db upgrade when updating to 1.1.0, so perhaps add some info to folks on older BIS?

		include_once WC_ABSPATH . 'includes/bis/class-wc-bis-background-updater.php';
	}

	/**
	 * Init background updates.
	 */
	public static function init_background_updater() {
		self::$background_updater = new WC_BIS_Background_Updater();
	}

	/**
	 * Check version and run the installer if necessary.
	 */
	public static function maybe_install() {
		wc_deprecated_function( 'WC_BIS_Install::maybe_install', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * Run the updater if triggered.
	 */
	public static function maybe_update() {
		wc_deprecated_function( 'WC_BIS_Install::maybe_update', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * If the DB version is out-of-date, a DB update must be in progress: define a 'WC_BIS_UPDATING' constant.
	 */
	public static function define_updating_constant() {
		wc_deprecated_function( 'WC_BIS_Install::define_updating_constant', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * Install PB.
	 */
	public static function install() {

		if ( ! is_blog_installed() ) {
			return;
		}

		// Running for the first time? Set a transient now. Used in 'can_install' to prevent race conditions.
		// set_transient( 'wc_bis_installing', 'yes', 10 ); // handled by core install

		// Set a flag to indicate we're installing in the current request.
		// self::$is_install_request = true;

		// Create tables.
		// self::create_tables(); moved to WC_Install::get_schema && \Automattic\WooCommerce\Internal\BackInStockNotifications::create_database_tables.

		// Create events.
		// self::create_events(); moved to \Automattic\WooCommerce\Internal\BackInStockNotifications::activate_bis

		// Update plugin version - once set, 'maybe_install' will not call 'install' again.
		// self::update_version();

//		if ( ! class_exists( 'WC_BIS_Admin_Notices' ) ) {
//			require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-notices.php';
//		}

//		if ( is_null( self::$current_version ) ) {
//			// Add dismissible welcome notice.
//			WC_BIS_Admin_Notices::add_maintenance_notice( 'welcome' );
//		}

//		// Run a loopback test after every update. Will only run once if successful.
//		WC_BIS_Admin_Notices::add_maintenance_notice( 'loopback' );
//
//		// Run an AS test after every update. Will only run once if successful.
//		if ( method_exists( WC(), 'queue' ) ) {
//			WC_BIS_Admin_Notices::add_maintenance_notice( 'queue' );
//		}

		// Flush rules to include our new endpoint.
//		flush_rewrite_rules();
	}

	/**
	 * Schedule cron events.
	 */
	public static function create_events() {
		if ( ! wp_next_scheduled( 'wc_bis_daily' ) ) {
			wp_schedule_event( time(), 'daily', 'wc_bis_daily' );
		}
	}

	/**
	 * Get table schema.
	 *
	 * @since 1.0.0
	 * @since x.x.x Added  the `idx_product_active_queue` index on the `woocommerce_bis_notifications` table.
	 *
	 * @return string
	 */
	public static function get_schema() {
		global $wpdb;

		$collate = '';

		if ( $wpdb->has_cap( 'collation' ) ) {
			$collate = $wpdb->get_charset_collate();
		}

		$max_index_length = 191;

		$tables = "CREATE TABLE {$wpdb->prefix}woocommerce_bis_notifications (
  `id` BIGINT UNSIGNED NOT NULL auto_increment,
  `type` VARCHAR(128) default 'one-time' NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `user_email` VARCHAR($max_index_length) NOT NULL,
  `create_date` INT UNSIGNED default 0 NOT NULL,
  `subscribe_date` INT UNSIGNED default 0 NOT NULL,
  `last_notified_date` INT UNSIGNED default 0 NOT NULL,
  `is_queued` CHAR(3) default 'off' NOT NULL,
  `is_active` CHAR(3) default 'off' NOT NULL,
  `is_verified` CHAR(3) default 'yes' NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  KEY `user_email` (`user_email`),
  KEY `is_queued` (`is_queued`),
  KEY `is_active` (`is_active`),
  KEY `is_verified` (`is_verified`),
  KEY `idx_product_active_queue` (`product_id`,`is_active`,`is_queued`)

) $collate;
CREATE TABLE {$wpdb->prefix}woocommerce_bis_notificationsmeta (
  meta_id BIGINT UNSIGNED NOT NULL auto_increment,
  bis_notifications_id BIGINT UNSIGNED NOT NULL,
  meta_key varchar($max_index_length) default NULL,
  meta_value longtext NULL,
  PRIMARY KEY  (meta_id),
  KEY bis_notifications_id (bis_notifications_id),
  KEY meta_key (meta_key($max_index_length))
) $collate;
CREATE TABLE {$wpdb->prefix}woocommerce_bis_activity (
  `id` BIGINT UNSIGNED NOT NULL auto_increment,
  `notification_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `object_id` BIGINT UNSIGNED default 0 NOT NULL,
  `date` INT UNSIGNED NOT NULL,
  `note` text NULL,
  PRIMARY KEY  (`id`),
  KEY `notification_id` (`notification_id`),
  KEY `type` (`type`),
  KEY `user_id` (`user_id`)

) $collate;";

		return $tables;
	}


	/**
	 * Is auto-updating enabled?
	 *
	 * @return boolean
	 */
	public static function auto_update_enabled() {
		wc_deprecated_function( 'WC_BIS_Install::auto_update_enabled', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * Trigger DB update.
	 */
	public static function trigger_update() {
		wc_deprecated_function( 'WC_BIS_Install::trigger_update', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * Force re-start the update cron if everything else fails.
	 */
	public static function force_update() {
		wc_deprecated_function( 'WC_BIS_Install::force_update', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * Updates plugin DB version when all updates have been processed.
	 */
	public static function update_complete() {
		wc_deprecated_function( 'WC_BIS_Install::update_complete', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * True if a DB update is pending.
	 *
	 * @return boolean
	 */
	public static function is_update_pending() {
		wc_deprecated_function( 'WC_BIS_Install::is_update_pending', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * True if a DB update was started but not completed.
	 *
	 * @return boolean
	 */
	public static function is_update_incomplete() {
		wc_deprecated_function( 'WC_BIS_Install::is_update_incomplete', '9.9.0' );
		// Migrated to WC core's install routine.
	}


	/**
	 * True if a DB update is in progress.
	 *
	 * @return boolean
	 */
	public static function is_update_queued() {
		wc_deprecated_function( 'WC_BIS_Install::is_update_queued', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * True if an update process is running.
	 *
	 * @return boolean
	 */
	public static function is_update_process_running() {
		wc_deprecated_function( 'WC_BIS_Install::is_update_process_running', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * True if an update background process is running.
	 *
	 * @return boolean
	 */
	public static function is_update_background_process_running() {
		wc_deprecated_function( 'WC_BIS_Install::is_update_background_process_running', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * True if a CLI update is running.
	 *
	 * @return boolean
	 */
	public static function is_update_cli_process_running() {
		wc_deprecated_function( 'WC_BIS_Install::is_update_cli_process_running', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * Update DB version to current.
	 *
	 * @param  string $version
	 */
	public static function update_db_version( $version = null ) {
		wc_deprecated_function( 'WC_BIS_Install::update_db_version', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * Get list of DB update callbacks.
	 *
	 * @return array
	 */
	public static function get_db_update_callbacks() {
		wc_deprecated_function( 'WC_BIS_Install::get_db_update_callbacks', '9.9.0' );
		// Migrated to WC core's install routine.
	}

	/**
	 * Show row meta on the plugin screen.
	 *
	 * @param   mixed $links
	 * @param   mixed $file
	 * @return  array
	 */
	public static function plugin_row_meta( $links, $file ) {
		wc_deprecated_function( 'WC_BIS_Install::plugin_row_meta', '9.9.0' );
		// Migrated to WC core's install routine.
	}
}

WC_BIS_Install::init();
