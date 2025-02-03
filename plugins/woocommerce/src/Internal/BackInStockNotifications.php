<?php
/**
 * Back In Stock Notifications class file.
 */

declare( strict_types = 1);

namespace Automattic\WooCommerce\Internal;

use Automattic\WooCommerce\Packages;

defined( 'ABSPATH' ) || exit;

/**
 * Class to initiate Back In Stock Notifications functionality in core.
 */
class BackInStockNotifications {

	/**
	 * Class initialization
	 *
	 * @internal
	 */
	final public static function init() {

		if ( ! self::is_enabled_for_rollout() ) {
			return;
		}

		include_once WC_ABSPATH . '/includes/bis/class-wc-bis-notifications.php';
		//...

		if ( wc_current_theme_is_fse_theme() ) {
			// ...
		}

		if ( is_admin() ) {
			// ...
		}
	}

	/**
	 * As of WooCommerce 9.8, Back In Stock Notifications is merged, but disabled for all users.
	 * As of WooCommerce 9.9, Back In Stock Notifications is enabled for 5% of users.
	 * As of WooCommerce 10.0, Back In Stock Notifications is enabled for all users.
	 *
	 * Can be disabled via option `update_option( 'wc_feature_woocommerce_bis_enabled', 'no' )`,
	 * even when this method returns true.
	 *
	 * See also \Automattic\WooCommerce\Packages::get_enabled_packages.
	 *
	 * @return bool
	 */
	public static function is_enabled_for_rollout() {
		return true;
	}

	/**
	 * If the feature is actually enabled, not just for rollout.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return self::is_enabled_for_rollout() && Packages::is_package_enabled( 'BackInStockNotifications' );
	}

	/**
	 * If WooCommerce Back In Stock Notifications gets activated forcibly, without WooCommerce active
	 * (e.g. via '--skip-plugins'), remove WooCommerce Back In Stock Notifications initialization functions
	 * early on in the 'plugins_loaded' timeline.
	 *
	 * This is called from \Automattic\WooCommerce\Packages::prepare_packages.
	 */
	public static function prepare() {

		if ( ! self::is_enabled_for_rollout() ) {
			return;
		}

		if ( function_exists( 'wc_bis_get_notifications' ) ) {
			//TODO: check if this works.
			remove_action( 'plugins_loaded', array( \WC_BIS_Notifications::instance(), 'initialize_plugin' ), 9 );
		}

	}
}
