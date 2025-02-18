<?php
/**
 * Admin View: Dashboard
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.8
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap woocommerce woocommerce-bis-notifications">

	<?php WC_BIS_Admin_Menus::render_tabs(); ?>

	<h1 class="wp-heading-inline"><?php esc_html_e( 'Dashboard', 'woocommerce' ); ?></h1>

	<hr class="wp-header-end">

	<div class="wc-bis-dashboard-boxes">
		<div class="wc-bis-dashboard-box">
			<h3><?php esc_html_e( 'Notifications', 'woocommerce' ); ?></h3>
			<div class="inner">
				<div class="counters">
					<div class="counter">
						<span class="label"><?php esc_html_e( 'Sent last month', 'woocommerce' ); ?></span>
						<span class="number"><?php echo absint( $counters['delivered_last_month'] ); ?></span>
					</div>
					<div class="counter">
						<span class="label"><?php esc_html_e( 'Sent today', 'woocommerce' ); ?></span>
						<span class="number"><?php echo absint( $counters['delivered_today'] ); ?></span>
					</div>
					<div class="counter">
						<span class="label"><?php esc_html_e( 'Queued', 'woocommerce' ); ?></span>
						<span class="number"><?php echo absint( $counters['in_queue'] ); ?></span>
					</div>
				</div>
				<?php self::print_deliveries_chart(); ?>
			</div>
		</div>
		<div class="wc-bis-dashboard-box">
			<h3><?php esc_html_e( 'Sign-Ups', 'woocommerce' ); ?></h3>
			<div class="inner">
				<div class="counters">
					<div class="counter">
						<span class="label"><?php esc_html_e( 'Signed up last month', 'woocommerce' ); ?></span>
						<span class="number"><?php echo absint( $counters['registered_last_month'] ); ?></span>
					</div>
					<div class="counter">
						<span class="label"><?php esc_html_e( 'Signed up today', 'woocommerce' ); ?></span>
						<span class="number"><?php echo absint( $counters['registered_today'] ); ?></span>
					</div>
				</div>
				<?php self::print_registrations_chart(); ?>
			</div>
		</div>
	</div>

	<h2><?php esc_html_e( 'Product Leaderboards', 'woocommerce' ); ?></h2>

	<div class="wc-bis-learderboards">
		<table id="wc_bis_most_anticipated">
			<thead>
				<tr class="head">
					<th colspan="2"><?php esc_html_e( 'Most wanted', 'woocommerce' ); ?></th>
				</tr>
				<tr>
					<th><?php esc_html_e( 'Product', 'woocommerce' ); ?></th>
					<th><?php esc_html_e( 'Customers', 'woocommerce' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php
				if ( ! empty( $leaderboards['most_anticipated'] ) ) {
					foreach ( $leaderboards['most_anticipated'] as $index => $data ) {
						$product = wc_get_product( $data->product_id );
						if ( ! is_a( $product, 'WC_Product' ) ) {
							continue;
						}
						$link_product_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
						?>
						<tr>
						<td>
							<a href="<?php echo esc_url( admin_url( "post.php?post={$link_product_id}&action=edit" ) ); ?>"><?php echo esc_html( $product->get_name() ); ?></a>
							<?php
							$formatted_variation_list = wc_get_formatted_variation( $product, true, true, true );
							if ( $formatted_variation_list ) {
								echo wp_kses_post( '<span class="description">' . $formatted_variation_list . '</span>' );
							}
							?>
						</td>
						<td><?php echo absint( $data->count ); ?></td>
						</tr>
						<?php
					}
				} else {
					echo '<tr><td colspan="2" class="empty">' . esc_html__( 'No data recorded.', 'woocommerce' ) . '</td></tr>';
				}
				?>
			</tbody>
		</table>
		<table id="wc_bis_most_delayed">
			<thead>
				<tr class="head">
					<th colspan="2"><?php esc_html_e( 'Most overdue', 'woocommerce' ); ?></th>
				</tr>
				<tr>
					<th><?php esc_html_e( 'Product', 'woocommerce' ); ?></th>
					<th><?php esc_html_e( 'Days', 'woocommerce' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php
				if ( ! empty( $leaderboards['most_delayed'] ) ) {
					foreach ( $leaderboards['most_delayed'] as $index => $data ) {
						$product = wc_get_product( $data->product_id );
						if ( ! is_a( $product, 'WC_Product' ) ) {
							continue;
						}
						$link_product_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
						?>
						<tr>
						<td>
							<a href="<?php echo esc_url( admin_url( "post.php?post={$link_product_id}&action=edit" ) ); ?>"><?php echo esc_html( $product->get_name() ); ?></a>
							<?php
							$formatted_variation_list = wc_get_formatted_variation( $product, true, true, true );
							if ( $formatted_variation_list ) {
								echo wp_kses_post( '<span class="description">' . $formatted_variation_list . '</span>' );
							}
							?>
						</td>
						<td><?php echo esc_html( round( ( time() - $data->waiting_since ) / ( 60 * 60 * 24 ) ) ); ?></td>
						</tr>
						<?php
					}
				} else {
					echo '<tr><td colspan="2" class="empty">' . esc_html__( 'No data recorded.', 'woocommerce' ) . '</td></tr>';
				}
				?>
			</tbody>
		</table>
		<table id="wc_bis_most_subscribed">
			<thead>
				<tr class="head">
					<th colspan="2">
						<?php esc_html_e( 'Most signed-up', 'woocommerce' ); ?>
						<div class="date_range">
							<a href="#" class="date_range--week active" data-range="week">Week</a>
							<a href="#" class="date_range--month" data-range="month">Month</a>
							<a href="#" class="date_range--quarter" data-range="quarter">Quarter</a>
						</div>
					</th>
				</tr>
				<tr>
					<th><?php esc_html_e( 'Product', 'woocommerce' ); ?></th>
					<th><?php esc_html_e( 'Customers', 'woocommerce' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php
				if ( ! empty( $leaderboards['most_subscribed'] ) ) {
					foreach ( $leaderboards['most_subscribed'] as $index => $data ) {
						$product = wc_get_product( $data->product_id );
						if ( ! is_a( $product, 'WC_Product' ) ) {
							continue;
						}
						$link_product_id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
						?>
						<tr>
						<td>
							<a href="<?php echo esc_url( admin_url( "post.php?post={$link_product_id}&action=edit" ) ); ?>"><?php echo esc_html( $product->get_name() ); ?></a>
							<?php
							$formatted_variation_list = wc_get_formatted_variation( $product, true, true, true );
							if ( $formatted_variation_list ) {
								echo wp_kses_post( '<span class="description">' . $formatted_variation_list . '</span>' );
							}
							?>
						</td>
						<td><?php echo absint( $data->total ); ?></td>
						</tr>
						<?php
					}
				} else {
					echo '<tr><td colspan="2" class="empty">' . esc_html__( 'No data recorded.', 'woocommerce' ) . '</td></tr>';
				}
				?>
			</tbody>
		</table>

	</div>

</div>
<script type="text/template" id="tmpl-most_subscribed_row">
	<tr>
		<td><a href="{{{ data.url }}}">{{{ data.name }}}</a></td>
		<td>{{{ data.total }}}</td>
	</tr>
</script>

