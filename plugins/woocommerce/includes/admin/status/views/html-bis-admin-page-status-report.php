<?php
/**
 * Status Report data.
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?><table class="wc_status_table widefat" cellspacing="0" id="status">
	<thead>
		<tr>
			<th colspan="3" data-export-label="Back In Stock"><h2><?php esc_html_e( 'Back In Stock Notifications', 'woocommerce-back-in-stock-notifications' ); ?></h2></th>
		</tr>
	</thead>
	<tbody>

		<tr>
			<td data-export-label="Loopback Test"><?php esc_html_e( 'Loopback test', 'woocommerce-back-in-stock-notifications' ); ?>:</td>
			<td class="help"><?php echo wc_help_tip( esc_html__( 'Loopback requests are used by WooCommerce to process tasks in the background.', 'woocommerce-back-in-stock-notifications' ) ); ?></td>
			<td>
			<?php

			if ( 'pass' === $debug_data['loopback_test_result'] ) {
				echo '<mark class="yes"><span class="dashicons dashicons-yes"></span></mark>';
			} elseif ( '' === $debug_data['loopback_test_result'] ) {
				echo '<mark class="no">&ndash;</mark>';
			} else {
				echo '<mark class="error"><span class="dashicons dashicons-warning"></span> ' . esc_html__( 'Loopback test failed.', 'woocommerce-back-in-stock-notifications' ) . '</mark>';
			}
			?>
			</td>
		</tr>
	</tbody>
</table>
