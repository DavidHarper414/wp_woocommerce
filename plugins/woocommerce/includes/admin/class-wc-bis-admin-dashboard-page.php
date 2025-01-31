<?php
/**
 * WC_BIS_Admin_Dashboard_Page class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC_BIS_Admin_Dashboard_Page Class.
 *
 * @version x.x.x
 */
class WC_BIS_Admin_Dashboard_Page {

	/**
	 * Page home URL.
	 *
	 * @const PAGE_URL
	 */
	const PAGE_URL = 'admin.php?page=bis_dashboard';

	/**
	 * Render page.
	 */
	public static function output() {

		// Timestamps setup.
		$begin_of_month = strtotime( 'today -30 days' );
		$begin_of_day   = strtotime( 'today' );
		$end_of_month   = strtotime( 'tomorrow', $begin_of_day ) - 1;
		$end_of_day     = strtotime( 'tomorrow', $begin_of_day ) - 1;

		$counters = array();
		// In queue.
		$counters['in_queue'] = wc_bis_get_notifications(
			array(
				'is_queued' => 'on',
				'count'     => true,
			)
		);

		// Delivered last month.
		$args                             = array(
			'start_notified_date' => $begin_of_month,
			'end_notified_date'   => $end_of_month,
			'count'               => true,
		);
		$counters['delivered_last_month'] = wc_bis_get_notifications( $args );

		// Delivered today.
		$args                        = array(
			'start_notified_date' => $begin_of_day,
			'end_notified_date'   => $end_of_day,
			'count'               => true,
		);
		$counters['delivered_today'] = wc_bis_get_notifications( $args );

		// Registered last month.
		$args                              = array(
			'start_date' => $begin_of_month,
			'end_date'   => $end_of_month,
			'count'      => true,
		);
		$counters['registered_last_month'] = wc_bis_get_notifications( $args );

		// Registered today.
		$args                         = array(
			'start_date' => $begin_of_day,
			'end_date'   => $end_of_day,
			'count'      => true,
		);
		$counters['registered_today'] = wc_bis_get_notifications( $args );

		// Limits.
		$limits                     = array();
		$limits['most_delayed']     = (int) apply_filters( 'woocommerce_bis_most_delayed_products_sql_limit', 5 );
		$limits['most_anticipated'] = (int) apply_filters( 'woocommerce_bis_most_anticipated_products_sql_limit', 5 );
		$limits['most_subscribed']  = (int) apply_filters( 'woocommerce_bis_most_subscribed_products_sql_limit', 5 );

		$leaderboards                     = array();
		$leaderboards['most_delayed']     = WC_BIS()->db->notifications->get_delayed_products( $limits['most_delayed'] );
		$leaderboards['most_anticipated'] = WC_BIS()->db->notifications->get_anticipated_products( $limits['most_anticipated'] );
		$leaderboards['most_subscribed']  = WC_BIS()->db->notifications->get_most_subscribed_products( 0, $limits['most_subscribed'] );

		include __DIR__ . '/views/html-admin-dashboard.php';
	}

	/**
	 * Get deliveries chart.
	 */
	protected static function print_deliveries_chart() {
		global $wp_locale;

		$begin_of_month = strtotime( 'today -29 days' );
		$begin_of_day   = strtotime( 'today' );
		$end_of_month   = strtotime( 'tomorrow', $begin_of_day ) - 1;

		$notifications = WC_BIS()->db->notifications->get_notifications_number_per_day( $begin_of_month, $end_of_month, 'last_notified_date' );
		$data          = self::prepare_chart_data( $notifications, 'date', 'count', 29, $begin_of_month );
		$chart_data    = wp_json_encode( array_values( $data ) );
		?>
		<div class="chart-container">
			<div class="chart-placeholder sent_notifications" style="width:100%;height: 200px"></div>
		</div>
		<script type="text/javascript">

		( function( $ ) {

			var main_chart;

			$( function() {
				var chart_data = JSON.parse( decodeURIComponent( '<?php echo rawurlencode( $chart_data ); ?>' ) );
				var drawGraph  = function() {
					var series = [
						{
							label: "<?php echo esc_js( __( 'Deliveries', 'woocommerce-back-in-stock-notifications' ) ); ?>",
							data: chart_data,
							color: '#ddd',
							bars: { show: true, lineWidth: 0, fillColor: '#ddd', barWidth: 60 * 60 * 16 * 1000, align: 'center' },
							shadowSize: 0,
							highlightColor: '#eee',
							stack: 0,
							enable_tooltip: true,
							replace_tooltip: wc_bis_admin_params.i18n_dashboard_sent_chart_tooltip,
						}
					];

					main_chart = $.plot(
						jQuery('.chart-placeholder.sent_notifications'),
						series,
						{
							legend: {
								show: false
							},
							grid: {
								borderColor: 'transparent',
								borderWidth: 0,
								hoverable: true
							},
							xaxes: [ {
								show: false,
								color: '#efefef',
								position: "bottom",
								tickColor: 'transparent',
								mode: "time",
								timeformat: "",
								monthNames: JSON.parse( decodeURIComponent( '<?php echo rawurlencode( wp_json_encode( array_values( $wp_locale->month_abbrev ) ) ); ?>' ) ),
								tickLength: 0,
								minTickSize: [ 1, "day" ],
								font: {
									color: "#aaa"
								}
							} ],
							yaxes: [
								{
									show: false,
									min: 0,
									tickLength: 0,
									tickDecimals: 0,
									color: '#efefef',
									font: { color: "#aaa" }
								}
							]
						}
					);

					$( '.chart-placeholder.sent_notifications' ).resize();
				}

				drawGraph();
			});

		} )( jQuery );

		</script>
		<?php
	}

