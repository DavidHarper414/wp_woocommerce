<?php
/**
 * WC_BIS_Activity_List_Table class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Adds a custom deployments list table.
 *
 * @class    WC_BIS_Activity_List_Table
 * @version  1.5.0
 */
class WC_BIS_Activity_List_Table extends WP_List_Table {

	/**
	 * Page home URL.
	 *
	 * @const PAGE_URL
	 */
	const PAGE_URL = 'admin.php?page=bis_activity';

	/**
	 * Total view records.
	 *
	 * @var int
	 */
	private $total_items = 0;

	/**
	 * Specify Notification to show activity (Defaults to all).
	 *
	 * @var int
	 */
	private $notification;

	/**
	 * Constructor
	 */
	public function __construct( $notification = 0 ) {
		global $status, $page;

		$this->total_items  = WC_BIS()->db->activity->query( array( 'count' => true ) );
		$this->notification = absint( $notification );

		parent::__construct(
			array(
				'singular' => 'activity',
				'plural'   => 'activities',
			)
		);
	}

	/**
	 * This is a default column renderer
	 *
	 * @param $item - row (key, value array)
	 * @param $column_name - string (key)
	 * @return string
	 */
	public function column_default( $item, $column_name ) {

		if ( isset( $item[ $column_name ] ) ) {

			echo wp_kses_post( $item[ $column_name ] );

		} else {

			/**
			 * Fires in each custom column in the Notifications Activity list table.
			 *
			 * This hook only fires if the current column_name is not set inside the $item's keys.
			 *
			 * @param string $column_name The name of the column to display.
			 * @param array  $item
			 */
			do_action( 'manage_bis_notifications_activity_custom_column', $column_name, $item );
		}
	}

	/**
	 * Handles the title column output.
	 *
	 * @param array $item
	 */
	public function column_notification_id( $item ) {

		/* translators: activity id */
		$title = esc_html( sprintf( __( '#%d', 'woocommerce' ), absint( $item['notification_id'] ) ) );
		if ( ! empty( $this->notification ) ) {
			echo esc_html( $title );
		} else {

			$actions = array(
				/* translators: view link label */
				'edit' => sprintf( '<a href="' . admin_url( 'admin.php?page=bis_notifications&section=edit&notification=%d' ) . '">%s</a>', $item['notification_id'], __( 'View Notification', 'woocommerce' ) ),
			);

			printf(
				'<a class="row-title" href="%1$s" aria-label="%2$s">%3$s</a>',
				sprintf( esc_url( admin_url( 'admin.php?page=bis_notifications&section=edit&notification=%d' ) ), absint( $item['notification_id'] ) ),
				/* translators: %s: Notification id */
				sprintf( esc_attr__( '&#8220;%s&#8221; (Edit)', 'woocommerce' ), esc_attr( $title ) ),
				esc_html( $title )
			);
		}
	}

	/**
	 * Handles the user column output.
	 *
	 * @param array $item
	 */
	public function column_user( $item ) {

		if ( 0 == $item['user_id'] && empty( $item['user_email'] ) ) {
			?>
			<mark>
				<?php
				echo esc_html__( 'SYSTEM', 'woocommerce' );
				?>
			</mark>
			<?php
			return;
		}

		if ( $item['user_id'] ) {
			$user = get_user_by( 'id', $item['user_id'] );
		}

		if ( isset( $user ) && $user ) {
			printf( '<a href="%s" target="_blank">%s</a>&nbsp;(%s)', esc_url( get_edit_user_link( $user->ID ) ), esc_html( $user->display_name ), esc_html( $user->user_email ) );
		} elseif ( $item['user_email'] ) {
			echo esc_html( $item['user_email'] );
		} else {
			echo '-';
		}
	}

	/**
	 * Handles the product column output.
	 *
	 * @param array $item
	 */
	public function column_product( $item ) {
		$product = wc_get_product( absint( $item['product_id'] ) );
		if ( is_a( $product, 'WC_Product' ) ) {

			printf( '<a target="_blank" href="' . esc_url( admin_url( 'post.php?post=%d&action=edit' ) ) . '">%s</a>', esc_html( $product->get_parent_id() ? absint( $product->get_parent_id() ) : absint( $item['product_id'] ) ), esc_html( $product->get_parent_id() ? $product->get_name() : $product->get_title() ) );

		} else {
			echo '&mdash;';
		}
	}

	/**
	 * Handles the type column output.
	 *
	 * @param array $item
	 */
	public function column_type( $item ) {
		echo esc_html( wc_bis_get_activity_type_label( $item['type'] ) );
	}

	/**
	 * Handles the date column output.
	 *
	 * @param array $item
	 */
	public function column_date( $item ) {

		$t_time    = date_i18n( _x( 'Y/m/d g:i:s a', 'list table date hover format', 'woocommerce' ), $item['date'] );
		$time_diff = time() - $item['date'];

		if ( $time_diff > 0 && $time_diff < DAY_IN_SECONDS ) {
			/* translators: %s: human time diff */
			$h_time = sprintf( esc_html__( '%s ago', 'woocommerce' ), human_time_diff( $item['date'] ) );
		} else {
			$h_time = date_i18n( _x( 'Y/m/d', 'list table date format', 'woocommerce' ), $item['date'] );
		}

		echo '<span title="' . esc_attr( $t_time ) . '">' . esc_html( $h_time ) . '</span>';
	}

