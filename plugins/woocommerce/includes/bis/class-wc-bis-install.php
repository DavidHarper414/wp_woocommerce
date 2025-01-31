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
	 * DB updates and callbacks that need to be run per version.
	 *
	 * @var array
	 */
	private static $db_updates = array(
		'1.1.0' => array(
			'wc_bis_update_110_main',
			'wc_bis_update_110_db_version',
		),
	);

	/**
	 * Background update class.
	 *
	 * @var WC_BIS_Background_Updater
	 */
	private static $background_updater;

	/**
	 * Current plugin version.
	 *
	 * @var string
	 */
	private static $current_version;

	/**
	 * Current DB version.
	 *
	 * @var string
	 */
	private static $current_db_version;

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
		add_action( 'init', array( __CLASS__, 'define_updating_constant' ) );
		add_action( 'init', array( __CLASS__, 'maybe_install' ) );
		add_action( 'admin_init', array( __CLASS__, 'maybe_update' ) );

		// Show row meta on the plugin screen.
		add_filter( 'plugin_row_meta', array( __CLASS__, 'plugin_row_meta' ), 10, 2 );

		// Get PB plugin and DB versions.
		self::$current_version    = get_option( 'wc_bis_version', null );
		self::$current_db_version = get_option( 'wc_bis_db_version', null );

		include_once WC_BIS_ABSPATH . 'includes/class-wc-bis-background-updater.php';
	}

	/**
	 * Init background updates.
	 */
	public static function init_background_updater() {
		self::$background_updater = new WC_BIS_Background_Updater();
	}

	/**
	 * Installation needed?
	 *
	 * @return boolean
	 */
	private static function must_install() {
		if ( is_null( self::$current_version ) ) {
			return true;
		}

		return version_compare( self::$current_version, WC_BIS()->get_plugin_version(), '<' );
	}

	/**
	 * Installation possible?
	 *
	 * @return boolean
	 */
	private static function can_install() {
		return ( ! defined( 'DOING_AJAX' ) || ! DOING_AJAX ) && ! defined( 'IFRAME_REQUEST' ) && ! self::is_installing();
	}

	/**
	 * Check version and run the installer if necessary.
	 */
	public static function maybe_install() {
		if ( self::can_install() && self::must_install() ) {
			self::install();
		}
	}

	/**
	 * Is currently installing?
	 *
	 * @return boolean
	 */
	private static function is_installing() {
		return 'yes' === get_transient( 'wc_bis_installing' );
	}

	/**
	 * DB update needed?
	 *
	 * @return boolean
	 */
	private static function must_update() {

		if ( is_null( self::$current_db_version ) ) {
			return false;
		}

		$db_update_versions = array_keys( self::$db_updates );

		if ( empty( $db_update_versions ) ) {
			return false;
		}

		$db_version_target = end( $db_update_versions );

		return version_compare( self::$current_db_version, $db_version_target, '<' );
	}

	/**
	 * DB update possible?
	 *
	 * @return boolean
	 */
	private static function can_update() {
		return ( self::$is_install_request || ( self::can_install() && current_user_can( 'manage_woocommerce' ) ) ) && version_compare( self::$current_db_version, WC_BIS()->get_plugin_version( true ), '<' );
	}

	/**
	 * Run the updater if triggered.
	 */
	public static function maybe_update() {

		if ( ! empty( $_GET['force_wc_bis_db_update'] ) && isset( $_GET['_wc_bis_admin_nonce'] ) && wp_verify_nonce( wc_clean( $_GET['_wc_bis_admin_nonce'] ), 'wc_bis_force_db_update_nonce' ) ) {

			if ( self::can_update() && self::must_update() ) {
				self::force_update();
			}
		} elseif ( ! empty( $_GET['trigger_wc_bis_db_update'] ) && isset( $_GET['_wc_bis_admin_nonce'] ) && wp_verify_nonce( wc_clean( $_GET['_wc_bis_admin_nonce'] ), 'wc_bis_trigger_db_update_nonce' ) ) {

			if ( self::can_update() && self::must_update() ) {
				self::trigger_update();
			}
		} else {

			// Queue upgrade tasks.
			if ( self::can_update() ) {

				if ( ! is_blog_installed() ) {
					return;
				}

				// Plugin data exists - queue upgrade tasks.
				if ( self::must_update() ) {

					if ( ! class_exists( 'WC_BIS_Admin_Notices' ) ) {
						require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-notices.php';
					}

					// Add 'update' notice and save early -- saving on the 'shutdown' action will fail if a chained request arrives before the 'shutdown' hook fires.
					WC_BIS_Admin_Notices::add_maintenance_notice( 'update' );
					WC_BIS_Admin_Notices::save_notices();

					if ( self::auto_update_enabled() ) {
						self::update();
					} else {
						delete_transient( 'wc_bis_installing' );
						delete_option( 'wc_bis_update_init' );
					}

					// Nothing found - this is a new install :)
				} else {
					self::update_db_version();
				}
			}
		}
	}

	/**
	 * If the DB version is out-of-date, a DB update must be in progress: define a 'WC_BIS_UPDATING' constant.
	 */
	public static function define_updating_constant() {
		if ( self::is_update_pending() && ! defined( 'WC_BIS_TESTING' ) ) {
			wc_maybe_define_constant( 'WC_BIS_UPDATING', true );
		}
	}

	/**
	 * Install PB.
	 */
	public static function install() {

		if ( ! is_blog_installed() ) {
			return;
		}

		// Running for the first time? Set a transient now. Used in 'can_install' to prevent race conditions.
		set_transient( 'wc_bis_installing', 'yes', 10 );

		// Set a flag to indicate we're installing in the current request.
		self::$is_install_request = true;

		// Create tables.
		self::create_tables();

		// Create events.
		self::create_events();

		// Update plugin version - once set, 'maybe_install' will not call 'install' again.
		self::update_version();

		if ( ! class_exists( 'WC_BIS_Admin_Notices' ) ) {
			require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-notices.php';
		}

		if ( is_null( self::$current_version ) ) {
			// Add dismissible welcome notice.
			WC_BIS_Admin_Notices::add_maintenance_notice( 'welcome' );
		}

		// Run a loopback test after every update. Will only run once if successful.
		WC_BIS_Admin_Notices::add_maintenance_notice( 'loopback' );

		// Run an AS test after every update. Will only run once if successful.
		if ( method_exists( WC(), 'queue' ) ) {
			WC_BIS_Admin_Notices::add_maintenance_notice( 'queue' );
		}

		// Flush rules to include our new endpoint.
		flush_rewrite_rules();
	}

	/**
	 * Set up the database tables which the plugin needs to function.
	 */
	private static function create_tables() {
		global $wpdb;
		$wpdb->hide_errors();
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( self::get_schema() );
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
	private static function get_schema() {
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
	 * Update WC BIS version to current.
	 */
	private static function update_version() {
		delete_option( 'wc_bis_version' );
		add_option( 'wc_bis_version', WC_BIS()->get_plugin_version() );
	}

	/**
	 * Push all needed DB updates to the queue for processing.
	 */
	private static function update() {

		if ( ! is_object( self::$background_updater ) ) {
			self::init_background_updater();
		}

		$update_queued = false;

		foreach ( self::$db_updates as $version => $update_callbacks ) {

			if ( version_compare( self::$current_db_version, $version, '<' ) ) {

				$update_queued = true;
				WC_BIS()->log( sprintf( 'Updating to version %s.', $version ), 'info', 'wc_bis_db_updates' );

				foreach ( $update_callbacks as $update_callback ) {
					WC_BIS()->log( sprintf( '- Queuing %s callback.', $update_callback ), 'info', 'wc_bis_db_updates' );
					self::$background_updater->push_to_queue( $update_callback );
				}
			}
		}

		if ( $update_queued ) {

			// Define 'WC_BIS_UPDATING' constant.
			wc_maybe_define_constant( 'WC_BIS_UPDATING', true );

			// Keep track of time.
			delete_option( 'wc_bis_update_init' );
			add_option( 'wc_bis_update_init', gmdate( 'U' ) );

			// Dispatch.
			self::$background_updater->save()->dispatch();
		}
	}

	/**
	 * Is auto-updating enabled?
	 *
	 * @return boolean
	 */
	public static function auto_update_enabled() {
		return apply_filters( 'wc_bis_auto_update_db', true );
	}

	/**
	 * Trigger DB update.
	 */
	public static function trigger_update() {
		self::update();
		wp_safe_redirect( admin_url() );
		exit;
	}

	/**
	 * Force re-start the update cron if everything else fails.
	 */
	public static function force_update() {

		if ( ! is_object( self::$background_updater ) ) {
			self::init_background_updater();
		}

		/**
		 * Updater cron action.
		 */
		do_action( self::$background_updater->get_cron_hook_identifier() );
		wp_safe_redirect( admin_url() );
		exit;
	}

	/**
	 * Updates plugin DB version when all updates have been processed.
	 */
	public static function update_complete() {

		WC_BIS()->log( 'Data update complete.', 'info', 'wc_bis_db_updates' );
		self::update_db_version();
		delete_option( 'wc_bis_update_init' );
		wp_cache_flush();
	}

	/**
	 * True if a DB update is pending.
	 *
	 * @return boolean
	 */
	public static function is_update_pending() {
		return self::must_update();
	}

	/**
	 * True if a DB update was started but not completed.
	 *
	 * @return boolean
	 */
	public static function is_update_incomplete() {
		return false !== get_option( 'wc_bis_update_init', false );
	}


	/**
	 * True if a DB update is in progress.
	 *
	 * @return boolean
	 */
	public static function is_update_queued() {
		return self::$background_updater->is_update_queued();
	}

	/**
	 * True if an update process is running.
	 *
	 * @return boolean
	 */
	public static function is_update_process_running() {
		return self::is_update_cli_process_running() || self::is_update_background_process_running();
	}

	/**
	 * True if an update background process is running.
	 *
	 * @return boolean
	 */
	public static function is_update_background_process_running() {
		return self::$background_updater->is_process_running();
	}

	/**
	 * True if a CLI update is running.
	 *
	 * @return boolean
	 */
	public static function is_update_cli_process_running() {
		return false !== get_transient( 'wc_bis_update_cli_init', false );
	}

	/**
	 * Update DB version to current.
	 *
	 * @param  string $version
	 */
	public static function update_db_version( $version = null ) {

		$version = is_null( $version ) ? WC_BIS()->get_plugin_version() : $version;

		// Remove suffixes.
		$version = WC_BIS()->get_plugin_version( true, $version );

		delete_option( 'wc_bis_db_version' );
		add_option( 'wc_bis_db_version', $version );

		WC_BIS()->log( sprintf( 'Database version is %s.', get_option( 'wc_bis_db_version', 'unknown' ) ), 'info', 'wc_bis_db_updates' );
	}

	/**
	 * Get list of DB update callbacks.
	 *
	 * @return array
	 */
	public static function get_db_update_callbacks() {
		return self::$db_updates;
	}

	/**
	 * Show row meta on the plugin screen.
	 *
	 * @param   mixed $links
	 * @param   mixed $file
	 * @return  array
	 */
	public static function plugin_row_meta( $links, $file ) {

		if ( WC_BIS()->get_plugin_basename() == $file ) {
			$row_meta = array(
				'docs'    => '<a href="' . WC_BIS()->get_resource_url( 'docs-contents' ) . '">' . __( 'Documentation', 'woocommerce-back-in-stock-notifications' ) . '</a>',
				'support' => '<a href="' . WC_BIS()->get_resource_url( 'ticket-form' ) . '">' . __( 'Support', 'woocommerce-back-in-stock-notifications' ) . '</a>',
			);

			return array_merge( $links, $row_meta );
		}

		return $links;
	}
}

WC_BIS_Install::init();
