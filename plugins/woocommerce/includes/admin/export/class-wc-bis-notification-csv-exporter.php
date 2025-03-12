<?php
/**
 * WC_BIS_Notification_CSV_Exporter class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Include dependencies.
 */
if ( ! class_exists( 'WC_CSV_Batch_Exporter', false ) ) {
	include_once WC_ABSPATH . 'includes/export/abstract-wc-csv-batch-exporter.php';
}

/**
 * WC_BIS_Notification_CSV_Exporter Class.
 *
 * @version 1.7.1
 */
class WC_BIS_Notification_CSV_Exporter extends WC_CSV_Batch_Exporter {

	/**
	 * Type of export used in filter names.
	 *
	 * @var string
	 */
	protected $export_type = 'bis_notifications';

	/**
	 * Should meta be exported?
	 *
	 * @var boolean
	 */
	protected $enable_meta_export = false;

	/**
	 * Query filters.
	 *
	 * @var boolean
	 */
	protected $filters = false;

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct();
	}

	/**
	 * Force-Cast percent to integer.
	 *
	 * @override
	 */
	public function get_percent_complete() {
		return absint( parent::get_percent_complete() );
	}

	/**
	 * Should meta be exported?
	 *
	 * @param bool $enable_meta_export Should meta be exported.
	 */
	public function enable_meta_export( $enable_meta_export ) {
		$this->enable_meta_export = (bool) $enable_meta_export;
	}

	/**
	 * Set filters.
	 *
	 * @param  array $post_data
	 * @return void
	 */
	public function set_filters( $post_data ) {
		$this->filters = array(
			'date'     => isset( $post_data['date_filter'] ) && 0 != $post_data['date_filter'] ? absint( $post_data['date_filter'] ) : false,
			'customer' => isset( $post_data['customer_filter'] ) && 'false' !== $post_data['customer_filter'] ? absint( $post_data['customer_filter'] ) : false,
			'product'  => isset( $post_data['product_filter'] ) && 'false' !== $post_data['product_filter'] ? absint( $post_data['product_filter'] ) : false,
			'status'   => isset( $post_data['status_filter'] ) && 'false' !== $post_data['status_filter'] ? wc_clean( $post_data['status_filter'] ) : false,
		);
	}

	/**
	 * Return an array of columns to export.
	 *
	 * @return array
	 */
	public function get_default_column_names() {
		return apply_filters(
			"woocommerce_{$this->export_type}_export_default_columns",
			array(
				'id'                 => __( 'ID', 'woocommerce' ),
				'product_id'         => __( 'Product ID', 'woocommerce' ),
				'product_title'      => __( 'Product title', 'woocommerce' ),
				'product_name'       => __( 'Product name', 'woocommerce' ),
				'product_sku'        => __( 'Product SKU', 'woocommerce' ),
				'user_id'            => __( 'User ID', 'woocommerce' ),
				'user_email'         => __( 'User e-mail', 'woocommerce' ),
				'user_firstname'     => __( 'User firstname', 'woocommerce' ),
				'user_lastname'      => __( 'User lastname', 'woocommerce' ),
				'create_date'        => __( 'Sign-up date', 'woocommerce' ),
				'subscribe_date'     => __( 'Activation date', 'woocommerce' ),
				'last_notified_date' => __( 'Notified date', 'woocommerce' ),
				'is_active'          => __( 'Status', 'woocommerce' ),
			)
		);
	}

	/**
	 * Prepare data for export.
	 */
	public function prepare_data_to_export() {

		$args = array(
			'limit'  => $this->get_limit(),
			'offset' => $this->get_limit() * ( $this->get_page() - 1 ),
			'return' => 'objects',
		);

		// Has filters?
		if ( ! empty( $this->filters ) && is_array( $this->filters ) ) {
			if ( 0 != $this->filters['date'] && 6 === strlen( $this->filters['date'] ) ) {
				$year               = substr( $this->filters['date'], 0, 4 );
				$month              = substr( $this->filters['date'], 4, 6 );
				$args['start_date'] = strtotime( $year . '/' . $month . '/1 00:00:00' );
				$args['end_date']   = strtotime( '+ 1 month', $args['start_date'] );
			}

			if ( false !== $this->filters['product'] ) {
				$args['product_id'] = absint( $this->filters['product'] );
			}

			if ( false !== $this->filters['customer'] ) {
				$args['user_id'] = absint( $this->filters['customer'] );
			}

			if ( false !== $this->filters['status'] && 'all_bis_notifications' !== $this->filters['status'] ) {
				$args['is_active'] = 'active_bis_notifications' === $this->filters['status'] ? 'on' : 'off';
			}
		}

		$notifications = wc_bis_get_notifications( apply_filters( "woocommerce_{$this->export_type}_export_query_args", $args ) );
		unset( $args['return'] );
		unset( $args['limit'] );
		unset( $args['offset'] );
		$this->total_rows = wc_bis_get_notifications( array_merge( array( 'count' => true ), $args ) );
		$this->row_data   = array();

		if ( is_array( $notifications ) ) {

			foreach ( $notifications as $notification ) {
				$this->row_data[] = $this->generate_row_data( $notification );
			}
		}
	}

	/**
	 * Take a notification and generate row data from it for export.
	 *
	 * @param WC_BIS_Notification_Data $notification WC_BIS_Notification_Data object.
	 *
	 * @return array
	 */
	protected function generate_row_data( $notification ) {
		$columns = $this->get_column_names();
		$row     = array();
		foreach ( $columns as $column_id => $column_name ) {
			$column_id = strstr( $column_id, ':' ) ? current( explode( ':', $column_id ) ) : $column_id;
			$value     = '';

			// Skip some columns if dynamically handled later or if we're being selective.
			if ( in_array( $column_id, array( 'meta' ), true ) || ! $this->is_column_exporting( $column_id ) ) {
				continue;
			}

			if ( has_filter( "woocommerce_{$this->export_type}_export_column_{$column_id}" ) ) {
				// Filter for 3rd parties.
				$value = apply_filters( "woocommerce_{$this->export_type}_export_column_{$column_id}", '', $notification, $column_id );

			} elseif ( is_callable( array( $this, "get_column_value_{$column_id}" ) ) ) {
				// Handle special columns which don't map 1:1 to notification data.
				$value = $this->{"get_column_value_{$column_id}"}( $notification );

			} elseif ( is_callable( array( $notification, "get_{$column_id}" ) ) ) {
				// Default and custom handling.
				$value = $notification->{"get_{$column_id}"}();
				if ( 0 != $value && false !== strpos( '_date', $column_id ) ) {
					$value = date_i18n( 'Y-m-d H:i:s', absint( $value ) );
				}
			}

			$row[ $column_id ] = $value;
		}

		$this->prepare_meta_for_export( $notification, $row );
		return apply_filters( "woocommerce_{$this->export_type}_export_row_data", $row, $notification );
	}

	/**
	 * Export meta data.
	 *
	 * @param WC_BIS_Notification_Data $notification Notification being exported.
	 * @param array                    $row Row data.
	 */
	protected function prepare_meta_for_export( $notification, &$row ) {
		if ( $this->enable_meta_export ) {
			$meta_data = $notification->get_meta_data();

			if ( count( $meta_data ) ) {
				$meta_keys_to_skip = apply_filters( "woocommerce_{$this->export_type}_export_skip_meta_keys", array(), $notification );

				$i = 1;
				foreach ( $meta_data as $key => $value ) {
					if ( in_array( $key, $meta_keys_to_skip, true ) ) {
						continue;
					}

					if ( ! is_scalar( $value ) ) {
						$value = json_encode( $value );
					}

					$column_key = 'meta:' . esc_attr( $key );
					/* translators: %s: meta data name */
					$this->column_names[ $column_key ] = sprintf( __( 'Meta: %s', 'woocommerce' ), $key );
					$row[ $column_key ]                = $value;
					++$i;
				}
			}
		}
	}

	/*
	---------------------------------------------------*/
	/*
		Columns.                                         */
	/*---------------------------------------------------*/

	/**
	 * Get product title.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_product_title( $notification ) {
		$product = $notification->get_product();
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return '';
		}

		return $product->get_title();
	}

	/**
	 * Get product name.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_product_name( $notification ) {
		$product = $notification->get_product();
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return '';
		}

		return $product->get_name();
	}

	/**
	 * Get product SKU.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_product_sku( $notification ) {
		$product = $notification->get_product();
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return '';
		}

		return $product->get_sku();
	}

	/**
	 * Get user firstname.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_user_firstname( $notification ) {
		$user_id = $notification->get_user_id();
		$user    = get_user_by( 'id', $user_id );
		if ( is_a( $user, 'WP_User' ) ) {
			return $user->user_firstname;
		}
	}

	/**
	 * Get user lastname.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_user_lastname( $notification ) {
		$user_id = $notification->get_user_id();
		$user    = get_user_by( 'id', $user_id );
		if ( is_a( $user, 'WP_User' ) ) {
			return $user->user_lastname;
		}
	}

	/**
	 * Get date created.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_create_date( $notification ) {
		return $notification->get_create_date() ? date_i18n( 'Y-m-d H:i:s', $notification->get_create_date() ) : 0;
	}

	/**
	 * Get date subscribed.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_subscribe_date( $notification ) {
		return $notification->get_subscribe_date() ? date_i18n( 'Y-m-d H:i:s', $notification->get_subscribe_date() ) : 0;
	}

	/**
	 * Get last notified date.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_last_notified_date( $notification ) {
		return $notification->get_last_notified_date() ? date_i18n( 'Y-m-d H:i:s', $notification->get_last_notified_date() ) : 0;
	}

	/**
	 * Get active status column.
	 *
	 * @param  WC_BIS_Notification_Data $notification Notification being exported.
	 * @return string
	 */
	protected function get_column_value_is_active( $notification ) {
		return $notification->is_active() ? 'on' : 'off';
	}
}
