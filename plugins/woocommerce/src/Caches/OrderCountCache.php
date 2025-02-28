<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Caches;

use Automattic\WooCommerce\Caching\CacheException;
use Automattic\WooCommerce\Caching\ObjectCache;
use Automattic\WooCommerce\Enums\OrderStatus;
use Automattic\WooCommerce\Internal\DataStores\Orders\OrdersTableDataStore;
use Automattic\WooCommerce\Utilities\OrderUtil;

/**
 * A class to cache counts for various order statuses.
 */
class OrderCountCache {

	/**
	 * Default value for the duration of the objects in the cache, in seconds
	 * (may not be used depending on the cache engine used WordPress cache implementation).
	 *
	 * @var int
	 */
	protected $expiration = DAY_IN_SECONDS;

	/**
	 * Cache prefix.
	 *
	 * @var string
	 */
	private $cache_prefix = 'order-count';

	/**
	 * Validate an object before caching it.
	 *
	 * @param array|object $object The object to validate.
	 * @return string[]|null An array of error messages, or null if the object is valid.
	 */
	protected function validate( $array ): ?array {
		$valid_statuses   = $this->get_valid_statuses();
		$invalid_statuses = array_diff( array_keys( $array ), $valid_statuses );

		if ( ! empty( $invalid_statuses ) ) {
			return array( sprintf( __( '%s is not one of: %s', 'woocommerce' ), implode( ',', $invalid_statuses ), implode( ', ', $valid_statuses ) ) );
		}

		return null;
	}

	/**
	 * Get valid statuses.
	 *
	 * @return string[]
	 */
	private function get_valid_statuses() {
		return array_merge(
			array_keys( wc_get_order_statuses() ),
			array_keys( get_post_stati() ),
		);
	}

	/**
	 * Get the default statuses.
	 *
	 * @return string[]
	 */
	private function get_default_statuses() {
		return array_merge(
			array_keys( wc_get_order_statuses() ),
			array( OrderStatus::TRASH )
		);
	}

	/**
	 * Add an object to the cache, or update an already cached object.
	 *
	 * @param object|array    $object The object to be cached.
	 * @param int|string|null $id Id of the object to be cached, if null, get_object_id will be used to get it.
	 * @param int             $expiration Expiration of the cached data in seconds from the current time, or DEFAULT_EXPIRATION to use the default value.
	 * @return bool True on success, false on error.
	 * @throws CacheException Invalid parameter, or null id was passed and get_object_id returns null too.
	 */
	public function set( $order_type, $order_status, int $value ): bool {
		$cache_key = $this->get_cache_key( $order_type, $order_status );
		return wp_cache_set( $cache_key, $value, '', $this->expiration );
	}

	/**
	 * Get the cache key for a given order type and status.
	 *
	 * @param string $order_type The type of order.
	 * @param string $order_status The status of the order.
	 * @return string The cache key.
	 */
	private function get_cache_key( $order_type, $order_status ) {
		return $this->cache_prefix . '_' . $order_type . '_' . $order_status;
	}

	/**
	 * Retrieve a cached object, and if no object is cached with the given id,
	 * try to get one via get_from_datastore method or by supplying a callback and then cache it.
	 *
	 * If you want to provide a callable but still use the default expiration value,
	 * pass "ObjectCache::DEFAULT_EXPIRATION" as the second parameter.
	 *
	 * @param int|string    $id The id of the object to retrieve.
	 * @param int           $expiration Expiration of the cached data in seconds from the current time, used if an object is retrieved from datastore and cached.
	 * @param callable|null $get_from_datastore_callback Optional callback to get the object if it's not cached, it must return an object/array or null.
	 * @return object|array|null Cached object, or null if it's not cached and can't be retrieved from datastore or via callback.
	 * @throws CacheException Invalid id parameter.
	 */
	public function get( $order_type, $order_statuses = array() ) {
		if ( empty( $order_statuses ) ) {
			$order_statuses = $this->get_default_statuses();
		}

		$cache_keys = array_map( function( $order_statuses ) use ( $order_type ) {
			return $this->get_cache_key( $order_type, $order_statuses );
		}, $order_statuses );

		$cache_values  = wp_cache_get_multiple( $cache_keys );
		$status_values = array();

		foreach ( $cache_values as $key => $value ) {
			// Return null for the entire cache if any of the default statuses are not found.
			if ( $value === false ) {
				return null;
			}

			$order_status                   = str_replace( $this->get_cache_key( $order_type, '' ), '', $key );
			$status_values[ $order_status ] = $value;
		}

		return $status_values;
	}

	/**
	 * Increment the cache value for a given order status.
	 *
	 * @param string $order_type The type of order.
	 * @param string $order_status The status of the order.
	 * @param int $offset The amount to increment by.
	 * @return int The new value of the cache.
	 */
	public function increment( $order_type, $order_status, $offset = 1 ) {
		$cache_key = $this->get_cache_key( $order_type, $order_status );
		return wp_cache_incr( $cache_key, $offset );
	}

	/**
	 * Decrement the cache value for a given order status.
	 *
	 * @param string $order_type The type of order.
	 * @param string $order_status The status of the order.
	 * @param int $offset The amount to decrement by.
	 * @return int The new value of the cache.
	 */
	public function decrement( $order_type, $order_status, $offset = 1 ) {
		$cache_key = $this->get_cache_key( $order_type, $order_status );
		return wp_cache_decr( $cache_key, $offset );
	}

	/**
	 * Check if the cache has a value for a given order type and status.
	 *
	 * @param string $order_type The type of order.
	 * @param string $order_status The status of the order.
	 * @return bool True if the cache has a value, false otherwise.
	 */
	public function is_cached( $order_type, $order_status ) {
		$cache_key = $this->get_cache_key( $order_type, $order_status );
		return wp_cache_get( $cache_key ) !== false;
	}
}
