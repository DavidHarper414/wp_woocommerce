<?php
/**
 * Admin export notifications modal html
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 * @version  1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?><div class="woocommerce_bis_export_form woocommerce-exporter-wrapper">
	<div class="bis_export_form_inner woocommerce-exporter">

		<section>
			<p><?php esc_html_e( 'Generate and download a CSV file with notification sign-up data.', 'woocommerce-back-in-stock-notifications' ); ?></p>
		</section>

		<section>
			<table class="form-table woocommerce-exporter-options">
				<tr>
					<td colspan="2">
						<h3 class="subheader"><?php esc_html_e( 'Options', 'woocommerce-back-in-stock-notifications' ); ?></h3>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="woocommerce-exporter-filtered"><?php esc_html_e( 'Apply current filters', 'woocommerce-back-in-stock-notifications' ); ?></label>
					</th>
					<td>
						<input type="checkbox" id="woocommerce-exporter-filtered" value="1">
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="woocommerce-exporter-meta"><?php esc_html_e( 'Export custom meta', 'woocommerce-back-in-stock-notifications' ); ?></label>
					</th>
					<td>
						<input type="checkbox" id="woocommerce-exporter-meta" value="1">
					</td>
				</tr>
			</table>

			<progress class="woocommerce-exporter-progress" max="100" value="0"></progress>
		</section>
		<div class="wc-actions">
			<button type="submit" class="woocommerce-exporter-button button button-primary" value="Generate CSV"><?php esc_html_e( 'Download CSV', 'woocommerce-back-in-stock-notifications' ); ?></button>
		</div>
	</div>
</div>
