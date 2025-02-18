<?php
/**
 * Admin View: Notification create
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap woocommerce woocommerce-bis-notifications">

	<?php WC_BIS_Admin_Menus::render_tabs(); ?>

	<h1 class="wp-heading-inline"><?php esc_html_e( 'Add notification', 'woocommerce' ); ?></h1>
	<a href="<?php echo esc_url( admin_url( WC_BIS_Admin_Notifications_Page::PAGE_URL ) ); ?>" class="page-title-action"><?php esc_html_e( 'View All', 'woocommerce' ); ?></a>

	<hr class="wp-header-end">

	<form method="POST" id="edit-notification-form">
	<?php wp_nonce_field( 'woocommerce-bis-edit', 'bis_edit_security' ); ?>

	<div id="poststuff">
		<div id="post-body" class="columns-2">

			<!-- SIDEBAR -->
			<div id="postbox-container-1" class="postbox-container">

				<div id="woocommerce-order-actions" class="postbox">

					<h2 class="hndle ui-sortable-handle"><span><?php esc_html_e( 'Notification actions', 'woocommerce' ); ?></span></h2>

					<div class="inside">
						<ul class="order_actions submitbox">

							<li class="wide" id="actions">
								<select name="wc_bis_action" disabled="disabled">
									<option value=""><?php esc_html_e( 'Choose an action...', 'woocommerce' ); ?></option>
								</select>
								<button class="button wc-reload" disabled="disabled"><span><?php esc_html_e( 'Apply', 'woocommerce' ); ?></span></button>
							</li>

							<li class="wide">
								<button type="submit" class="button save_order button-primary" name="create_save" value="<?php esc_attr_e( 'Create', 'woocommerce' ); ?>"><?php esc_html_e( 'Create', 'woocommerce' ); ?></button>
							</li>

						</ul>
					</div>

				</div><!-- .postbox -->

			</div><!-- #container1 -->

			<!-- MAIN -->
			<div id="postbox-container-2" class="postbox-container">

				<div id="notification-data" class="postbox notification-data notification-data--create">
					<div class="notification-data__row notification-data__row--columns">

						<div class="notification-data__header-column">

							<h2 class="notification-data__header">
								<?php esc_html_e( 'Notification details', 'woocommerce' ); ?>
							</h2>

						</div>

					</div><!-- #row -->

					<div class="notification-data__row notification-data__row--columns">

						<div class="notification-data__form-field sw-select2-autoinit">
							<label><?php esc_html_e( 'Customer', 'woocommerce' ); ?></label>
							<?php
							$user_string = '';
							$user_id     = '';

							if ( ! empty( $args['user_id'] ) ) {

								$user_id = wc_clean( $args['user_id'] );
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
							<select class="sw-select2-search--customers" name="user_id" data-placeholder="<?php esc_attr_e( 'Search for a customer&hellip;', 'woocommerce' ); ?>" data-allow_clear="true">
								<?php if ( $user_string && $user_id ) { ?>
									<option value="<?php echo esc_attr( $user_id ); ?>" selected="selected"><?php echo wp_kses_post( htmlspecialchars( $user_string, ENT_COMPAT ) ); ?><option>
								<?php } ?>
							</select>
							<div class="divider"></div>
							<span class="or_relation_label"><?php esc_html_e( '&mdash;&nbsp;or&nbsp;&mdash;', 'woocommerce' ); ?></span>
							<input type="text" class="or_relation_label__input" placeholder="<?php esc_html_e( 'Enter customer e-mail&hellip;', 'woocommerce' ); ?>" name="user_email" value="<?php echo isset( $args['user_email'] ) ? esc_attr( wc_clean( $args['user_email'] ) ) : ''; ?>"/>

							<div class="wp-clearfix"></div>

							<div class="notification-data__form-field">
								<label for="status"><?php esc_html_e( 'Status', 'woocommerce' ); ?></label>
								<select name="status" class="wc_bis_status_select">
									<option value="on" <?php selected( ! isset( $args['status'] ) || 'on' === $args['status'], true ); ?>><?php esc_html_e( 'Active', 'woocommerce' ); ?></option>
									<option value="off" <?php selected( isset( $args['status'] ) && 'off' === $args['status'], true ); ?>><?php esc_html_e( 'Inactive', 'woocommerce' ); ?></option>
								</select>

							</div>
						</div>

						<div class="notification-data__form-field sw-select2-autoinit">

							<label><?php esc_html_e( 'Product', 'woocommerce' ); ?></label>
							<?php
							$product_string = '';
							$product_id     = '';

							if ( ! empty( $args['product_id'] ) ) {

								$product_id = wc_clean( $args['product_id'] );
								$product    = wc_get_product( absint( $product_id ) );

								if ( is_a( $product, 'WC_Product' ) ) {
									$product_string = sprintf(
										/* translators: 1: product title 2: product ID */
										esc_html__( '%1$s (#%2$s)', 'woocommerce' ),
										$product->get_parent_id() ? $product->get_name() : $product->get_title(),
										absint( $product->get_id() )
									);
								}
							}
							?>
							<select class="sw-select2-search--products" name="product_id" data-action="wc_bis_json_search_products_for_notification" data-placeholder="<?php esc_attr_e( 'Select product&hellip;', 'woocommerce' ); ?>" data-allow_clear="true">
								<?php if ( $product_string && $product_id ) { ?>
									<option value="<?php echo esc_attr( $product_id ); ?>" selected="selected"><?php echo wp_kses_post( htmlspecialchars( $product_string, ENT_COMPAT ) ); ?><option>
								<?php } ?>
							</select>

							<div class="notification-data__product-data">
								<?php
								if ( ! empty( $args['product_id'] ) && isset( $product ) && is_a( $product, 'WC_Product' ) ) {
									include __DIR__ . '/html-bis-product-data-admin.php';
								}
								?>
							</div>
						</div>

					</div><!-- #row -->

				</div><!-- .postbox -->

			</div><!-- #container2 -->

		</div><!-- #post-body -->
	</div>

	</form>

</div>
