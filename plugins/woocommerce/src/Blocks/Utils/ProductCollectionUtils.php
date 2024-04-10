<?php
namespace Automattic\WooCommerce\Blocks\Utils;

use WP_Query;

/**
 * Utility methods used for the Product Collection block.
 * {@internal This class and its methods are not intended for public use.}
 */
class ProductCollectionUtils {
	/**
	 * Prepare and execute a query for the Product Collection block.
	 * This method is used by the Product Collection block and the No Results block.
	 *
	 * @param WP_Block $block Block instance.
	 */
	public static function prepare_and_execute_query( $block ) {
		$page_key = isset( $block->context['queryId'] ) ? 'query-' . $block->context['queryId'] . '-page' : 'query-page';
		// phpcs:ignore WordPress.Security.NonceVerification
		$page = empty( $_GET[ $page_key ] ) ? 1 : (int) $_GET[ $page_key ];

		// Use global query if needed.
		$use_global_query = ( isset( $block->context['query']['inherit'] ) && $block->context['query']['inherit'] );
		if ( $use_global_query ) {
			global $wp_query;
			$query = clone $wp_query;
		} else {
			$query_args = build_query_vars_from_query_block( $block, $page );
			$query      = new WP_Query( $query_args );
		}

		return $query;
	}

	/**
	 * Helper function that constructs a WP_Query args array from
	 * a Product Collection or global query.
	 *
	 * @param WP_Block $block Block instance.
	 * @param int      $page  Current query's page.
	 *
	 * @return array Returns the constructed WP_Query arguments.
	 */
	public static function get_query_vars( $block, $page ) {
		if ( ! empty( $block->context['query'] ) && ! $block->context['query']['inherit'] ) {
			return build_query_vars_from_query_block( $block, $page );
		}

		global $wp_query;
		return array_filter( $wp_query->query_vars );
	}

	/**
	 * Remove query array from tax or meta query by searching for arrays that
	 * contain exact key => value pair.
	 *
	 * @param array  $queries tax_query or meta_query.
	 * @param string $key     Array key to search for.
	 * @param mixed  $value   Value to compare with search result.
	 *
	 * @return array
	 */
	public static function remove_query_array( $queries, $key, $value ) {
		if ( ! is_array( $queries ) || empty( $queries ) ) {
			return $queries;
		}

		foreach ( $queries as $query_key => $query ) {
			if ( isset( $query[ $key ] ) && $query[ $key ] === $value ) {
				unset( $queries[ $query_key ] );
			}

			if ( isset( $query['relation'] ) || ! isset( $query[ $key ] ) ) {
				$queries[ $query_key ] = self::remove_query_array( $query, $key, $value );
			}
		}

		return self::remove_empty_array_recursive( $queries );
	}

	/**
	 * Remove falsy item from array, recursively.
	 *
	 * @param array $array The input array to filter.
	 */
	private static function remove_empty_array_recursive( $array ) {
		$array = array_filter( $array );
		foreach ( $array as $key => $item ) {
			if ( is_array( $item ) ) {
				$array[ $key ] = self::remove_empty_array_recursive( $item );
			}
		}
		return $array;
	}

	/**
	 * Translate WP Post instance to context.
	 * 
	 * Possible contexts:
	 * - page
	 * - post
	 * - product
	 * - product-archive
	 * - checkout
	 * - catalog
	 * - cart
	 * - checkout
	 * - order
	 *
	 * @param WP_Post $post The Post instance.
	 *
	 * @return string|false Returns the context. False for unknown or invalid context.
	 */
	public static function parse_editor_location_context( $post ) {

		if ( ! $post instanceof \WP_Post ) {
			return false;
		}

		$post_type = $post->post_type;
		if ( ! in_array( $post_type, array( 'post', 'page', 'wp_template', 'wp_template_part' ), true ) ) {
			return false;
		}

		$context = 'post';

		if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) ) {

			$name = $post->post_name;
			if ( false !== strpos( $name, 'single-product' ) ) {
				$context = 'product';			
			} elseif ( false !== strpos( $name, 'taxonomy-' ) ) { // Including the '-' in the check to avoid false positives.
				$taxonomy           = str_replace( 'taxonomy-', '', $name );
				$product_taxonomies = get_object_taxonomies( 'product', 'names' );
				if ( in_array( $taxonomy, $product_taxonomies, true ) ) {
					$context = 'product-archive';
				}
			} elseif(  'page-cart' === $name ) {
				$context = 'cart';
			} elseif(  'page-checkout' === $name ) {
				$context = 'checkout';
			} elseif( in_array( $name, array( 'archive-product' ) ) ) {
				$context = 'catalog';
			} elseif( in_array( $name, array( 'order-confirmation' ) ) ) {
				$context = 'order';
			}
		}

		if ( 'page' === $post_type ) {
			$context = 'page';
		}

		return $context;
	}

	/**
	 * Parse the collection query filters from the query attributes.
	 */
	public static function get_event_data( $block) {

		$query_attrs = $block['attrs']['query'] ?? array();
		$filters = array(
			'on-sale' => 0,
			'stock-status' => 0,
			'handpicked' => 0,
			'keyword' => 0,
			'attributes' => 0,
			'taxonomy' => 0,
			'featured' => 0,
			'created' => 0,
			'price' => 0,
		);

		if ( ! empty( $query_attrs['woocommerceOnSale'])){
			$filters['on-sale'] = 1;
		}

		if ( ! empty( $query_attrs['woocommerceStockStatus'])){
			$filters['stock-status'] = 1;
		}

		if ( ! empty( $query_attrs['woocommerceAttributes'])){
			$filters['attributes'] = 1;
		}

		if ( ! empty( $query_attrs['timeFrame'])){
			$filters['created'] = 1;
		}

		if ( ! empty( $query_attrs['taxQuery'])){
			$filters['taxonomy'] = 1;
		}

		if ( ! empty( $query_attrs['woocommerceHandPickedProducts'])){
			$filters['handpicked'] = 1;
		}

		if ( ! empty( $query_attrs['search'])){
			$filters['keyword'] = 1;
		}

		if ( true === $query_attrs['featured'] ){
			$filters['featured'] = 1;
		}

		return $filters;
	}
}
