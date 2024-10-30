<?php
/**
 * FilterDataProvider class file.
 */

declare(strict_types=1);

namespace Automattic\WooCommerce\Internal\ProductFilters;

use WC_Cache_Helper;

defined( 'ABSPATH' ) || exit;

/**
 * Class for filter counts.
 */
class Cache {
	const CACHE_GROUP = 'product_filters';

	/**
	 * Get filter data transient key.
	 *
	 * @param string $id   The id of entity.
	 * @param array  $args Data to be hashed for an unique key.
	 */
	public function get_transient_key( string $id, ...$args ) {
		return sprintf(
			'wc_%s_%s_%s',
			self::CACHE_GROUP,
			$id,
			md5( wp_json_encode( $args ) )
		);
	}

	/**
	 * Get cached filter data.
	 *
	 * @param string $key Transient key.
	 */
	public function get_transient( string $key ) {
		$cache             = get_transient( $key );
		$transient_version = WC_Cache_Helper::get_transient_version( self::CACHE_GROUP );

		if ( empty( $cache['version'] ) ||
			$transient_version !== $cache['version']
		) {
			return null;
		}

		return $cache['value'];
	}

	/**
	 * Set the cache with transient version to invalidate all at once when needed.
	 *
	 * @param string $key   Transient key.
	 * @param mixed  $value Value to set.
	 */
	public function set_transient( string $key, $value ) {
		$transient_version = WC_Cache_Helper::get_transient_version( self::CACHE_GROUP );
		$transient_value   = array(
			'version' => $transient_version,
			'value'   => $value,
		);

		$result = set_transient( $key, $transient_value );

		return $result;
	}

	/**
	 * Get the key for object cache.
	 *
	 * @param string $id ID of the data being cached.
	 */
	public function get_object_cache_key( string $id ) {
		return WC_Cache_Helper::get_cache_prefix( self::CACHE_GROUP ) . $id;
	}
}
