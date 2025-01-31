<?php
/**
 * Class WC_BIS_Notifications
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Migrated from the BIS main plugin class.
 *
 * @class    WC_BIS_Notifications
 * @version  x.x.x
 */
class WC_BIS_Notifications {

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	public $version = '2.0.6';

	/**
	 * Min required WC version.
	 *
	 * @var string
	 */
	private $wc_min_version = '8.2.0';

	/**
	 * Sync Stock Controller.
	 *
	 * @var WC_BIS_Sync
	 */
	public $sync;

	/**
	 * The DB helper.
	 *
	 * @var WC_BIS_DB
	 */
	public $db;

	/**
	 * Templates Controller.
	 *
	 * @var WC_BIS_Templates
	 */
	public $templates;

	/**
	 * Account Controller.
	 *
	 * @var WC_BIS_Account
	 */
	public $account;

	/**
	 * Product Controller.
	 *
	 * @var WC_BIS_Product
	 */
	public $product;

	/**
	 * Emails controller.
	 *
	 * @var WC_BIS_Emails
	 */
	public $emails;

	/**
	 * The single instance of the class.
	 *
	 * @var WC_BIS_Notifications
	 */
	protected static $_instance = null;

	/**
	 * Main WC_Back_In_Stock instance. Ensures only one instance is loaded or can be loaded - @see 'WC_BIS()'.
	 *
	 * @static
	 * @return  WC_BIS_Notifications
	 */
	public static function instance() {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}
		return self::$_instance;
	}

	/**
	 * Cloning is forbidden.
	 */
	public function __clone() {
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Foul!', 'woocommerce-back-in-stock-notifications' ), '1.0.0' );
	}

	/**
	 * Unserializing instances of this class is forbidden.
	 */
	public function __wakeup() {
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Foul!', 'woocommerce-back-in-stock-notifications' ), '1.0.0' );
	}

	/**
	 * Make stuff.
	 */
	protected function __construct() {
		// Entry point.
		add_action( 'plugins_loaded', array( $this, 'initialize_plugin' ), 9 );
	}

	/**
	 * Plugin URL getter.
	 *
	 * @return string
	 */
	public function get_plugin_url() {
		return untrailingslashit( plugins_url( '/', __FILE__ ) );
	}

	/**
	 * Plugin path getter.
	 *
	 * @return string
	 */
	public function get_plugin_path() {
		return untrailingslashit( plugin_dir_path( __FILE__ ) );
	}

	/**
	 * Plugin base path name getter.
	 *
	 * @return string
	 */
	public function get_plugin_basename() {
		return plugin_basename( __FILE__ );
	}

	/**
	 * Plugin version getter.
	 *
	 * @param  boolean $base
	 * @param  string  $version
	 * @return string
	 */
	public function get_plugin_version( $base = false, $version = '' ) {

		$version = $version ? $version : $this->version;

		if ( $base ) {
			$version_parts = explode( '-', $version );
			$version       = count( $version_parts ) > 1 ? $version_parts[0] : $version;
		}

		return $version;
	}

	/**
	 * Define constants if not present.
	 *
	 * @return boolean
	 */
	protected function maybe_define_constant( $name, $value ) {
		if ( ! defined( $name ) ) {
			define( $name, $value );
		}
	}

	/**
	 * Indicates whether the plugin is fully initialized.
	 *
	 * @return boolean
	 */
	public function is_plugin_initialized() {
		return isset( WC_BIS()->account );
	}

	/**
	 * Fire in the hole!
	 */
	public function initialize_plugin() {

		$this->define_constants();
		$this->maybe_create_store();

		// WC version sanity check.
		if ( ! function_exists( 'WC' ) || version_compare( WC()->version, $this->wc_min_version ) < 0 ) {
			/* translators: %s: WC min version */
			$notice = sprintf( __( 'WooCommerce Back In Stock Notifications requires at least WooCommerce <strong>%s</strong>.', 'woocommerce-back-in-stock-notifications' ), $this->wc_min_version );
			require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-notices.php';
			WC_BIS_Admin_Notices::add_notice( $notice, 'error' );

			return false;
		}

		// PHP version check.
		if ( ! function_exists( 'phpversion' ) || version_compare( phpversion(), '7.4.0', '<' ) ) {
			/* translators: %1$s: Version %, %2$s: Update PHP doc URL */
			$notice = sprintf(
				__(
					'WooCommerce Back In Stock Notifications requires at least PHP <strong>%1$s</strong>. Learn <a href="%2$s">how to update PHP</a>.',
					'woocommerce-back-in-stock-notifications'
				),
				'7.4.0',
				$this->get_resource_url( 'update-php' )
			);
			require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-notices.php';
			WC_BIS_Admin_Notices::add_notice( $notice, 'error' );
		}

		$this->includes();

		// Instantiate global singletons.
		$this->sync      = new WC_BIS_Sync();
		$this->db        = new WC_BIS_DB();
		$this->templates = new WC_BIS_Templates();
		$this->account   = new WC_BIS_Account();
		$this->product   = new WC_BIS_Product();
		$this->emails    = new WC_BIS_Emails();

		// Load translations hook.
		add_action( 'init', array( $this, 'load_translation' ) );
	}

	/**
	 * Constants.
	 */
	public function define_constants() {
		$this->maybe_define_constant( 'WC_BIS_VERSION', $this->version );
		$this->maybe_define_constant( 'WC_BIS_SUPPORT_URL', 'https://woocommerce.com/my-account/marketplace-ticket-form/' );
		$this->maybe_define_constant( 'WC_BIS_ABSPATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
	}

	/**
	 * A simple dumb datastore for sharing information accross our plugins.
	 *
	 * @return void
	 */
	private function maybe_create_store() {
		if ( ! isset( $GLOBALS['sw_store'] ) ) {
			$GLOBALS['sw_store'] = array();
		}
	}

	/**
	 * Includes.
	 */
	public function includes() {

		// Functions.
		require_once WC_BIS_ABSPATH . 'includes/wc-bis-functions.php';

		// Helpers.
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-helpers.php';

		// Install and DB.
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-install.php';
		require_once WC_BIS_ABSPATH . 'includes/db/class-wc-bis-db.php';
		require_once WC_BIS_ABSPATH . 'includes/db/class-wc-bis-notifications-db.php';
		require_once WC_BIS_ABSPATH . 'includes/db/class-wc-bis-activity-db.php';

		// Compatibility.
		require_once WC_BIS_ABSPATH . 'includes/compatibility/class-wc-bis-compatibility.php';

		// Models.
		require_once WC_BIS_ABSPATH . 'includes/data-stores/class-wc-bis-notification-data.php';
		require_once WC_BIS_ABSPATH . 'includes/data-stores/class-wc-bis-activity-data.php';

		// Contollers.
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-notices.php';
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-product.php';
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-sync.php';
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-sync-tasks.php';

		// Templates.
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-templates.php';

		// Front-end AJAX handlers.
		// require_once  WC_BIS_ABSPATH . 'includes/class-wc-bis-ajax.php' ;

		// Account.
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-account.php';

		// Emails.
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-emails.php';

		// REST API support.
		require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-rest-api.php';

		// Admin includes.
		if ( is_admin() ) {
			$this->admin_includes();
		}

		// WP-CLI includes.
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			require_once WC_BIS_ABSPATH . 'includes/class-wc-bis-cli.php';
		}
	}

	/**
	 * Admin & AJAX functions and hooks.
	 */
	public function admin_includes() {

		// Admin notices handling.
		require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-notices.php';

		// Admin functions and hooks.
		require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin.php';
		require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-dashboard-page.php';
		require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-notifications-page.php';
		require_once WC_BIS_ABSPATH . 'includes/admin/class-wc-bis-admin-activity-page.php';

		// List Tables.
		require_once WC_BIS_ABSPATH . 'includes/admin/list-tables/class-wc-bis-admin-list-table-notifications.php';
		require_once WC_BIS_ABSPATH . 'includes/admin/list-tables/class-wc-bis-admin-list-table-activity.php';
	}

	/**
	 * Load textdomain.
	 */
	public function load_translation() {
		load_plugin_textdomain( 'woocommerce-back-in-stock-notifications', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
		// Subscribe to automated translations.
		add_filter( 'woocommerce_translations_updates_for_' . basename( __FILE__, '.php' ), '__return_true' );
	}

	/**
	 * Log using 'WC_Logger' class.
	 *
	 * @param  string $message
	 * @param  string $level
	 * @param  string $context
	 */
	public function log( $message, $level, $context ) {
		$logger = wc_get_logger();
		$logger->log( $level, $message, array( 'source' => $context ) );
	}

	/**
	 * Handle plugin activation process.
	 *
	 * @since  1.2.0
	 *
	 * @return void
	 */
	public function on_activation() {
		// Add daily maintenance process.
		if ( ! wp_next_scheduled( 'wc_bis_daily' ) ) {
			wp_schedule_event( time() + 10, 'daily', 'wc_bis_daily' );
		}
	}

	/**
	 * Handle plugin deactivation process.
	 *
	 * @since  1.2.0
	 *
	 * @return void
	 */
	public function on_deactivation() {
		// Clear daily maintenance process.
		wp_clear_scheduled_hook( 'wc_bis_daily' );
	}

	/**
	 * Get screen ids.
	 */
	public function get_screen_ids() {
		$screens = array();

		if ( version_compare( WC()->version, '7.3.0' ) < 0 ) {
			$prefix = sanitize_title( __( 'WooCommerce', 'woocommerce' ) );
		} else {
			$prefix = 'woocommerce';
		}

		$screens[] = $prefix . '_page_bis_dashboard';
		$screens[] = $prefix . '_page_bis_notifications';
		$screens[] = $prefix . '_page_bis_activity';

		return $screens;
	}

	/**
	 * Checks if the current admin screen is the Dashboard.
	 *
	 * @return  bool
	 */
	public function is_dashboard() {

		global $current_screen;

		$screen_id = $current_screen ? $current_screen->id : '';
		if ( wc_bis_get_formatted_screen_id( 'woocommerce_page_bis_dashboard' ) === $screen_id ) {
			return true;
		}

		return false;
	}

	/**
	 * Checks if the current admin screen belongs to extension.
	 *
	 * @param   array $extra_screens_to_check (Optional)
	 * @return  bool
	 */
	public function is_current_screen( $extra_screens_to_check = array() ) {

		global $current_screen;

		$screen_id = $current_screen ? $current_screen->id : '';

		if ( in_array( $screen_id, $this->get_screen_ids(), true ) ) {
			return true;
		}

		if ( ! empty( $extra_screens_to_check ) && in_array( $screen_id, $extra_screens_to_check ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Returns URL to a doc or support resource.
	 *
	 * @param  string $handle
	 * @return string
	 */
	public function get_resource_url( $handle ) {

		$resource = false;

		if ( 'update-php' === $handle ) {
			$resource = 'https://woocommerce.com/document/how-to-update-your-php-version/';
		} elseif ( 'docs-contents' === $handle ) {
			$resource = 'https://woocommerce.com/document/back-in-stock-notifications/';
		} elseif ( 'guide' === $handle ) {
			$resource = 'https://woocommerce.com/document/back-in-stock-notifications/store-owners-guide/';
		} elseif ( 'updating' === $handle ) {
			$resource = 'https://woocommerce.com/document/how-to-update-woocommerce/';
		} elseif ( 'ticket-form' === $handle ) {
			$resource = WC_BIS_SUPPORT_URL;
		}

		return $resource;
	}
}

/**
 * Returns the main instance of WC_BIS_Notifications to prevent the need to use globals.
 *
 * @return  WC_BIS_Notifications
 */
function WC_BIS() {
	return WC_BIS_Notifications::instance();
}

WC_BIS();

register_activation_hook( __FILE__, array( WC_BIS(), 'on_activation' ) );
register_deactivation_hook( __FILE__, array( WC_BIS(), 'on_deactivation' ) );
