/**
 * Internal dependencies
 */
import { BlueprintStep } from './types';

const OPTIONS_GROUPS = {
	woocommerce_store_address: 'general',
	woocommerce_store_address_2: 'general',
	woocommerce_store_city: 'general',
	woocommerce_default_country: 'general',
	woocommerce_store_postcode: 'general',
	woocommerce_allowed_countries: 'general',
	woocommerce_all_except_countries: 'general',
	woocommerce_specific_allowed_countries: 'general',
	woocommerce_ship_to_countries: 'general',
	woocommerce_specific_ship_to_countries: 'general',
	woocommerce_default_customer_address: 'general',
	woocommerce_calc_taxes: 'general',
	woocommerce_enable_coupons: 'general',
	woocommerce_calc_discounts_sequentially: 'general',
	woocommerce_currency: 'general',
	woocommerce_currency_pos: 'general',
	woocommerce_price_thousand_sep: 'general',
	woocommerce_price_decimal_sep: 'general',
	woocommerce_price_num_decimals: 'general',
	woocommerce_shop_page_id: 'products',
	woocommerce_cart_redirect_after_add: 'products',
	woocommerce_enable_ajax_add_to_cart: 'products',
	woocommerce_placeholder_image: 'products',
	woocommerce_weight_unit: 'products',
	woocommerce_dimension_unit: 'products',
	woocommerce_enable_reviews: 'products',
	woocommerce_review_rating_verification_label: 'products',
	woocommerce_review_rating_verification_required: 'products',
	woocommerce_enable_review_rating: 'products',
	woocommerce_review_rating_required: 'products',
	woocommerce_manage_stock: 'products',
	woocommerce_hold_stock_minutes: 'products',
	woocommerce_notify_low_stock: 'products',
	woocommerce_notify_no_stock: 'products',
	woocommerce_stock_email_recipient: 'products',
	woocommerce_notify_low_stock_amount: 'products',
	woocommerce_notify_no_stock_amount: 'products',
	woocommerce_hide_out_of_stock_items: 'products',
	woocommerce_stock_format: 'products',
	woocommerce_file_download_method: 'products',
	woocommerce_downloads_redirect_fallback_allowed: 'products',
	woocommerce_downloads_require_login: 'products',
	woocommerce_downloads_grant_access_after_payment: 'products',
	woocommerce_downloads_deliver_inline: 'products',
	woocommerce_downloads_add_hash_to_filename: 'products',
	woocommerce_downloads_count_partial: 'products',
	woocommerce_attribute_lookup_enabled: 'products',
	woocommerce_attribute_lookup_direct_updates: 'products',
	woocommerce_attribute_lookup_optimized_updates: 'products',
	woocommerce_product_match_featured_image_by_sku: 'products',
	woocommerce_bacs_settings: 'payments',
	woocommerce_cheque_settings: 'payments',
	woocommerce_cod_settings: 'payments',
	woocommerce_enable_guest_checkout: 'accounts',
	woocommerce_enable_checkout_login_reminder: 'accounts',
	woocommerce_enable_delayed_account_creation: 'accounts',
	woocommerce_enable_signup_and_login_from_checkout: 'accounts',
	woocommerce_enable_myaccount_registration: 'accounts',
	woocommerce_registration_generate_password: 'accounts',
	woocommerce_erasure_request_removes_order_data: 'accounts',
	woocommerce_erasure_request_removes_download_data: 'accounts',
	woocommerce_allow_bulk_remove_personal_data: 'accounts',
	woocommerce_registration_privacy_policy_text: 'accounts',
	woocommerce_checkout_privacy_policy_text: 'accounts',
	woocommerce_delete_inactive_accounts: 'accounts',
	woocommerce_trash_pending_orders: 'accounts',
	woocommerce_trash_failed_orders: 'accounts',
	woocommerce_trash_cancelled_orders: 'accounts',
	woocommerce_anonymize_refunded_orders: 'accounts',
	woocommerce_anonymize_completed_orders: 'accounts',
	woocommerce_email_from_name: 'emails',
	woocommerce_email_from_address: 'emails',
	woocommerce_email_header_image: 'emails',
	woocommerce_email_base_color: 'emails',
	woocommerce_email_background_color: 'emails',
	woocommerce_email_body_background_color: 'emails',
	woocommerce_email_text_color: 'emails',
	woocommerce_email_footer_text: 'emails',
	woocommerce_email_footer_text_color: 'emails',
	woocommerce_email_auto_sync_with_theme: 'emails',
	woocommerce_merchant_email_notifications: 'emails',
	woocommerce_coming_soon: 'site visibility',
	woocommerce_store_pages_only: 'site visibility',
	woocommerce_cart_page_id: 'advanced',
	woocommerce_checkout_page_id: 'advanced',
	woocommerce_myaccount_page_id: 'advanced',
	woocommerce_terms_page_id: 'advanced',
	woocommerce_checkout_pay_endpoint: 'advanced',
	woocommerce_checkout_order_received_endpoint: 'advanced',
	woocommerce_myaccount_add_payment_method_endpoint: 'advanced',
	woocommerce_myaccount_delete_payment_method_endpoint: 'advanced',
	woocommerce_myaccount_set_default_payment_method_endpoint: 'advanced',
	woocommerce_myaccount_orders_endpoint: 'advanced',
	woocommerce_myaccount_view_order_endpoint: 'advanced',
	woocommerce_myaccount_downloads_endpoint: 'advanced',
	woocommerce_myaccount_edit_account_endpoint: 'advanced',
	woocommerce_myaccount_edit_address_endpoint: 'advanced',
	woocommerce_myaccount_payment_methods_endpoint: 'advanced',
	woocommerce_myaccount_lost_password_endpoint: 'advanced',
	woocommerce_logout_endpoint: 'advanced',
	woocommerce_api_enabled: 'advanced',
	woocommerce_allow_tracking: 'advanced',
	woocommerce_show_marketplace_suggestions: 'advanced',
	woocommerce_custom_orders_table_enabled: 'advanced',
	woocommerce_custom_orders_table_data_sync_enabled: 'advanced',
	woocommerce_analytics_enabled: 'advanced',
	woocommerce_feature_rate_limit_checkout_enabled: 'advanced',
	woocommerce_feature_order_attribution_enabled: 'advanced',
	woocommerce_feature_site_visibility_badge_enabled: 'advanced',
	woocommerce_feature_remote_logging_enabled: 'advanced',
	woocommerce_feature_email_improvements_enabled: 'advanced',
	woocommerce_feature_blueprint_enabled: 'advanced',
	woocommerce_feature_product_block_editor_enabled: 'advanced',
	woocommerce_hpos_fts_index_enabled: 'advanced',
	woocommerce_feature_cost_of_goods_sold_enabled: 'advanced',
};

