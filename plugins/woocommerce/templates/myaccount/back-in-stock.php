<?php
/**
 * Back in Stock notifications list.
 *
 * Shows orders on the account page.
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/myaccount/notifications.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://woocommerce.com/document/template-structure/
 * @package WooCommerce Back In Stock Notifications
 * @version 1.6.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

do_action( 'woocommerce_bis_before_account_backinstock', $has_notifications ); ?>

<?php if ( $has_pending_notifications && (bool) apply_filters( 'woocommerce_bis_account_show_pending_notifications', true ) ) : ?>
	<h2><?php esc_html_e( 'Pending', 'woocommerce-back-in-stock-notifications' ); ?></h2>
	<table class="woocommerce-orders-table woocommerce-MyAccount-orders shop_table shop_table_responsive my_account_orders account-orders-table wc-bis-pending-notifications-table">
		<thead>
			<tr>
				<th>
					<?php esc_html_e( 'ID', 'woocommerce-back-in-stock-notifications' ); ?>
				</th>
				<th>
					<?php esc_html_e( 'Product', 'woocommerce-back-in-stock-notifications' ); ?>
				</th>
				<th>
					<?php esc_html_e( 'Stock status', 'woocommerce-back-in-stock-notifications' ); ?>
				</th>
				<th>
					<?php esc_html_e( 'Date', 'woocommerce-back-in-stock-notifications' ); ?>
				</th>
				<th>
					<?php esc_html_e( 'Actions', 'woocommerce-back-in-stock-notifications' ); ?>
				</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ( $pending_notifications as $notification ) : ?>
				<?php
				$product = $notification->get_product();
				if ( ! $product ) {
					continue;
				}
				?>
				<tr>
					<td class="woocommerce-orders-table__cell" data-title="<?php esc_attr_e( 'ID', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php echo esc_html( sprintf( '#%d', $notification->get_id() ) ); ?>
					</td>
					<td class="woocommerce-orders-table__cell woocommerce-backinstock-table__cell__product" data-title="<?php esc_attr_e( 'Product', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php
						echo wp_kses_post( sprintf( '<a href="%s">%s</a>', $notification->get_product_permalink(), $notification->get_product_name() ) );

						$formatted_variation_list = $notification->get_product_formatted_variation_list( true );
						if ( $formatted_variation_list ) {
							echo wp_kses_post( '<span class="description">' . $formatted_variation_list . '</span>' );
						}
						?>
					</td>
					<td class="woocommerce-orders-table__cell" data-title="<?php esc_attr_e( 'Stock status', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php
						if ( $product->is_in_stock() ) {
							echo '<div class="stock" >' . esc_html__( 'In stock', 'woocommerce-back-in-stock-notifications' ) . '</div>';
						} else {
							echo '<div class="outofstock" >' . esc_html__( 'Out of stock', 'woocommerce-back-in-stock-notifications' ) . '</div>';
						}
						?>
					</td>
					<td data-title="<?php esc_attr_e( 'Date', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php echo $notification->get_subscribe_date() ? esc_html( date_i18n( wc_date_format(), $notification->get_subscribe_date() ) ) : '&mdash;'; ?>
					</td>
					<td class="woocommerce-orders-table__cell woocommerce-orders-table__cell-notification-actions" data-title="<?php esc_attr_e( 'Actions', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php
						echo wp_kses_post(
							sprintf(
								'<a class="%3$s" href="%1$s">%2$s</a>',
								wp_nonce_url( add_query_arg( array( 'wc_bis_resend_notification' => $notification->get_id() ), WC_BIS()->account->get_endpoint_url() ), 'resend_verification_email_nonce' ),
								__( 'Resend verification', 'woocommerce-back-in-stock-notifications' ),
								esc_attr( $button_class )
							)
						);

						echo wp_kses_post(
							sprintf(
								'<a class="%3$s" href="%1$s">%2$s</a>',
								wp_nonce_url( add_query_arg( array( 'wc_bis_cancel_pending_notification' => $notification->get_id() ), WC_BIS()->account->get_endpoint_url() ), 'cancel_pending_verification_nonce' ),
								__( 'Cancel', 'woocommerce-back-in-stock-notifications' ),
								esc_attr( $button_class )
							)
						);
						?>
					</td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
<?php endif; ?>

<h2><?php esc_html_e( 'Active', 'woocommerce-back-in-stock-notifications' ); ?></h2>

<table class="woocommerce-orders-table woocommerce-MyAccount-orders shop_table shop_table_responsive my_account_orders account-orders-table wc-bis-active-notifications-table">
	<thead>
		<tr>
			<th>
				<?php esc_html_e( 'ID', 'woocommerce-back-in-stock-notifications' ); ?>
			</th>
			<th>
				<?php esc_html_e( 'Product', 'woocommerce-back-in-stock-notifications' ); ?>
			</th>
			<th>
				<?php esc_html_e( 'Stock status', 'woocommerce-back-in-stock-notifications' ); ?>
			</th>
			<th>
				<?php esc_html_e( 'Date', 'woocommerce-back-in-stock-notifications' ); ?>
			</th>
			<th>
				<?php esc_html_e( 'Waiting', 'woocommerce-back-in-stock-notifications' ); ?>
			</th>
			<th>
				<?php esc_html_e( 'Actions', 'woocommerce-back-in-stock-notifications' ); ?>
			</th>
		</tr>
	</thead>
	<tbody>

		<?php if ( $has_notifications && ! empty( $notifications ) ) : ?>

			<?php foreach ( $notifications as $notification ) : ?>
				<?php
				$product = $notification->get_product();
				if ( ! $product ) {
					continue;
				}
				?>
				<tr>
					<td class="woocommerce-orders-table__cell" data-title="<?php esc_attr_e( 'ID', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php echo esc_html( sprintf( '#%d', $notification->get_id() ) ); ?>
					</td>
					<td class="woocommerce-orders-table__cell woocommerce-backinstock-table__cell__product" data-title="<?php esc_attr_e( 'Product', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php
						echo wp_kses_post( sprintf( '<a href="%s">%s</a>', $notification->get_product_permalink(), $notification->get_product_name() ) );

						$formatted_variation_list = $notification->get_product_formatted_variation_list( true );
						if ( $formatted_variation_list ) {
							echo wp_kses_post( '<span class="description">' . $formatted_variation_list . '</span>' );
						}
						?>
					</td>
					<td class="woocommerce-orders-table__cell" data-title="<?php esc_attr_e( 'Stock status', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php
						if ( $product->is_in_stock() ) {
							echo '<div class="stock" >' . esc_html__( 'In stock', 'woocommerce-back-in-stock-notifications' ) . '</div>';
						} else {
							echo '<div class="outofstock" >' . esc_html__( 'Out of stock', 'woocommerce-back-in-stock-notifications' ) . '</div>';
						}
						?>
					</td>
					<td data-title="<?php esc_attr_e( 'Date', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php echo $notification->get_subscribe_date() ? esc_html( date_i18n( wc_date_format(), $notification->get_subscribe_date() ) ) : '&mdash;'; ?>
					</td>
					<td class="woocommerce-orders-table__cell" data-title="<?php esc_attr_e( 'Waiting', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php
						if ( ! $notification->is_delivered() && $notification->get_subscribe_date() ) {

							$time_diff = time() - $notification->get_subscribe_date();
							$t_time    = date_i18n( _x( 'Y/m/d g:i:s a', 'myaccount table date hover format', 'woocommerce-back-in-stock-notifications' ), $notification->get_subscribe_date() );

							if ( $time_diff > 0 && $time_diff < DAY_IN_SECONDS ) {
								$h_time = wp_kses_post( human_time_diff( $notification->get_subscribe_date() ) );
							} else {
								$h_time = date_i18n( wc_date_format(), $notification->get_subscribe_date() );
							}

							echo '<span title="' . esc_attr( $t_time ) . '">' . esc_html( $h_time ) . '</span>';

						} else {
							echo '&mdash;';
						}
						?>
					</td>
					<td class="woocommerce-orders-table__cell woocommerce-orders-table__cell-notification-actions" data-title="<?php esc_attr_e( 'Actions', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php
						echo wp_kses_post(
							sprintf(
								'<a class="%3$s" href="%1$s">%2$s</a>',
								wp_nonce_url( add_query_arg( array( 'wc_bis_deactivate' => $notification->get_id() ), WC_BIS()->account->get_endpoint_url() ), 'deactivate_notification_account_nonce' ),
								__( 'Deactivate', 'woocommerce-back-in-stock-notifications' ),
								esc_attr( $button_class )
							)
						);
						?>
					</td>

				</tr>
			<?php endforeach; ?>

		<?php else : ?>

			<td colspan="6"><?php esc_html_e( 'No active notifications found.', 'woocommerce-back-in-stock-notifications' ); ?></td>

		<?php endif; ?>
	</tbody>
</table>

<?php if ( 1 < $total_notifications_pages ) : ?>
	<div class="woocommerce-pagination woocommerce-pagination--without-numbers woocommerce-Pagination">
		<?php if ( 1 !== $notifications_current_page ) : ?>
			<a class="woocommerce-button woocommerce-button--previous woocommerce-Button woocommerce-Button--previous button" href="<?php echo esc_url( wc_get_endpoint_url( 'backinstock', $notifications_current_page - 1 . '|' . $activities_current_page ) ); ?>"><?php esc_html_e( 'Previous', 'woocommerce' ); ?></a>
		<?php endif; ?>

		<?php if ( intval( $total_notifications_pages ) !== $notifications_current_page ) : ?>
			<a class="woocommerce-button woocommerce-button--next woocommerce-Button woocommerce-Button--next button" href="<?php echo esc_url( wc_get_endpoint_url( 'backinstock', $notifications_current_page + 1 . '|' . $activities_current_page ) ); ?>"><?php esc_html_e( 'Next', 'woocommerce' ); ?></a>
		<?php endif; ?>
	</div>
<?php endif; ?>

<?php if ( (bool) apply_filters( 'woocommerce_bis_account_show_activities', true ) ) : ?>

	<h2><?php esc_html_e( 'Your Activity', 'woocommerce-back-in-stock-notifications' ); ?></h2>

	<table class="woocommerce-orders-table woocommerce-notifications-activity-table woocommerce-MyAccount-orders shop_table shop_table_responsive my_account_orders account-orders-table wc-bis-notifications-activity-table">
		<thead>
			<tr>
				<th>
					<?php esc_html_e( 'Date', 'woocommerce-back-in-stock-notifications' ); ?>
				</th>
				<th>
					<?php esc_html_e( 'Description', 'woocommerce-back-in-stock-notifications' ); ?>
				</th>
			</tr>
		</thead>
		<tbody>
			<?php if ( $has_activities ) : ?>

				<?php foreach ( $activities as $activity ) : ?>
					<tr>
					<td data-title="<?php esc_attr_e( 'Date', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php echo esc_html( date_i18n( wc_date_format(), $activity->get_date() ) ); ?>
					</td>
					<td data-title="<?php esc_attr_e( 'Description', 'woocommerce-back-in-stock-notifications' ); ?>">
						<?php echo wp_kses_post( wc_bis_get_activity_description( $activity ) ); ?>
					</td>
					</tr>
				<?php endforeach; ?>

			<?php else : ?>

				<td colspan="3"><?php esc_html_e( 'No activity recorded just yet', 'woocommerce-back-in-stock-notifications' ); ?></td>

			<?php endif; ?>
		</tbody>
	</table>

	<?php if ( 1 < $total_activities_pages ) : ?>
		<div class="woocommerce-pagination woocommerce-pagination--without-numbers woocommerce-Pagination">
			<?php if ( 1 !== $activities_current_page ) : ?>
				<a class="woocommerce-button woocommerce-button--previous woocommerce-Button woocommerce-Button--previous button" href="<?php echo esc_url( wc_get_endpoint_url( 'backinstock', $notifications_current_page . '|' . ( $activities_current_page - 1 ) ) ); ?>"><?php esc_html_e( 'Previous', 'woocommerce' ); ?></a>
			<?php endif; ?>

			<?php if ( intval( $total_activities_pages ) !== $activities_current_page ) : ?>
				<a class="woocommerce-button woocommerce-button--next woocommerce-Button woocommerce-Button--next button" href="<?php echo esc_url( wc_get_endpoint_url( 'backinstock', $notifications_current_page . '|' . ( $activities_current_page + 1 ) ) ); ?>"><?php esc_html_e( 'Next', 'woocommerce' ); ?></a>
			<?php endif; ?>
		</div>
	<?php endif; ?>

<?php endif; ?>

<?php do_action( 'woocommerce_bis_after_account_backinstock', $has_notifications ); ?>
