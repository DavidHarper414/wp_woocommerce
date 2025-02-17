<?php
/**
 * Class WC_BIS_Notifications
 */

// Exit if accessed directly.
use Automattic\Jetpack\Constants;

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
	public $version;

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
		$this->version = Constants::get_constant( 'WC_VERSION' );

		// Entry point.
		add_action( 'plugins_loaded', array( $this, 'initialize_plugin' ), 9 );
	}

	/**
	 * Plugin URL getter.
	 *
	 * @return string
	 */
	public function get_plugin_url() {
		wc_deprecated_function( 'WC_BIS_Notifications::get_plugin_url', '9.9.0' );
		return untrailingslashit( plugins_url( '/', __FILE__ ) );
	}

	/**
	 * Plugin path getter.
	 *
	 * @return string
	 */
	public function get_plugin_path() {
		wc_deprecated_function( 'WC_BIS_Notifications::get_plugin_path', '9.9.0' );
		return untrailingslashit( plugin_dir_path( __FILE__ ) );
	}

	/**
	 * Plugin base path name getter.
	 *
	 * @return string
	 */
	public function get_plugin_basename() {
		wc_deprecated_function( 'WC_BIS_Notifications::get_plugin_basename', '9.9.0' );
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
		wc_deprecated_function( 'WC_BIS_Notifications::get_plugin_version', 9.9, 'Constants::get_constant( \'WC_VERSION\' )' );

		$version = $version ? $version : $this->version;

		if ( $base ) {
			$version_parts = explode( '-', $version );
			$version       = count( $version_parts ) > 1 ? $version_parts[0] : $version;
		}

		return $version;
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

		$this->maybe_create_store();

		$this->includes();

		// Instantiate global singletons.
		$this->sync      = new WC_BIS_Sync();
		$this->db        = new WC_BIS_DB();
		$this->templates = new WC_BIS_Templates();
		$this->account   = new WC_BIS_Account();
		$this->product   = new WC_BIS_Product();
		$this->emails    = new WC_BIS_Emails();

	}

	/**
	 * Constants.
	 */
	public function define_constants() {
		wc_deprecated_function( 'WC_BIS_Notifications::define_constants', '9.9.0' );
//		$this->maybe_define_constant( 'WC_BIS_VERSION', $this->version );
//		$this->maybe_define_constant( 'WC_BIS_SUPPORT_URL', 'https://woocommerce.com/my-account/marketplace-ticket-form/' );
//		$this->maybe_define_constant( 'WC_ABSPATH', trailingslashit( plugin_dir_path( __FILE__ ) ) );
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
		require_once WC_ABSPATH . 'includes/bis/wc-bis-functions.php';

		// Helpers.
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-helpers.php';

		// Install and DB.
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-install.php';
		require_once WC_ABSPATH . 'includes/bis/db/class-wc-bis-db.php';
		require_once WC_ABSPATH . 'includes/bis/db/class-wc-bis-notifications-db.php';
		require_once WC_ABSPATH . 'includes/bis/db/class-wc-bis-activity-db.php';

		// Compatibility.
		require_once WC_ABSPATH . 'includes/bis/compatibility/class-wc-bis-compatibility.php';

		// Models.
		require_once WC_ABSPATH . 'includes/data-stores/class-wc-bis-notification-data.php';
		require_once WC_ABSPATH . 'includes/data-stores/class-wc-bis-activity-data.php';

		// Contollers.
		require_once WC_ABSPATH . 'includes/admin/class-wc-bis-notices.php';
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-product.php';
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-sync.php';
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-sync-tasks.php';

		// Templates.
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-templates.php';

		// Front-end AJAX handlers.
		// require_once  WC_ABSPATH . 'includes/class-wc-bis-ajax.php' ;

		// Account.
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-account.php';

		// Emails.
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-emails.php';

		// REST API support.
		require_once WC_ABSPATH . 'includes/bis/class-wc-bis-rest-api.php';

		// Admin includes.
		if ( is_admin() ) {
			$this->admin_includes();
		}

	}

	/**
	 * Admin & AJAX functions and hooks.
	 */
	public function admin_includes() {

		// Admin notices handling.
		require_once WC_ABSPATH . 'includes/admin/class-wc-bis-admin-notices.php';

		// Admin functions and hooks.
		require_once WC_ABSPATH . 'includes/admin/class-wc-bis-admin.php';
		require_once WC_ABSPATH . 'includes/admin/class-wc-bis-admin-dashboard-page.php';
		require_once WC_ABSPATH . 'includes/admin/class-wc-bis-admin-notifications-page.php';
		require_once WC_ABSPATH . 'includes/admin/class-wc-bis-admin-activity-page.php';

		// List Tables.
		require_once WC_ABSPATH . 'includes/admin/list-tables/class-wc-bis-admin-list-table-notifications.php';
		require_once WC_ABSPATH . 'includes/admin/list-tables/class-wc-bis-admin-list-table-activity.php';
	}

	/**
	 * Load textdomain.
	 */
	public function load_translation() {
		wc_deprecated_function( 'WC_BIS_Notifications::load_translation', '9.9.0' );

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

if ( ! function_exists( 'WC_BIS' ) ) {
	/**
	 * Returns the main instance of WC_BIS_Notifications to prevent the need to use globals.
	 *
	 * @return  WC_BIS_Notifications
	 */
	function WC_BIS() {
		return WC_BIS_Notifications::instance();
	}

	// If the function already existed, it's from the standalone plugin. Avoid calling init of the plugin.
	// This should only be skipped in the first request after WC gets updated to a version with BIS included
	// and during which the standalone plugin gets deactivated.
	WC_BIS();
}

