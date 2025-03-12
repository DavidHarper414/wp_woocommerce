<?php
/**
 * WC_BIS_Helpers class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.2.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Helper Functions.
 *
 * @class    WC_BIS_Helpers
 * @version  1.2.0
 */
class WC_BIS_Helpers {

	/**
	 * Runtime cache for simple storage.
	 *
	 * @var array
	 */
	public static $cache = array();

	/**
	 * Simple runtime cache getter.
	 *
	 * @param  string $key
	 * @param  string $group_key
	 * @return mixed
	 */
	public static function cache_get( $key, $group_key = '' ) {

		$value = null;

		if ( $group_key ) {

			$group_id = self::cache_get( $group_key . '_id' );
			if ( $group_id ) { // ΒΟΟΜ
				$value = self::cache_get( $group_key . '_' . $group_id . '_' . $key );
			}
		} elseif ( isset( self::$cache[ $key ] ) ) {
			$value = self::$cache[ $key ];
		}

		return $value;
	}

	/**
	 * Simple runtime cache setter.
	 *
	 * @param  string $key
	 * @param  mixed  $value
	 * @param  string $group_key
	 * @return void
	 */
	public static function cache_set( $key, $value, $group_key = '' ) {

		if ( $group_key ) {

			$group_id = self::cache_get( $group_key . '_id' );
			if ( null === $group_id ) {
				$group_id = md5( $group_key );
				self::cache_set( $group_key . '_id', $group_id );
			}

			self::$cache[ $group_key . '_' . $group_id . '_' . $key ] = $value;

		} else {
			self::$cache[ $key ] = $value;
		}
	}

	/**
	 * Simple runtime cache unsetter.
	 *
	 * @param  string $key
	 * @param  mixed  $value
	 * @param  string $group_key
	 * @return void
	 */
	public static function cache_delete( $key, $group_key = '' ) {

		if ( $group_key ) {

			$group_id = self::cache_get( $group_key . '_id' );
			if ( $group_id ) {
				self::cache_delete( $group_key . '_' . $group_id . '_' . $key );
			}
		} elseif ( isset( self::$cache[ $key ] ) ) {
			unset( self::$cache[ $key ] );
		}
	}

	/**
	 * Simple runtime group cache invalidator.
	 *
	 * @since  5.7.4
	 *
	 * @param  string $key
	 * @param  string $group_key
	 * @param  mixed  $value
	 * @return void
	 */
	public static function cache_invalidate( $group_key = '' ) {

		if ( '' === $group_key ) {
			self::$cache = array();
		} else {
			$group_id = self::cache_get( $group_key . '_id' );
			if ( $group_id ) {
				$group_id = md5( $group_key . '_' . $group_id );
				self::cache_set( $group_key . '_id', $group_id );
			}
		}
	}
}
