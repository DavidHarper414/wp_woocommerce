<?php
/**
 * WC_Reports_Revenue_Store class file.
 *
 * @package WooCommerce/Classes
 * @since 3.5.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC Product Data Store: Stored in CPT.
 * //extends WC_Data_Store_WP.
 *
 * @version  3.5.0
 */
class WC_Reports_Data_Store {

	/**
	 * Cache group for the reports.
	 *
	 * @var string
	 */
	protected $cache_group = 'reports';

	/**
	 * Time out for the cache.
	 *
	 * @var int
	 */
	protected $cache_timeout = 3600;

	/**
	 * Table used as a data store for this report.
	 *
	 * @var string
	 */
	const TABLE_NAME = '';

	/**
	 * Mapping columns to data type to return correct response types.
	 *
	 * @var array
	 */
	protected $column_types = array();

	/**
	 * SQL columns to select in the db query.
	 *
	 * @var array
	 */
	protected $report_columns = array();

	/**
	 * Returns string to be used as cache key for the data.
	 *
	 * @param array $params Query parameters.
	 * @return string
	 */
	protected function get_cache_key( $params ) {
		// TODO: this is not working in PHP 5.2 (but revenue class has static methods, so it cannot use object property).
		return 'woocommerce_' . $this::TABLE_NAME . '_' . md5( wp_json_encode( $params ) );
	}

	/**
	 * Casts strings returned from the database to appropriate data types for output.
	 *
	 * @param array $array Associative array of values extracted from the database.
	 * @return array|WP_Error
	 */
	protected function cast_numbers( $array ) {
		$retyped_array = array();
		$column_types  = apply_filters( 'woocommerce_rest_reports_column_types', $this->column_types, $array );
		foreach ( $array as $column_name => $value ) {
			if ( isset( $column_types[ $column_name ] ) ) {
				$retyped_array[ $column_name ] = $column_types[ $column_name ]( $value );
			} else {
				$retyped_array[ $column_name ] = $value;
			}
		}
		return $retyped_array;
	}

	/**
	 * Returns a list of columns selected by the query_args formatted as a comma separated string.
	 *
	 * @param array $query_args User-supplied options.
	 * @return string
	 */
	protected function selected_columns( $query_args ) {
		$selections = $this->report_columns;

		if ( isset( $query_args['fields'] ) && is_array( $query_args['fields'] ) ) {
			$keep = array();
			foreach ( $query_args['fields'] as $field ) {
				if ( isset( $selections[ $field ] ) ) {
					$keep[ $field ] = $selections[ $field ];
				}
			}
			$selections = implode( ', ', $keep );
		} else {
			$selections = implode( ', ', $selections );
		}
		return $selections;
	}

	/**
	 * Get the order statuses used when calculating reports.
	 *
	 * @return array
	 */
	protected static function get_report_order_statuses() {
		return apply_filters( 'woocommerce_reports_order_statuses', array( 'completed', 'processing', 'on-hold' ) );
	}

	/**
	 * Maps order status provided by the user to the one used in the database.
	 *
	 * @param string $status Order status.
	 * @return string
	 */
	protected function normalize_order_status( $status ) {
		$status = trim( $status );
		return 'wc-' . $status;
	}

	/**
	 * Normalizes order_by clause to match to SQL query.
	 *
	 * @param string $order_by Order by option requeste by user.
	 * @return string
	 */
	protected function normalize_order_by( $order_by ) {
		if ( 'date' === $order_by ) {
			return 'time_interval';
		}

		return $order_by;
	}