	/**
	 * Get registrations chart.
	 */
	protected static function print_registrations_chart() {
		global $wp_locale;

		$begin_of_month = strtotime( 'today -29 days' );
		$begin_of_day   = strtotime( 'today' );
		$end_of_month   = strtotime( 'tomorrow', $begin_of_day ) - 1;

		$notifications = WC_BIS()->db->notifications->get_notifications_number_per_day( $begin_of_month, $end_of_month, 'create_date' );
		$data          = self::prepare_chart_data( $notifications, 'date', 'count', 29, $begin_of_month );
		$chart_data    = wp_json_encode( array_values( $data ) );
		?>
		<div class="chart-container">
			<div class="chart-placeholder new_notifications" style="width:100%;height: 200px"></div>
		</div>
		<script type="text/javascript">

			( function( $ ) {

				var main_chart;

				$( function() {
					var chart_data = JSON.parse( decodeURIComponent( '<?php echo rawurlencode( $chart_data ); ?>' ) );
					var drawGraph = function() {
						var series = [
							{
								label: "<?php echo esc_js( __( 'Sign-ups', 'woocommerce-back-in-stock-notifications' ) ); ?>",
								data: chart_data,
								color: '#ddd',
								bars: { show: true, lineWidth: 0, fillColor: '#ddd', barWidth: 60 * 60 * 16 * 1000, align: 'center' },
								shadowSize: 0,
								highlightColor: '#eee',
								stack: 0,
								enable_tooltip: true,
								replace_tooltip: wc_bis_admin_params.i18n_dashboard_sign_up_chart_tooltip,
							}
						];

						main_chart = $.plot(
							$( '.chart-placeholder.new_notifications' ),
							series,
							{
								legend: {
									show: false
								},
								grid: {
									borderColor: 'transparent',
									borderWidth: 0,
									hoverable: true
								},
								xaxes: [ {
									show: false,
									color: '#efefef',
									position: "bottom",
									tickColor: 'transparent',
									mode: "time",
									timeformat: "%d %b",
									monthNames: JSON.parse( decodeURIComponent( '<?php echo rawurlencode( wp_json_encode( array_values( $wp_locale->month_abbrev ) ) ); ?>' ) ),
									tickLength: 0,
									minTickSize: [ 1, "day" ],
									font: {
										color: "#aaa"
									}
								} ],
								yaxes: [
									{
										show: false,
										min: 0,
										tickLength: 0,
										tickDecimals: 0,
										color: '#efefef',
										font: { color: "#aaa" }
									}
								]
							}
						);

						$( '.chart-placeholder.new_notifications' ).resize();
					}

					drawGraph();
				} );

			} )( jQuery );

		</script>
		<?php
	}

	/**
	 * Prepare items for chart.
	 *
	 * @param  array  $notifications Array of notifications arrays. This doesn't consists of WC_BIS_Notification_Data objects.
	 * @param  string $date_prop     Date property.
	 * @param  string $data_prop     Data property.
	 * @param  int    $interval      Interval (in days).
	 * @param  string $start_date    Start date.
	 * @return array
	 */
	protected static function prepare_chart_data( $notifications, $date_prop, $data_prop, $interval, $start_date ) {
		$prepared_data = array();
		$max_value     = 0;

		// Create segments per day.
		for ( $i = 0; $i <= $interval; $i++ ) {
			$time = strtotime( date_i18n( 'Ymd', strtotime( "+{$i} DAY", $start_date ) ) ) . '000';

			if ( ! isset( $prepared_data[ $time ] ) ) {
				$prepared_data[ $time ] = array( esc_js( $time ), 0 );
			}
		}

		if ( ! empty( $notifications ) ) {
			foreach ( $notifications as $notification ) {
				$time = strtotime( $notification[ $date_prop ] ) . '000';
				if ( ! isset( $prepared_data[ $time ] ) ) {
					continue;
				}

				$prepared_data[ $time ][1] = (int) $notification[ $data_prop ];

				if ( $prepared_data[ $time ][1] > $max_value ) {
					$max_value = $prepared_data[ $time ][1];
				}
			}
		}

		// Replace zeros with a small amount for display.
		foreach ( $prepared_data as $time => $data ) {
			if ( 0 !== $max_value && 0 === $prepared_data[ $time ][1] ) {
				$prepared_data[ $time ][1] = 0.1;
			}
		}

		return $prepared_data;
	}
}