/**
 * Get option groups from options
 *
 * Takes a list of options and return the groups they belong to.
 *
 * In this context, groups are the sections in the settings page (e.g. General, Products, Payments, etc).
 *
 * @param  options a list of options
 * @return {string[]} a list of groups
 */
export const getOptionGroups = ( options: string[] ) => {
	const groups = new Set();
	options.forEach( ( option ) => {
		if ( OPTIONS_GROUPS[ option as keyof typeof OPTIONS_GROUPS ] ) {
			groups.add(
				OPTIONS_GROUPS[ option as keyof typeof OPTIONS_GROUPS ]
			);
		}
	} );
	return Array.from( groups );
};

/**
 * Take an array of Blueprint steps, filter `setSiteOptions` steps and return the groups of options
 *
 * @param steps a list of Blueprint steps
 * @return string[] a list of groups
 */
export const getOptionGroupsFromSteps = (
	steps: ( BlueprintStep & { options?: Record< string, string > } )[]
) => {
	const options = steps.reduce< string[] >( ( acc, step ) => {
		// Explicitly set acc as string[]
		if ( step.step === 'setSiteOptions' && step.options ) {
			acc.push( ...Object.keys( step.options ) );
		}
		return acc;
	}, [] );

	return getOptionGroups( options );
};
