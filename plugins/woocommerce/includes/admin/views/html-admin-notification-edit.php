<?php
/**
 * Admin View: Notification edit
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 * @version  1.2.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap woocommerce woocommerce-bis-notifications">

	<?php WC_BIS_Admin_Menus::render_tabs(); ?>

	<h1 class="wp-heading-inline"><?php esc_html_e( 'Edit Notification', 'woocommerce-back-in-stock-notifications' ); ?></h1>
	<a href="<?php echo esc_url( admin_url( WC_BIS_Admin_Notifications_Page::PAGE_URL ) ); ?>" class="page-title-action"><?php esc_html_e( 'View All', 'woocommerce-back-in-stock-notifications' ); ?></a>
	<a href="<?php echo esc_url( add_query_arg( array( 'section' => 'create' ), admin_url( WC_BIS_Admin_Notifications_Page::PAGE_URL ) ) ); ?>" class="page-title-action"><?php esc_html_e( 'Add New', 'woocommerce-back-in-stock-notifications' ); ?></a>

	<hr class="wp-header-end">

	<form method="POST" id="edit-notification-form">
	<?php wp_nonce_field( 'woocommerce-bis-edit', 'bis_edit_security' ); ?>

	<div id="poststuff">
		<div id="post-body" class="columns-2">

			<!-- SIDEBAR -->
			<div id="postbox-container-1" class="postbox-container">

				<div id="woocommerce-order-actions" class="postbox">

					<h2 class="hndle ui-sortable-handle"><span><?php esc_html_e( 'Notification actions', 'woocommerce-back-in-stock-notifications' ); ?></span></h2>

					<div class="inside">
						<ul class="order_actions submitbox">

							<li class="wide" id="actions">
								<select name="wc_bis_action">
									<option value=""><?php esc_html_e( 'Choose an action...', 'woocommerce-back-in-stock-notifications' ); ?></option>
									<?php if ( $notification->is_verified() ) : ?>
										<option value="send_notification"><?php esc_html_e( 'Send', 'woocommerce-back-in-stock-notifications' ); ?></option>
										<?php if ( $notification->is_active() ) : ?>
											<option value="disable_notification"><?php esc_html_e( 'Deactivate', 'woocommerce-back-in-stock-notifications' ); ?></option>
										<?php else : ?>
											<option value="enable_notification"><?php esc_html_e( 'Reactivate', 'woocommerce-back-in-stock-notifications' ); ?></option>
										<?php endif; ?>
									<?php else : ?>
										<option value="send_verification_email"><?php esc_html_e( 'Resend verification email', 'woocommerce-back-in-stock-notifications' ); ?></option>
									<?php endif; ?>
								</select>
								<button class="button wc-reload"><span><?php esc_html_e( 'Apply', 'woocommerce' ); ?></span></button>
							</li>

							<li class="wide">
								<div id="delete-action">
									<a class="submitdelete deletion" href="<?php echo esc_url( wp_nonce_url( admin_url( sprintf( 'admin.php?page=bis_notifications&section=delete&notification=%d', $notification->get_id() ) ), 'delete_notification' ) ); ?>"><?php esc_html_e( 'Delete permanently', 'woocommerce-back-in-stock-notifications' ); ?></a>
								</div>

								<button type="submit" class="button save_order button-primary" name="save" value="<?php esc_attr_e( 'Update', 'woocommerce-back-in-stock-notifications' ); ?>"><?php esc_html_e( 'Update', 'woocommerce-back-in-stock-notifications' ); ?></button>
							</li>

						</ul>
					</div>

				</div><!-- .postbox -->

			</div><!-- #container1 -->

			<!-- MAIN -->
			<div id="postbox-container-2" class="postbox-container">

				<div id="notification-data" class="postbox notification-data">

					<div class="notification-data__row notification-data__row--columns">

						<div class="notification-data__header-column">

							<h2 class="notification-data__header">
								<?php
								/* translators: %s: Notification ID */
								echo esc_html( sprintf( __( 'Notification #%d details', 'woocommerce-back-in-stock-notifications' ), $notification->get_id() ) );
								?>
							</h2>

						</div>

						<div class="notification-data__status-column">
							<?php
							// Queued status.
							if ( $notification->is_queued() ) {
								$key   = 'on-hold';
								$label = __( 'Queued', 'woocommerce-back-in-stock-notifications' );
								printf( '<mark class="order-status %s"><span>%s</span></mark>', esc_attr( sanitize_html_class( 'status-' . $key ) ), esc_html( $label ) );
							}

							// Sent status.
							if ( $notification->is_delivered() ) {
								$key     = 'completed';
								$label   = __( 'Delivered', 'woocommerce-back-in-stock-notifications' );
								$tooltip = wc_sanitize_tooltip( sprintf( 'Last notified at %s', esc_html( date_i18n( get_option( 'date_format' ), esc_html( $notification->get_last_notified_date() ) ) ) ) );

								printf( '<mark class="order-status %s tips" data-tip="%s"><span>%s</span></mark>', esc_attr( sanitize_html_class( 'status-' . $key ) ), wp_kses_post( $tooltip ), esc_html( $label ) );
							}

							// Verified status.
							if ( ! $notification->is_verified() && $notification->is_pending() ) {
								$key   = 'cancelled';
								$label = __( 'Pending', 'woocommerce-back-in-stock-notifications' );
								printf( '<mark class="order-status %s"><span>%s</span></mark>', esc_attr( sanitize_html_class( 'status-' . $key ) ), esc_html( $label ) );
							}

							// Active status.
							if ( ! $notification->is_active() && ! $notification->is_pending() ) {
								$key   = 'cancelled';
								$label = __( 'Inactive', 'woocommerce-back-in-stock-notifications' );
								printf( '<mark class="order-status %s"><span>%s</span></mark>', esc_attr( sanitize_html_class( 'status-' . $key ) ), esc_html( $label ) );
							}

							?>
						</div>

					</div><!-- #row -->

					<div class="notification-data__row notification-data__row--columns">

						<div class="notification-data__form-field">
							<label><?php esc_html_e( 'Customer', 'woocommerce-back-in-stock-notifications' ); ?></label>
							<?php
							$user_string = '&mdash;';
							$user_id     = $notification->get_user_id();
							if ( $user_id ) {

								$user = get_user_by( 'id', $user_id );
								if ( is_a( $user, 'WP_User' ) ) {
									$user_string = $user->display_name;
								}
							} elseif ( wc_bis_is_email( $notification->get_user_email() ) ) {
								$user_string = $notification->get_user_email();
							}
							?>
							<p class="notification-data__customer-data"><?php echo esc_html( $user_string ); ?></p>

							<div class="form-field__actions">
								<?php if ( isset( $user ) && is_a( $user, 'WP_User' ) ) { ?>
									<a href="<?php echo esc_url( get_edit_user_link( $user->ID ) ); ?>"><?php esc_html_e( 'View profile &rarr;', 'woocommerce-back-in-stock-notifications' ); ?></a>
								<?php } ?>
								<a href="<?php echo esc_url( admin_url( self::PAGE_URL . '&s=' . urlencode( $notification->get_user_email() ) ) ); ?>"><?php esc_html_e( 'View notifications &rarr;', 'woocommerce-back-in-stock-notifications' ); ?></a>
							</div>

							<div class="wp-clearfix"></div>

							<div class="notification-data__form-field">

								<label for="status"><?php esc_html_e( 'Status', 'woocommerce-back-in-stock-notifications' ); ?></label>
								<select name="status" class="wc_bis_status_select"<?php echo ! $notification->is_verified() ? ' disabled="disabled"' : ''; ?>>
									<option value="on" <?php selected( $notification->is_active(), true ); ?>><?php esc_html_e( 'Active', 'woocommerce-back-in-stock-notifications' ); ?></option>
									<option value="off" <?php selected( $notification->is_active(), false ); ?>><?php esc_html_e( 'Inactive', 'woocommerce-back-in-stock-notifications' ); ?></option>
								</select>

							</div>

						</div>

						<div class="notification-data__form-field">

							<label><?php esc_html_e( 'Product', 'woocommerce-back-in-stock-notifications' ); ?></label>

							<div class="notification-data__product-data">
								<?php
								$product = $notification->get_product();
								if ( is_a( $product, 'WC_Product' ) ) {
									include __DIR__ . '/html-bis-product-data-admin.php';
								} else {
									?>
									<small><?php esc_html_e( 'Product not found.', 'woocommerce-back-in-stock-notifications' ); ?></small>
									<?php
								}
								?>
							</div>

						</div>

					</div><!-- #row -->

					<div class="notification-data__meta">
						<div class="notification-data__row notification-data__row--columns">

							<div class="notification-data__meta-column">
								<div class="notification-data__meta-data">
									<label><?php esc_html_e( 'Waiting', 'woocommerce-back-in-stock-notifications' ); ?></label>
									<span>
										<?php
										if ( 0 === $notification->get_subscribe_date() || $notification->is_delivered() || ! $notification->is_active() ) {
											echo '<span>&mdash;</span>';
										} else {
											$t_time = date_i18n( _x( 'Y/m/d g:i:s a', 'notification edit date hover format', 'woocommerce-back-in-stock-notifications' ), $notification->get_subscribe_date() );
											?>
											<span title="<?php echo esc_attr( $t_time ); ?>"><?php echo esc_html( human_time_diff( $notification->get_subscribe_date() ) ); ?></span>
										<?php } ?>
									</span>
								</div>
								<div class="notification-data__meta-data">
									<label><?php esc_html_e( 'Signed up', 'woocommerce-back-in-stock-notifications' ); ?></label>
									<span><?php echo esc_html( date_i18n( get_option( 'date_format' ), $notification->get_create_date() ) ); ?></span>
								</div>
							</div><!-- .column -->

							<div class="notification-data__meta-column">
								<div class="notification-data__meta-data">
									<label><?php esc_html_e( 'Signed-up customers', 'woocommerce-back-in-stock-notifications' ); ?></label>
									<span>
										<?php
										$count = wc_bis_get_notifications_count( $notification->get_product_id(), false );
										echo absint( $count );

										if ( $count > 0 ) {
											?>
											<a href="<?php echo esc_attr( add_query_arg( array( 'bis_product_filter' => $notification->get_product_id() ), self::PAGE_URL ) ); ?>"><?php esc_html_e( 'View notifications &rarr;', 'woocommerce-back-in-stock-notifications' ); ?></a>
										<?php } ?>
									</span>
								</div>
								<?php
								$attributes = $notification->get_product_formatted_variation_list( true );
								if ( ! empty( $attributes ) ) {
									?>
									<div class="notification-data__meta-data">
										<label><?php esc_html_e( 'Attributes', 'woocommerce-back-in-stock-notifications' ); ?></label>
										<span>
											<?php echo wp_kses_post( $attributes ); ?>
										</span>
									</div>
								<?php } ?>

							</div><!-- .column -->

						</div>
					</div>

				</div><!-- .postbox -->

				<h2 class="activity-table-title"><?php esc_html_e( 'Activity', 'woocommerce-back-in-stock-notifications' ); ?></h2>
				<input type="hidden" name="page" value="<?php echo isset( $_REQUEST['page'] ) ? intval( $_REQUEST['page'] ) : 1; ?>"/>
				<?php $activity_table->display(); ?>

			</div><!-- #container2 -->

		</div><!-- #post-body -->
	</div>

	</form>

</div>
