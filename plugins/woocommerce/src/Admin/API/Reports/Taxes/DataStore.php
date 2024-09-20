<?php
/**
 * API\Reports\Taxes\DataStore class file.
 */

namespace Automattic\WooCommerce\Admin\API\Reports\Taxes;

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Admin\API\Reports\DataStore as ReportsDataStore;
use Automattic\WooCommerce\Admin\API\Reports\DataStoreInterface;
use Automattic\WooCommerce\Admin\API\Reports\TimeInterval;
use Automattic\WooCommerce\Admin\API\Reports\SqlQuery;
use Automattic\WooCommerce\Admin\API\Reports\Cache as ReportsCache;
use WC_Tax;

/**
 * API\Reports\Taxes\DataStore.
 */
class DataStore extends ReportsDataStore implements DataStoreInterface {

	/**
	 * Table used to get the data.
	 *
	 * @override ReportsDataStore::$table_name
	 *
	 * @var string
	 */
	protected static $table_name = 'wc_order_tax_lookup';

	/**
	 * Cache identifier.
	 *
	 * @override ReportsDataStore::$cache_key
	 *
	 * @var string
	 */
	protected $cache_key = 'taxes';

	/**
	 * Mapping columns to data type to return correct response types.
	 *
	 * @override ReportsDataStore::$column_types
	 *
	 * @var array
	 */
	protected $column_types = array(
		'tax_rate_id'  => 'intval',
		'name'         => 'strval',
		'tax_rate'     => 'floatval',
		'priority'     => 'intval',
		'total_tax'    => 'floatval',
		'order_tax'    => 'floatval',
		'shipping_tax' => 'floatval',
		'orders_count' => 'intval',
	);

	/**
	 * Data store context used to pass to filters.
	 *
	 * @override ReportsDataStore::$context
	 *
	 * @var string
	 */
	protected $context = 'taxes';

	/**
	 * Assign report columns once full table name has been assigned.
	 *
	 * @override ReportsDataStore::assign_report_columns()
	 */
	protected function assign_report_columns() {
		global $wpdb;
		$table_name = self::get_db_table_name();

		// Using wp_woocommerce_tax_rates table limits the result to only the existing tax rates and
		// omits the historical records which differs from the purpose of wp_wc_order_tax_lookup table.
		// So in order to get the same data present in wp_woocommerce_tax_rates without breaking the
		// API contract the values are now retrieved from wp_woocommerce_order_items and wp_woocommerce_order_itemmeta.
		// And given that country, state and priority are not separate columns within the woocommerce_order_items,
		// a split to order_item_name column value is required to separate those values. This is not ideal,
		// but given this query is paginated and cached, then it is not a big deal. There is always room for
		// improvements here.
		$this->report_columns = array(
			'tax_rate_id'  => "{$table_name}.tax_rate_id",
			'name'         => "{$table_name}.tax_rate_name as name",
			'tax_rate'     => "{$table_name}.tax_rate",
			'priority'     => "{$table_name}.tax_rate_priority as priority",
			'total_tax'    => "SUM({$table_name}.total_tax) as total_tax",
			'order_tax'    => "SUM({$table_name}.order_tax) as order_tax",
			'shipping_tax' => "SUM({$table_name}.shipping_tax) as shipping_tax",
			'orders_count' => "COUNT( DISTINCT {$table_name}.order_id ) as orders_count",
		);
	}

	/**
	 * Set up all the hooks for maintaining and populating table data.
	 */
	public static function init() {
		add_action( 'woocommerce_analytics_delete_order_stats', array( __CLASS__, 'sync_on_order_delete' ), 15 );
	}

	/**
	 * Updates the database query with parameters used for Taxes report: categories and order status.
	 *
	 * @see Automattic\WooCommerce\Admin\API\Reports\Taxes\Stats\DataStore::update_sql_query_params()
	 * @param array $query_args Query arguments supplied by the user.
	 */
	protected function add_sql_query_params( $query_args ) {
		$order_tax_lookup_table = self::get_db_table_name();

		$this->add_time_period_sql_params( $query_args, $order_tax_lookup_table );
		$this->get_limit_sql_params( $query_args );
		$this->add_order_by_sql_params( $query_args );

		$order_status_filter = $this->get_status_subquery( $query_args );

		if ( isset( $query_args['taxes'] ) && ! empty( $query_args['taxes'] ) ) {
			$allowed_taxes = self::get_filtered_ids( $query_args, 'taxes' );
			$this->subquery->add_sql_clause( 'where', "AND {$order_tax_lookup_table}.tax_rate_id IN ({$allowed_taxes})" );
		}

		if ( $order_status_filter ) {
			$this->subquery->add_sql_clause( 'where', "AND ( {$order_status_filter} )" );
		}
	}

