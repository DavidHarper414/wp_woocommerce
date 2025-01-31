<?php
/**
 * Admin View: Stock Notifications list
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

	<h1 class="wp-heading-inline"><?php esc_html_e( 'Notifications', 'woocommerce-back-in-stock-notifications' ); ?></h1>
	<a href="<?php echo esc_url( add_query_arg( array( 'section' => 'create' ), admin_url( WC_BIS_Admin_Notifications_Page::PAGE_URL ) ) ); ?>" class="page-title-action"><?php esc_html_e( 'Add New', 'woocommerce-back-in-stock-notifications' ); ?></a>
	<a href="#" class="page-title-action woocommerce-bis-exporter-button"><?php esc_html_e( 'Export', 'woocommerce-back-in-stock-notifications' ); ?></a>

	<hr class="wp-header-end">
	<?php
	if ( $table->total_items > 0 || $table->bis_has_items ) {
		$table->views();
		?>

		<form id="bis-notifications-table" method="GET">
			<p class="search-box">
				<label for="post-search-input" class="screen-reader-text"><?php esc_html_e( 'Search Notifications', 'woocommerce-back-in-stock-notifications' ); ?>:</label>
				<input type="search" value="<?php echo esc_attr( $search ); ?>" name="s" id="bis-search-input">
				<input type="submit" value="<?php echo esc_attr( 'Search', 'woocommerce-back-in-stock-notifications' ); ?>" class="button" id="search-submit" name="">
			</p>
			<input type="hidden" name="page" value="<?php echo isset( $_REQUEST['page'] ) ? esc_attr( wc_clean( $_REQUEST['page'] ) ) : ''; ?>"/>
			<?php $table->display(); ?>
		</form>

	<?php } else { ?>

		<div class="woocommerce-BlankState">
			<h2 class="woocommerce-BlankState-message">
				<?php esc_html_e( 'No customers have signed up to receive back-in-stock notifications from you just yet.', 'woocommerce-back-in-stock-notifications' ); ?>
			</h2>
			<a class="woocommerce-BlankState-cta button" target="_blank" href="<?php echo esc_attr( WC_BIS()->get_resource_url( 'docs-contents' ) ); ?>"><?php esc_html_e( 'Learn more', 'woocommerce-back-in-stock-notifications' ); ?></a>
		</div>

	<?php } ?>
</div>
