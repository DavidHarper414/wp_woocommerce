<?php
/**
 * Admin View: Activity list
 *
 * @package  WooCommerce Back In Stock Notifications
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap woocommerce woocommerce-bis-notifications">

	<?php WC_BIS_Admin_Menus::render_tabs(); ?>

	<h1 class="wp-heading-inline"><?php esc_html_e( 'Activity', 'woocommerce' ); ?></h1>

	<hr class="wp-header-end">

	<form id="activity-table" method="GET">
		<p class="search-box">
			<label for="post-search-input" class="screen-reader-text"><?php esc_html_e( 'Search activity', 'woocommerce' ); ?>:</label>
			<input type="search" value="<?php echo esc_attr( $search ); ?>" name="s" id="bis-search-input">
			<input type="submit" value="<?php echo esc_attr( 'Search', 'woocommerce' ); ?>" class="button" id="search-submit" name="">
		</p>
		<input type="hidden" name="page" value="<?php echo isset( $_REQUEST['page'] ) ? esc_attr( wc_clean( $_REQUEST['page'] ) ) : ''; ?>"/>
		<?php $table->display(); ?>
	</form>
</div>
