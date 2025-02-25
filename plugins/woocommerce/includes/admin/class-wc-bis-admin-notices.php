<?php
/**
 * WC_BIS_Admin_Notices class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin notices handling.
 *
 * @class    WC_BIS_Admin_Notices
 * @version  1.7.2
 */
class WC_BIS_Admin_Notices {

	/**
	 * Notices presisting on the next request.
	 *
	 * @var array
	 */
	public static $meta_box_notices = array();

	/**
	 * Notices displayed on the current request.
	 *
	 * @var array
	 */
	public static $admin_notices = array();

	/**
	 * Maintenance notices displayed on every request until cleared.
	 *
	 * @var array
	 */
	public static $maintenance_notices = array();

	/**
	 * Dismissible notices displayed on the current request.
	 *
	 * @var array
	 */
	public static $dismissed_notices = array();

	/**
	 * Constructor.
	 */
	public static function init() {
		wc_deprecated_function( __METHOD__, '9.9.0' );
	}

	/**
	 * Add a notice/error.
	 *
	 * @since 1.7.0 Added the args.actions parameter.
	 *
	 * @param  string  $text
	 * @param  mixed   $args
	 * @param  boolean $save_notice
	 */
	public static function add_notice( $text, $args, $save_notice = false ) {
		wc_deprecated_function( __METHOD__, '9.9.0' );
		return false;
	}

	/**
	 * Get a setting for a notice type.
	 *
	 * @param  string $notice_name
	 * @param  string $key
	 * @param  mixed  $default
	 * @return array
	 */
	public static function get_notice_option( $notice_name, $key, $default = null ) {
		wc_deprecated_function( __METHOD__, '9.9.0' );
		return array();
	}

	/**
	 * Set a setting for a notice type.
	 *
	 * @param  string $notice_name
	 * @param  string $key
	 * @param  mixed  $value
	 * @return array
	 */
	public static function set_notice_option( $notice_name, $key, $value ) {
		wc_deprecated_function( __METHOD__, '9.9.0' );
		return array();
	}

	/**
	 * Checks if a maintenance notice is visible.
	 *
	 * @param  string $notice_name
	 * @return boolean
	 */
	public static function is_maintenance_notice_visible( $notice_name ) {
		return in_array( $notice_name, self::$maintenance_notices );
	}

	/**
	 * Checks if a dismissible notice has been dismissed in the past.
	 *
	 * @param  string $notice_name
	 * @return boolean
	 */
	public static function is_dismissible_notice_dismissed( $notice_name ) {
		return in_array( $notice_name, self::$dismissed_notices );
	}

	/**
	 * Save notices to the DB.
	 */
	public static function save_notices() {
		wc_deprecated_function( __METHOD__, '9.9.0' );
	}

	/**
	 * Show any stored error messages.
	 */
	public static function output_notices() {
		wc_deprecated_function( __METHOD__, '9.9.0' );
	}

	/**
	 * Show maintenance notices.
	 */
	public static function hook_maintenance_notices() {
		wc_deprecated_function( __METHOD__, '9.9.0' );
	}

	/**
	 * Add a dimissible notice/error.
	 *
	 * @param  string $text
	 * @param  mixed  $args
	 */
	public static function add_dismissible_notice( $text, $args ) {
		wc_deprecated_function( __METHOD__, '9.9.0' );
	}

	/**
	 * Remove a dismissible notice.
	 *
	 * @param  string $notice_name
	 */
	public static function remove_dismissible_notice( $notice_name ) {
		wc_deprecated_function( __METHOD__, '9.9.0' );
		return false;
	}

	/**
	 * Add a maintenance notice to be displayed.
	 *
	 * @param  string $notice_name
	 */
	public static function add_maintenance_notice( $notice_name ) {
		wc_deprecated_function( __METHOD__, '9.9.0' );
		return false;
	}

	/**
	 * Remove a maintenance notice.
	 *
	 * @param  string $notice_name
	 */
	public static function remove_maintenance_notice( $notice_name ) {
		wc_deprecated_function( __METHOD__, '9.9.0' );
		return false;
	}

	/**
	 * Add 'welcome' notice.
	 */
	public static function welcome_notice() {
		wc_deprecated_function( __METHOD__, '9.9.0' );
	}

	/**
	 * Dismisses a notice. Dismissible maintenance notices cannot be dismissed forever.
	 *
	 * @param  string $notice
	 */
	public static function dismiss_notice( $notice ) {
		wc_deprecated_function( __METHOD__, '9.9.0' );
	}
}
