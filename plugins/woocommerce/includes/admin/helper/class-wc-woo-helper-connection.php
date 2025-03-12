<?php
/**
 * A utility class to handle WooCommerce.com connection.
 *
 * @class WC_Woo_Update_Manager_Plugin
 * @package WooCommerce\Admin\Helper
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_Helper_Plugin Class
 *
 * Contains the logic to manage WooCommerce.com Helper Connection.
 */
class WC_Woo_Helper_Connection {
	/**
	 * Check if the Woo Update Manager plugin is active.
	 *
	 * @return bool
	 */
	public static function get_connection_url_notice(): string {
		$auth     = WC_Helper_Options::get( 'auth' );
		$url      = rtrim( $auth['url'], '/' );
		$home_url = rtrim( home_url(), '/' );
		if ( empty( $url ) || $home_url === $url ) {
			return '';
		}

		return sprintf(
		/* translators: 1: WooCommerce.com connection URL, 2: home URL */
			__( 'Your site is connected to WooCommerce.com under %1$s, but the home URL of the site is %2$s. Please reconnect your site to WooCommerce.com', 'woocommerce' ),
			$url,
			$home_url
		);
	}
}
