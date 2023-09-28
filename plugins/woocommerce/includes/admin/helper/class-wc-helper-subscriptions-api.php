<?php
/**
 * WooCommerce Admin Helper - React admin interface
 *
 * @package WooCommerce\Admin\Helper
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_Helper_Subscriptions_API
 *
 * The main entry-point for all things related to the Marketplace Subscriptions API.
 * The Subscriptions API manages WooCommerce.com Subscriptions.
 */
class WC_Helper_Subscriptions_API {

	/**
	 * Loads the class, runs on init
	 *
	 * @return void
	 */
	public static function load() {
		add_filter( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
	}

	/**
	 * Registers the REST routes for the Marketplace Subscriptions API.
	 * These endpoints are used by the Marketplace Subscriptions React UI.
	 */
	public static function register_rest_routes() {
		register_rest_route(
			'wc/v3',
			'/marketplace/subscriptions',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_subscriptions' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
			)
		);
		register_rest_route(
			'wc/v3',
			'/marketplace/refresh',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'refresh' ),
				'permission_callback' => array( __CLASS__, 'get_permission' ),
			)
		);
	}

	/**
	 * The Extensions page can only be accessed by users with the manage_woocommerce
	 * capability. So the API mimics that behavior.
	 */
	public static function get_permission() {
		return current_user_can( 'manage_woocommerce' );
	}

	/**
	 * Fetch subscriptions from WooCommerce.com and serve them
	 * as JSON.
	 */
	public static function get_subscriptions() {
		$subscriptions = WC_Helper::get_subscription_list_data();
		wp_send_json(
			array_values(
				$subscriptions
			)
		);
	}

	/**
	 * Refresh account and subscriptions from WooCommerce.com and serve subscriptions
	 * as JSON.
	 */
	public static function refresh() {
		WC_Helper::refresh_helper_subscriptions();
		self::get_subscriptions();
	}
}

WC_Helper_Subscriptions_API::load();
