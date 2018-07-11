<?php
/**
 * WooCommerce Orders Stats
 *
 * Handles the orders stats database and API.
 *
 * @package WooCommerce/Classes
 * @since   3.5.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WC_Order_Stats_Background_Process', false ) ) {
	include_once dirname( __FILE__ ) . '/class-wc-order-stats-background-process.php';
}

/**
 * Order stats class.
 */
class WC_Order_Stats {

	const TABLE_NAME = 'wc_order_stats';
	const CRON_EVENT = 'wc_order_stats_update';

	/**
	 * Background process to populate order stats.
	 *
	 * @var WC_Order_Stats_Background_Process
	 */
	protected static $background_process;

	/**
	 * Setup class.
	 */
	public function __construct() {
		add_action( self::CRON_EVENT, array( $this, 'queue_update_recent_orders' ) );
		add_action( 'woocommerce_before_order_object_save', array( $this, 'queue_update_modified_orders' ) );
		add_action( 'shutdown', array( $this, 'dispatch_recalculator' ) );

		// Each hour update the DB with info for the previous hour.
		if ( ! wp_next_scheduled( self::CRON_EVENT ) ) {
			wp_schedule_event( strtotime( date( 'Y-m-d H:30:00' ) ), 'hourly', self::CRON_EVENT );
		}

		if ( ! self::$background_process ) {
			self::$background_process = new WC_Order_Stats_Background_Process();
		}
	}

	/**
	 * Get order stats information.
	 *
	 * @param string $start_time UTC Timestamp.
	 * @param string $end_time UTC Timestamp.
	 * @param array  $args Optional arguments.
	 * @return array
	 */
	public static function query( $start_time, $end_time, $args = array() ) {
		global $wpdb;

		$defaults = array(
			'interval' => 'hour', // hour, week, day, month, or year.
			'fields'   => '*',
		);
		$args = wp_parse_args( $args, $defaults );

		$selections = array(
			'start_time'            => 'MIN(start_time) as start_time',
			'num_orders'            => 'SUM(num_orders) as num_orders',
			'num_items_sold'        => 'SUM(num_items_sold) as num_items_sold',
			'orders_gross_total'    => 'SUM(orders_gross_total) as orders_gross_total',
			'orders_coupon_total'   => 'SUM(orders_coupon_total) as orders_coupon_total',
			'orders_refund_total'   => 'SUM(orders_refund_total) as orders_refund_total',
			'orders_tax_total'      => 'SUM(orders_tax_total) as orders_tax_total',
			'orders_shipping_total' => 'SUM(orders_shipping_total) as orders_shipping_total',
			'orders_net_total'      => 'SUM(orders_net_total) as orders_net_total',
		);

		if ( is_array( $args['fields'] ) ) {
			$keep = array();
			foreach ( $args['fields'] as $field ) {
				if ( isset( $selections[ $field ] ) ) {
					$keep[ $field ] = $selections[ $field ];
				}
			}
			if ( empty( $keep ) ) {
				return array();
			}
			$selections = implode( ',', $keep );
		} else {
			$selections = implode( ',', $selections );
		}

		$table_name = $wpdb->prefix . self::TABLE_NAME;
		$query = $wpdb->prepare(
			'SELECT ' . $selections . ' FROM ' . $table_name . ' WHERE start_time >= %s AND start_time < %s GROUP BY ' . strtoupper( esc_sql( $args['interval'] ) ) . '(start_time);', // phpcs:ignore WordPress.WP.PreparedSQL.NotPrepared
			date( 'Y-m-d H:00:00', $start_time ),
			date( 'Y-m-d H:00:00', $end_time )
		);

		return $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.WP.PreparedSQL.NotPrepared
	}

	/**
	 * Queue a background process that will repopulate the entire orders stats database.
	 */
	public static function queue_order_stats_repopulate_database() {
		// To get the first start time, get the oldest order and round the completion time down to the nearest hour.
		$oldest = wc_get_orders( array(
			'limit'   => 1,
			'orderby' => 'date',
			'order'   => 'ASC',
			'status'  => self::get_report_order_statuses(),
			'type'    => 'shop_order',
		) );

		$oldest = $oldest ? reset( $oldest ) : false;
		if ( ! $oldest ) {
			return;
		}

		$start_time = strtotime( $oldest->get_date_created()->format( 'Y-m-d\TH:00:00O' ) );
		$end_time = $start_time + HOUR_IN_SECONDS;

		while ( $end_time < time() ) {
			self::$background_process->push_to_queue( $start_time );
			$start_time = $end_time;
			$end_time = $start_time + HOUR_IN_SECONDS;
		}

		self::$background_process->save();
	}

	/**
	 * Queue a background process that will update the database with stats info from the last hour.
	 */
	public function queue_update_recent_orders() {
		// Populate the stats information for the previous hour.
		$last_hour = strtotime( date( 'Y-m-d H:00:00' ) ) - HOUR_IN_SECONDS;
		self::$background_process->push_to_queue( $last_hour );
		self::$background_process->save();
	}

	/**
	 * Schedule a recalculation for an order's time when the order gets updated.
	 * This schedules for the order's current time and for the time the order used to be in if necessary.
	 *
	 * @param WC_Order $order Order that is in the process of getting modified.
	 */
	public function queue_update_modified_orders( $order ) {
		$date_created = $order->get_date_created();
		if ( ! $date_created ) {
			return;
		}
		$new_time   = strtotime( $date_created->format( 'Y-m-d\TH:00:00O' ) );
		$old_time   = false;
		$new_status = $order->get_status();
		$old_status = false;

		if ( $order->get_id() ) {
			$old_order  = wc_get_order( $order->get_id() );
			$old_time   = strtotime( $old_order->get_date_created()->format( 'Y-m-d\TH:00:00O' ) );
			$old_status = $old_order->get_status();
		}

		$order_statuses = self::get_report_order_statuses();
		if ( in_array( $new_status, $order_statuses, true ) || in_array( $old_status, $order_statuses, true ) ) {
			self::$background_process->push_to_queue( $new_time );

			if ( $old_time && $new_time !== $old_time ) {
				self::$background_process->push_to_queue( $old_time );
			}

			self::$background_process->save();
		}
	}