	/**
	 * Returns order status subquery to be used in WHERE SQL query, based on query arguments from the user.
	 *
	 * @param array  $query_args Parameters supplied by the user.
	 * @param string $operator   AND or OR, based on match query argument.
	 * @return string
	 */
	protected function get_status_subquery( $query_args, $operator = 'AND' ) {
		$order_tax_lookup_table = self::get_db_table_name();

		$subqueries        = array();
		$excluded_statuses = array();

		if ( isset( $query_args['status_is'] ) && is_array( $query_args['status_is'] ) && count( $query_args['status_is'] ) > 0 ) {
			$allowed_statuses = esc_sql( $query_args['status_is'] );
			if ( $allowed_statuses ) {
				$subqueries[] = "{$order_tax_lookup_table}.order_status IN ( '" . implode( "','", $allowed_statuses ) . "' )";
			}
		}

		if ( isset( $query_args['status_is_not'] ) && is_array( $query_args['status_is_not'] ) && count( $query_args['status_is_not'] ) > 0 ) {
			$excluded_statuses = esc_sql( $query_args['status_is_not'] );
		}

		if ( ( ! isset( $query_args['status_is'] ) || empty( $query_args['status_is'] ) )
			&& ( ! isset( $query_args['status_is_not'] ) || empty( $query_args['status_is_not'] ) )
		) {
			$excluded_statuses = $this->get_excluded_report_order_statuses();
		}

		if ( $excluded_statuses ) {
			$subqueries[] = "{$order_tax_lookup_table}.order_status NOT IN ( '" . implode( "','", $excluded_statuses ) . "' )";
		}

		return implode( " $operator ", $subqueries );
	}

	/**
	 * Get the default query arguments to be used by get_data().
	 * These defaults are only partially applied when used via REST API, as that has its own defaults.
	 *
	 * @override ReportsDataStore::get_default_query_vars()
	 *
	 * @return array Query parameters.
	 */
	public function get_default_query_vars() {
		$defaults            = parent::get_default_query_vars();
		$defaults['orderby'] = 'tax_rate_id';
		$defaults['taxes']   = array();

		return $defaults;
	}

	/**
	 * Returns the report data based on normalized parameters.
	 * Will be called by `get_data` if there is no data in cache.
	 *
	 * @override ReportsDataStore::get_noncached_data()
	 *
	 * @see get_data
	 * @param array $query_args Query parameters.
	 * @return stdClass|WP_Error Data object `{ totals: *, intervals: array, total: int, pages: int, page_no: int }`, or error.
	 */
	public function get_noncached_data( $query_args ) {
		global $wpdb;

		$this->initialize_queries();

		$table_name = self::get_db_table_name();
		$data 		= (object) array(
			'data'    => array(),
			'total'   => 0,
			'pages'   => 0,
			'page_no' => 0,
		);

		$this->add_sql_query_params( $query_args );
		$params = $this->get_limit_params( $query_args );

		if ( isset( $query_args['taxes'] ) && is_array( $query_args['taxes'] ) && ! empty( $query_args['taxes'] ) ) {
			$total_results = count( $query_args['taxes'] );
			$total_pages   = (int) ceil( $total_results / $params['per_page'] );
		} else {
			$db_records_count = (int) $wpdb->get_var(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- cache ok, DB call ok, unprepared SQL ok.
				"SELECT COUNT(*) FROM ( {$this->subquery->get_query_statement()} ) AS tt"
			);

			$total_results = $db_records_count;
			$total_pages   = (int) ceil( $db_records_count / $params['per_page'] );

			if ( $query_args['page'] < 1 || $query_args['page'] > $total_pages ) {
				return $data;
			}
		}

		$this->subquery->clear_sql_clause( 'select' );
		$this->subquery->add_sql_clause( 'select', $this->selected_columns( $query_args ) );
		$this->subquery->add_sql_clause( 'order_by', $this->get_sql_clause( 'order_by' ) );
		$this->subquery->add_sql_clause( 'limit', $this->get_sql_clause( 'limit' ) );

		$taxes_query = $this->subquery->get_query_statement();

		$tax_data = $wpdb->get_results(
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- cache ok, DB call ok, unprepared SQL ok.
			$taxes_query,
			ARRAY_A
		);

		if ( null === $tax_data ) {
			return $data;
		}

		$tax_data = array_map( array( $this, 'cast_numbers' ), $tax_data );
		$data     = (object) array(
			'data'    => $tax_data,
			'total'   => $total_results,
			'pages'   => $total_pages,
			'page_no' => (int) $query_args['page'],
		);

		return $data;
	}

