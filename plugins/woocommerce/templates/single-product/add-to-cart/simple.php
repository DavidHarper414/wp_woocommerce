<?php
/**
 * Simple product add to cart
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/add-to-cart/simple.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 7.0.1
 */

defined( 'ABSPATH' ) || exit;

global $product;

if ( ! $product->is_purchasable() ) {
	return;
}

echo wc_get_stock_html( $product ); // WPCS: XSS ok.

if ( $product->is_in_stock() ) : ?>

	<?php do_action( 'woocommerce_before_add_to_cart_form' ); ?>

	<form class="cart" id="ajax_add_to_cart_form" data-product_id="<?php echo esc_attr( $product->get_id() ); ?>">
		<?php do_action( 'woocommerce_before_add_to_cart_button' ); ?>

		<?php
		do_action( 'woocommerce_before_add_to_cart_quantity' );

		woocommerce_quantity_input(
			array(
				'min_value'   => apply_filters( 'woocommerce_quantity_input_min', $product->get_min_purchase_quantity(), $product ),
				'max_value'   => apply_filters( 'woocommerce_quantity_input_max', $product->get_max_purchase_quantity(), $product ),
				'input_value' => isset( $_POST['quantity'] ) ? wc_stock_amount( wp_unslash( $_POST['quantity'] ) ) : $product->get_min_purchase_quantity(), // WPCS: CSRF ok, input var ok.
			)
		);

		do_action( 'woocommerce_after_add_to_cart_quantity' );
		?>

		<button type="button" class="single_add_to_cart_button button alt<?php echo esc_attr( wc_wp_theme_get_element_class_name( 'button' ) ? ' ' . wc_wp_theme_get_element_class_name( 'button' ) : '' ); ?>" id="ajax_add_to_cart_button">
			<?php echo esc_html( $product->single_add_to_cart_text() ); ?>
		</button>

		<?php do_action( 'woocommerce_after_add_to_cart_button' ); ?>
	</form>

	<?php do_action( 'woocommerce_after_add_to_cart_form' ); ?>

<?php endif; ?>

<script>
jQuery(document).ready(function($) {
	$('#ajax_add_to_cart_button').on('click', function(e) {
		e.preventDefault();
		var form = $('#ajax_add_to_cart_form');
		var product_id = form.data('product_id');
		var quantity = form.find('input[name="quantity"]').val();
		let currentNonce = '';
		const storedNonceValue = window.localStorage.getItem( 'storeApiNonce' );
		const storedNonce = storedNonceValue ? JSON.parse( storedNonceValue ) : {};
		currentNonce = storedNonce?.nonce || '';
		$.ajax({
			type: 'POST',
			url: window.location.origin+'/index.php?rest_route=/wc/store/v1/batch&_locale=site',
			data: {
				requests: [
					{
						"path": "/wc/store/v1/cart/add-item",
						"method": "POST",
						"cache": "no-store",
						"body": {
							"id": product_id,
							"quantity": quantity
						},
						"headers": {
							"Nonce": currentNonce
						}
					}
				]
			},
			beforeSend: () => {
				$( document.body ).trigger( 'adding_to_cart' );
				$("#ajax_add_to_cart_button").addClass("loading");
			},
			success: () => {
				$( document.body ).trigger( 'added_to_cart' );
				$("#ajax_add_to_cart_button").removeClass("loading");
			}
		});
	});
});
</script>