	/**
	 * Kick off any scheduled data recalculations.
	 */
	public function dispatch_recalculator() {
		self::$background_process->dispatch();
	}

	/**
	 * Get stats summary information for orders between two time frames.
	 *
	 * @param int $start_time Timestamp.
	 * @param int $end_time Timestamp.
	 * @return Array of stats.
	 */
	public static function summarize_orders( $start_time, $end_time ) {
		$summary = array(
			'num_orders'            => 0,
			'num_items_sold'        => 0,
			'orders_gross_total'    => 0.0,
			'orders_coupon_total'   => 0.0,
			'orders_refund_total'   => 0.0,
			'orders_tax_total'      => 0.0,
			'orders_shipping_total' => 0.0,
			'orders_net_total'      => 0.0,
		);

		$orders = wc_get_orders( array(
			'limit'        => -1,
			'type'         => 'shop_order',
			'orderby'      => 'none',
			'status'       => self::get_report_order_statuses(),
			'date_created' => $start_time . '...' . $end_time,
		) );

		$summary['num_orders']            = count( $orders );
		$summary['num_items_sold']        = self::get_num_items_sold( $orders );
		$summary['orders_gross_total']    = self::get_orders_gross_total( $orders );
		$summary['orders_coupon_total']   = self::get_orders_coupon_total( $orders );
		$summary['orders_refund_total']   = self::get_orders_refund_total( $orders );
		$summary['orders_tax_total']      = self::get_orders_tax_total( $orders );
		$summary['orders_shipping_total'] = self::get_orders_shipping_total( $orders );
		$summary['orders_net_total']      = $summary['orders_gross_total'] - $summary['orders_tax_total'] - $summary['orders_shipping_total'];

		return $summary;
	}

	/**
	 * Update the database with stats data.
	 *
	 * @param int   $start_time Timestamp.
	 * @param array $data Stats data.
	 * @return int/bool Number or rows modified or false on failure.
	 */
	public static function update( $start_time, $data ) {
		global $wpdb;
		$table_name = $wpdb->prefix . self::TABLE_NAME;
		$start_time = date( 'Y-m-d H:00:00', $start_time );

		$defaults = array(
			'start_time'            => $start_time,
			'num_orders'            => 0,
			'num_items_sold'        => 0,
			'orders_gross_total'    => 0.0,
			'orders_coupon_total'   => 0.0,
			'orders_refund_total'   => 0.0,
			'orders_tax_total'      => 0.0,
			'orders_shipping_total' => 0.0,
			'orders_net_total'      => 0.0,
		);
		$data = wp_parse_args( $data, $defaults );

		// Don't store rows that don't have useful information.
		// @todo maybe remove this when/if on-the-fly generation is implemented.
		if ( ! $data['num_orders'] ) {
			return $wpdb->delete(
				$table_name,
				array(
					'start_time' => $start_time,
				),
				array(
					'%s',
				)
			);
		}

		// Update or add the information to the DB.
		return $wpdb->replace(
			$table_name,
			$data,
			array(
				'%s',
				'%d',
				'%d',
				'%f',
				'%f',
				'%f',
				'%f',
				'%f',
				'%f',
			)
		);
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
	 * Calculation methods.
	 */

	/**
	 * Get number of items sold among all orders.
	 *
	 * @param array $orders Array of WC_Order objects.
	 * @return int
	 */
	protected static function get_num_items_sold( $orders ) {
		$num_items = 0;

		foreach ( $orders as $order ) {
			$line_items = $order->get_items( 'line_item' );
			foreach ( $line_items as $line_item ) {
				$num_items += $line_item->get_quantity();
			}
		}

		return $num_items;
	}

	/**
	 * Get the gross total for all orders.
	 *
	 * @param array $orders Array of WC_Order objects.
	 * @return float
	 */
	protected static function get_orders_gross_total( $orders ) {
		$total = 0.0;

		foreach ( $orders as $order ) {
			$total += $order->get_total();
		}

		return $total;
	}

	/**
	 * Get the coupon total for all orders.
	 *
	 * @param array $orders Array of WC_Order objects.
	 * @return float
	 */
	protected static function get_orders_coupon_total( $orders ) {
		$total = 0.0;

		foreach ( $orders as $order ) {
			$total += $order->get_discount_total();
		}

		return $total;
	}

	/**
	 * Get the refund total for all orders.
	 *
	 * @param array $orders Array of WC_Order objects.
	 * @return float
	 */
	protected static function get_orders_refund_total( $orders ) {
		$total = 0.0;

		foreach ( $orders as $order ) {
			$total += $order->get_total_refunded();
		}

		return $total;
	}

	/**
	 * Get the tax total for all orders.
	 *
	 * @param array $orders Array of WC_Order objects.
	 * @return float
	 */
	protected static function get_orders_tax_total( $orders ) {
		$total = 0.0;

		foreach ( $orders as $order ) {
			$total += $order->get_total_tax();
		}

		return $total;
	}

	/**
	 * Get the shipping total for all orders.
	 *
	 * @param array $orders Array of WC_Order objects.
	 * @return float
	 */
	protected static function get_orders_shipping_total( $orders ) {
		$total = 0.0;

		foreach ( $orders as $order ) {
			$total += $order->get_shipping_total();
		}

		return $total;
	}
}
new WC_Order_Stats();
