<?php
/**
 * WooCommerce WMB Subscriptions Helper
 *
 * @package WooCommerce\Admin\Helper
 */

declare(strict_types=1);

defined( 'ABSPATH' ) || exit;

/**
 * WC_Helper_WMB_Subscriptions Class
 *
 * Handles WMB subscription specific functionality.
 */
class WC_Helper_WMB_Subscriptions {
	/**
	 * Check if a subscription is a WMB subscription.
	 *
	 * @param array $subscription The subscription to check.
	 * @return bool True if the subscription is a WMB subscription.
	 */
	public static function is_wmb_subscription( $subscription ) {
		return isset( $subscription['is_wmb'] ) && $subscription['is_wmb'];
	}
}