	/**
	 * Get a list of columns. The format is:
	 * 'internal-name' => 'Title'
	 */
	public function get_columns() {

		$columns = array();
		if ( empty( $this->notification ) ) {
			$columns['notification_id'] = _x( 'Notification', 'column_name', 'woocommerce' );
		}
		$columns['type'] = _x( 'Event', 'column_name', 'woocommerce' );
		$columns['user'] = _x( 'User / E-mail', 'column_name', 'woocommerce' );
		if ( empty( $this->notification ) ) {
			$columns['product'] = _x( 'Product', 'column_name', 'woocommerce' );
		}
		$columns['date'] = _x( 'Signed Up', 'column_name', 'woocommerce' );

		/**
		 * Filters the columns displayed in the Notifications list table.
		 *
		 * @param array $columns An associative array of column headings.
		 */
		return apply_filters( 'manage_bis_notifications_activity_columns', $columns );
	}

	/**
	 * Return sortable columns.
	 *
	 * @return array
	 */
	public function get_sortable_columns() {
		$sortable_columns = array(
			'date' => array( 'date', true ),
		);

		return $sortable_columns;
	}

	/**
	 * Query the DB and attach items.
	 *
	 * @return void
	 */
	public function prepare_items() {

		/**
		 * `woocommerce_bis_admin_activity_per_page` filter.
		 *
		 * Control how many activities are displayed per page in admin list table.
		 *
		 * @since  1.3.2
		 *
		 * @param  int  $per_page
		 * @return int
		 */
		$per_page = (int) apply_filters( 'woocommerce_bis_admin_activity_per_page', $this->notification ? 10 : 20 );

		// Table columns.
		$columns               = $this->get_columns();
		$hidden                = array();
		$sortable              = $this->get_sortable_columns();
		$this->_column_headers = array( $columns, $hidden, $sortable );

		// Setup params.
		$paged   = isset( $_REQUEST['paged'] ) ? max( 0, intval( $_REQUEST['paged'] ) - 1 ) : 0;
		$orderby = ( isset( $_REQUEST['orderby'] ) && in_array( $_REQUEST['orderby'], array_keys( $this->get_sortable_columns() ) ) ) ? wc_clean( $_REQUEST['orderby'] ) : 'id';
		$order   = ( isset( $_REQUEST['order'] ) && in_array( $_REQUEST['order'], array( 'asc', 'desc' ) ) ) ? wc_clean( $_REQUEST['order'] ) : 'desc';

		// Query args.
		$query_args = array(
			'order_by' => array( $orderby => $order ),
			'limit'    => $per_page,
			'offset'   => $paged * $per_page,
		);

		if ( $this->notification > 0 ) {
			$query_args['notification_id'] = $this->notification;
		}

		// Search.
		if ( isset( $_REQUEST['s'] ) && ! empty( $_REQUEST['s'] ) ) {
			$query_args['search'] = wc_clean( $_REQUEST['s'] );
		}

		// Filters.
		if ( ! empty( $_GET['_customer_filter'] ) ) {
			$filter                = absint( $_GET['_customer_filter'] );
			$query_args['user_id'] = array( $filter );
		}
		if ( ! empty( $_GET['_type_filter'] ) ) {
			// Sanity check.
			$filter = in_array( $_GET['_type_filter'], array_keys( wc_bis_get_activity_types() ) ) ? wc_clean( $_GET['_type_filter'] ) : '';
			if ( $filter ) {
				$query_args['type'] = array( $filter );
			}
		}

		// Fetch the items.
		// It's safe to ignore semgrep warning, as everything is properly escaped.
		$this->items = WC_BIS()->db->activity->query( $query_args ); // nosemgrep: audit.php.wp.security.sqli.input-in-sinks

		// Count total items.
		$query_args['count'] = true;
		unset( $query_args['limit'] );
		unset( $query_args['offset'] );
		$total_items = WC_BIS()->db->activity->query( $query_args );

		// Configure pagination.
		$this->set_pagination_args(
			array(
				'total_items' => $total_items, // total items defined above
				'per_page'    => $per_page, // per page constant defined at top of method
				'total_pages' => ceil( $total_items / $per_page ), // calculate pages count
			)
		);
	}

	/**
	 * Message to be displayed when there are no items.
	 *
	 * @return void
	 */
	public function no_items() {

		if ( 0 === $this->total_items ) {
			?>
			<div class="bis-notifications__empty-state">
				<i class="dashicons dashicons-backup"></i>
				<p class="main">
					<?php esc_html_e( 'Activity Log', 'woocommerce' ); ?>
				</p>
				<p>
					<?php esc_html_e( 'No activity recorded just yet.', 'woocommerce' ); ?>
				</p>
			</div>
			<?php

		} else {
			?>
			<p class="main">
				<?php esc_html_e( 'No activity recorded', 'woocommerce' ); ?>
			</p>
			<?php
		}
	}