	/**
	 * Maps ordering specified by the user to columns in the database/fields in the data.
	 *
	 * @override ReportsDataStore::normalize_order_by()
	 *
	 * @param string $order_by Sorting criterion.
	 * @return string
	 */
	protected function normalize_order_by( $order_by ) {
		if ( 'tax_code' === $order_by ) {
			return "tax_rate_name";
		} elseif ( 'rate' === $order_by ) {
			return 'tax_rate';
		}

		return $order_by;
	}

	/**
	 * Create or update an entry in the wc_order_tax_lookup table for an order.
	 *
	 * @param int $order_id Order ID.
	 * @return int|bool Returns -1 if order won't be processed, or a boolean indicating processing success.
	 */
	public static function sync_order_taxes( $order_id ) {
		global $wpdb;

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return -1;
		}

		$tax_items   = $order->get_items( 'tax' );
		$num_updated = 0;

		foreach ( $tax_items as $tax_item ) {
			$tax_rate = WC_Tax::_get_tax_rate( $tax_item->get_rate_id(), OBJECT );
			$result   = $wpdb->replace(
				self::get_db_table_name(),
				array(
					'order_id'          => $order->get_id(),
					'date_created'      => $order->get_date_created( 'edit' )->date( TimeInterval::$sql_datetime_format ),
					'tax_rate_id'       => $tax_item->get_rate_id(),
					'shipping_tax'      => $tax_item->get_shipping_tax_total(),
					'order_tax'         => $tax_item->get_tax_total(),
					'total_tax'         => (float) $tax_item->get_tax_total() + (float) $tax_item->get_shipping_tax_total(),
					'tax_rate_name'     => $tax_item->get_name(),
					'tax_rate'		    => $tax_item->get_rate_percent(),
					'tax_rate_priority' => $tax_rate->tax_rate_priority,
					'order_status' 		=> $order->get_status(),
				),
				array(
					'%d',
					'%s',
					'%d',
					'%f',
					'%f',
					'%f',
					'%s',
					'%s',
					'%s',
					'%s',
				)
			);

			/**
			 * Fires when tax's reports are updated.
			 *
			 * @param int $tax_rate_id Tax Rate ID.
			 * @param int $order_id    Order ID.
			 */
			do_action( 'woocommerce_analytics_update_tax', $tax_item->get_rate_id(), $order->get_id() );

			// Sum the rows affected. Using REPLACE can affect 2 rows if the row already exists.
			$num_updated += 2 === intval( $result ) ? 1 : intval( $result );
		}

		return ( count( $tax_items ) === $num_updated );
	}

	/**
	 * Clean taxes data when an order is deleted.
	 *
	 * @param int $order_id Order ID.
	 */
	public static function sync_on_order_delete( $order_id ) {
		global $wpdb;

		$wpdb->delete( self::get_db_table_name(), array( 'order_id' => $order_id ) );

		/**
		 * Fires when tax's reports are removed from database.
		 *
		 * @param int $tax_rate_id Tax Rate ID.
		 * @param int $order_id    Order ID.
		 */
		do_action( 'woocommerce_analytics_delete_tax', 0, $order_id );

		ReportsCache::invalidate();
	}

	/**
	 * Initialize query objects.
	 */
	protected function initialize_queries() {
		$this->clear_all_clauses();

		$table_name     = self::get_db_table_name();
		$this->subquery = new SqlQuery( $this->context . '_subquery' );

		$this->subquery->add_sql_clause( 'select', "{$table_name}.tax_rate_id" );
		$this->subquery->add_sql_clause( 'from', $table_name );
		$this->subquery->add_sql_clause( 'group_by', "{$table_name}.tax_rate_name, {$table_name}.tax_rate, {$table_name}.tax_rate_id" );
	}
}