	/**
	 * Updates start and end dates for intervals so that they represent intervals' borders, not times when data in db were recorded.
	 *
	 * E.g. if there are db records for only Tuesday and Thursday this week, the actual week interval is [Mon, Sun], not [Tue, Thu].
	 *
	 * @param DateTime $datetime_start Start date.
	 * @param DateTime $datetime_end End date.
	 * @param string   $time_interval Time interval, e.g. day, week, month.
	 * @param array    $intervals Array of intervals extracted from SQL db.
	 */
	protected function update_interval_boundary_dates( $datetime_start, $datetime_end, $time_interval, &$intervals ) {
		foreach ( $intervals as $key => $interval ) {
			$datetime = new DateTime( $interval['datetime_anchor'] );

			$prev_start           = WC_Reports_Interval::iterate( $datetime, $time_interval, true );
			$prev_start_timestamp = (int) $prev_start->format( 'U' ) + 1;
			$prev_start->setTimestamp( $prev_start_timestamp );
			if ( $datetime_start ) {
				$start_datetime                  = new DateTime( $datetime_start );
				$intervals[ $key ]['date_start'] = ( $prev_start < $start_datetime ? $start_datetime : $prev_start )->format( 'Y-m-d H:i:s' );
			} else {
				$intervals[ $key ]['date_start'] = $prev_start->format( 'Y-m-d H:i:s' );
			}

			$next_end           = WC_Reports_Interval::iterate( $datetime, $time_interval );
			$next_end_timestamp = (int) $next_end->format( 'U' ) - 1;
			$next_end->setTimestamp( $next_end_timestamp );
			if ( $datetime_end ) {
				$end_datetime                  = new DateTime( $datetime_end );
				$intervals[ $key ]['date_end'] = ( $next_end > $end_datetime ? $end_datetime : $next_end )->format( 'Y-m-d H:i:s' );
			} else {
				$intervals[ $key ]['date_end'] = $next_end->format( 'Y-m-d H:i:s' );
			}

			$intervals[ $key ]['interval'] = $time_interval;
		}
	}

	/**
	 * Change structure of intervals to form a correct response.
	 *
	 * @param array $intervals Time interval, e.g. day, week, month.
	 */
	protected function create_interval_subtotals( &$intervals ) {
		foreach ( $intervals as $key => $interval ) {
			// Move intervals result to subtotals object.
			$intervals[ $key ] = array(
				'interval'       => $interval['interval'],
				'date_start'     => $interval['date_start'],
				'date_start_gmt' => $interval['date_start'],
				'date_end'       => $interval['date_end'],
				'date_end_gmt'   => $interval['date_end'],
			);

			unset( $interval['interval'] );
			unset( $interval['date_start'] );
			unset( $interval['date_end'] );
			unset( $interval['datetime_anchor'] );
			unset( $interval['time_interval'] );
			$intervals[ $key ]['subtotals'] = (object) $this->cast_numbers( $interval );
		}
	}

	/**
	 * Fills WHERE clause of SQL request for 'Totals' section of data response based on user supplied parameters.
	 *
	 * @param array $query_args Parameters supplied by the user.
	 * @return array
	 */
	protected function get_time_period_sql_params( $query_args ) {
		$sql_query = array(
			'from_clause'  => '',
			'where_clause' => '',
		);

		if ( isset( $query_args['before'] ) && '' !== $query_args['before'] ) {
			$datetime                   = new DateTime( $query_args['before'] );
			$datetime_str               = $datetime->format( WC_Reports_Interval::$sql_datetime_format );
			$sql_query['where_clause'] .= " AND date_created <= '$datetime_str'";

		}

		if ( isset( $query_args['after'] ) && '' !== $query_args['after'] ) {
			$datetime                   = new DateTime( $query_args['after'] );
			$datetime_str               = $datetime->format( WC_Reports_Interval::$sql_datetime_format );
			$sql_query['where_clause'] .= " AND date_created >= '$datetime_str'";
		}

		return $sql_query;
	}