	/**
	 * Construct a link string from args.
	 *
	 * @param  array  $args
	 * @param  string $label
	 * @param  string $class
	 * @return string
	 */
	protected function get_link( $args, $label, $class = '' ) {

		$base_url = admin_url( 'admin.php?page=bis_notifications' );
		$url      = add_query_arg( $args, $base_url );

		$class_html   = '';
		$aria_current = '';
		if ( ! empty( $class ) ) {
			$class_html = sprintf(
				' class="%s"',
				esc_attr( $class )
			);

			if ( 'current' === $class ) {
				$aria_current = ' aria-current="page"';
			}
		}

		return sprintf(
			'<a href="%s"%s%s>%s</a>',
			esc_url( $url ),
			$class_html,
			$aria_current,
			$label
		);
	}

	/**
	 * Display table extra nav.
	 *
	 * @param  string $which top|bottom
	 * @return void
	 */
	public function extra_tablenav( $which ) {
		if ( 'top' === $which && ! is_singular() && ! $this->notification ) {
			?>
			<div class="alignleft actions sw-select2-autoinit">
			<?php
				$this->render_filters();
				submit_button( __( 'Filter', 'woocommerce' ), '', 'filter_action', false, array( 'id' => 'post-query-submit' ) );
			?>
			</div>
			<?php
		}
	}

	/**
	 * Display table filters.
	 *
	 * @return void
	 */
	protected function render_filters() {

		$this->display_months_dropdown();
		$this->display_types_dropdown();

		$user_string = '';
		$user_id     = '';

		if ( ! empty( $_GET['_customer_filter'] ) ) {

			$user_id = wc_clean( $_GET['_customer_filter'] );
			$user    = get_user_by( 'id', absint( $user_id ) );

			if ( $user ) {
				$user_string = sprintf(
					/* translators: 1: user display name 2: user ID 3: user email */
					esc_html__( '%1$s (#%2$s &ndash; %3$s)', 'woocommerce' ),
					$user->display_name,
					absint( $user->ID ),
					$user->user_email
				);
			}
		}
		?>
		<select class="sw-select2-search--customers" name="_customer_filter" data-placeholder="<?php esc_attr_e( 'All customers', 'woocommerce' ); ?>" data-allow_clear="true">
			<?php if ( $user_string && $user_id ) { ?>
				<option value="<?php echo esc_attr( $user_id ); ?>" selected="selected"><?php echo wp_kses_post( htmlspecialchars( $user_string, ENT_COMPAT ) ); ?><option>
			<?php } ?>
		</select>
		<?php
	}

	/**
	 * Display types dropdown filter.
	 *
	 * @return void
	 */
	protected function display_types_dropdown() {
		$type_filter = ! empty( $_GET['_type_filter'] ) ? wc_clean( $_GET['_type_filter'] ) : 0;
		?>
		<label for="filter-by-type" class="screen-reader-text"><?php esc_html_e( 'Filter by type', 'woocommerce' ); ?></label>
		<select name="_type_filter" id="filter-by-type">
			<option<?php selected( $type_filter, 0 ); ?> value="0"><?php esc_html_e( 'All types', 'woocommerce' ); ?></option>
			<?php
			foreach ( wc_bis_get_activity_types() as $type => $label ) {
				printf(
					"<option %s value='%s'>%s</option>\n",
					selected( $type_filter, $type, false ),
					esc_attr( $type ),
					esc_html( $label )
				);
			}
			?>
		</select>
		<?php
	}

	/**
	 * Display dates dropdown filter.
	 *
	 * @return void
	 */
	protected function display_months_dropdown() {
		global $wp_locale;

		$months      = WC_BIS()->db->activity->get_distinct_dates();
		$month_count = count( $months );

		if ( ! $month_count || ( 1 == $month_count && 0 == $months[0]->month ) ) {
			return;
		}

		$m = isset( $_GET['m'] ) ? (int) $_GET['m'] : 0;
		?>
		<label for="filter-by-date" class="screen-reader-text"><?php esc_html_e( 'Filter by date', 'woocommerce' ); ?></label>
		<select name="m" id="filter-by-date">
			<option<?php selected( $m, 0 ); ?> value="0"><?php esc_html_e( 'All dates', 'woocommerce' ); ?></option>
			<?php
			foreach ( $months as $arc_row ) {
				if ( 0 == $arc_row->year ) {
					continue;
				}

				$month = zeroise( $arc_row->month, 2 );
				$year  = $arc_row->year;
				/* translators: 1: selected attrbute 2: value 3: label */
				printf(
					"<option %s value='%s'>%s</option>\n",
					selected( $m, $year . $month, false ),
					esc_attr( $arc_row->year . $month ),
					/* translators: 1: month 2: year */
					sprintf( esc_html__( '%1$s %2$d', 'woocommerce' ), esc_html( $wp_locale->get_month( $month ) ), esc_html( $year ) )
				);
			}
			?>
		</select>
		<?php
	}
}