	/**
	 * Fills LIMIT clause of SQL request based on user supplied parameters.
	 *
	 * @param array $query_args Parameters supplied by the user.
	 * @return array
	 */
	protected function get_limit_sql_params( $query_args ) {
		$sql_query['per_page'] = get_option( 'posts_per_page' );
		if ( isset( $query_args['per_page'] ) && is_numeric( $query_args['per_page'] ) ) {
			$sql_query['per_page'] = (int) $query_args['per_page'];
		}

		$sql_query['offset'] = 0;
		if ( isset( $query_args['page'] ) ) {
			$sql_query['offset'] = ( (int) $query_args['page'] - 1 ) * $sql_query['per_page'];
		}

		$sql_query['limit'] = "LIMIT {$sql_query['offset']}, {$sql_query['per_page']}";
		return $sql_query;
	}

	/**
	 * Fills ORDER BY clause of SQL request based on user supplied parameters.
	 *
	 * @param array $query_args Parameters supplied by the user.
	 * @return array
	 */
	protected function get_order_by_sql_params( $query_args ) {
		$sql_query['order_by_clause'] = '';
		if ( isset( $query_args['orderby'] ) ) {
			$sql_query['order_by_clause'] = $this->normalize_order_by( $query_args['orderby'] );
		}

		if ( isset( $query_args['order'] ) ) {
			$sql_query['order_by_clause'] .= ' ' . $query_args['order'];
		} else {
			$sql_query['order_by_clause'] .= ' DESC';
		}

		return $sql_query;
	}

	/**
	 * Fills FROM and WHERE clauses of SQL request for 'Intervals' section of data response based on user supplied parameters.
	 *
	 * @param array $query_args Parameters supplied by the user.
	 * @return array
	 */
	protected function get_intervals_sql_params( $query_args ) {
		$intervals_query = array(
			'from_clause'  => '',
			'where_clause' => '',
		);

		$intervals_query = array_merge( $intervals_query, $this->get_time_period_sql_params( $query_args ) );

		if ( isset( $query_args['interval'] ) && '' !== $query_args['interval'] ) {
			$interval                         = $query_args['interval'];
			$intervals_query['select_clause'] = WC_Reports_Interval::mysql_datetime_format( $interval );
		}

		$intervals_query = array_merge( $intervals_query, $this->get_limit_sql_params( $query_args ) );

		$intervals_query = array_merge( $intervals_query, $this->get_order_by_sql_params( $query_args ) );

		return $intervals_query;
	}

	/**
	 * Returns an array of products belonging to given categories.
	 *
	 * @param array $categories List of categories IDs.
	 * @return array|stdClass
	 */
	protected function get_products_by_cat_ids( $categories ) {
		$product_categories = get_categories( array(
			'hide_empty' => 0,
			'taxonomy'   => 'product_cat',
		) );
		$cat_slugs          = array();
		$categories         = array_flip( $categories );
		foreach ( $product_categories as $product_cat ) {
			if ( key_exists( $product_cat->cat_ID, $categories ) ) {
				$cat_slugs[] = $product_cat->slug;
			}
		}
		$args = array(
			'category' => $cat_slugs,
			'limit'    => -1,
		);
		return wc_get_products( $args );
	}

	/**
	 * Returns ids of allowed products, based on query arguments from the user.
	 *
	 * @param array $query_args Parameters supplied by the user.
	 * @return array
	 */
	protected function get_allowed_products( $query_args ) {
		$allowed_products = array();
		if ( isset( $query_args['categories'] ) && is_array( $query_args['categories'] ) && count( $query_args['categories'] ) > 0 ) {
			$allowed_products = $this->get_products_by_cat_ids( $query_args['categories'] );
			$allowed_products = wc_list_pluck( $allowed_products, 'get_id' );
		}

		if ( isset( $query_args['products'] ) && is_array( $query_args['products'] ) && count( $query_args['products'] ) > 0 ) {
			if ( count( $allowed_products ) > 0 ) {
				$allowed_products = array_intersect( $allowed_products, $query_args['products'] );
			} else {
				$allowed_products = $query_args['products'];
			}
		}
		return $allowed_products;
	}

}
