<?php
/**
 * WC_BIS_Settings class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_BIS_Settings' ) ) :

	/**
	 * WooCommerce Back In Stock Notifications Settings.
	 *
	 * @class    WC_BIS_Settings
	 * @version  1.3.0
	 */
	class WC_BIS_Settings extends WC_Settings_Page {

		/**
		 * Constructor.
		 */
		public function __construct() {

			$this->id    = 'bis_settings';
			$this->label = __( 'Stock Notifications', 'woocommerce-back-in-stock-notifications' );

			// Add settings page.
			add_filter( 'woocommerce_settings_tabs_array', array( $this, 'add_settings_page' ), 20 );
			// Output sections.
			add_action( 'woocommerce_sections_' . $this->id, array( $this, 'output_sections' ) );
			// Output content.
			add_action( 'woocommerce_settings_' . $this->id, array( $this, 'output' ) );
			// Process + save data.
			add_action( 'woocommerce_settings_save_' . $this->id, array( $this, 'save' ) );
		}

		/**
		 * Get settings array.
		 *
		 * @return array
		 */
		public function get_settings() {

			return apply_filters(
				'woocommerce_bis_settings',
				array(

					array(
						'title' => __( 'General', 'woocommerce-back-in-stock-notifications' ),
						'type'  => 'title',
						'id'    => 'bis_settings_general',
					),

					array(
						'title'   => __( 'Allow sign-ups', 'woocommerce-back-in-stock-notifications' ),
						'desc'    => __( 'Let customers sign up to be notified when products in your store are restocked.', 'woocommerce-back-in-stock-notifications' ),
						'id'      => 'wc_bis_allow_signups',
						'default' => 'yes',
						'type'    => 'checkbox',
					),

					array(
						'title'   => __( 'Require double opt-in to sign up', 'woocommerce-back-in-stock-notifications' ),
						'desc'    => __( 'To complete the sign-up process, customers must follow a verification link sent to their e-mail after submitting the sign-up form.', 'woocommerce-back-in-stock-notifications' ),
						'id'      => 'wc_bis_double_opt_in_required',
						'default' => 'no',
						'type'    => 'checkbox',
					),

					array(
						'title'   => __( 'Delete unverified notification sign-ups after (in days)', 'woocommerce-back-in-stock-notifications' ),
						'desc'    => __( 'Contols how long the plugin will store unverified notification sign-ups in the database. Enter zero, or leave this field empty if you would like to store expired sign-up requests indefinitey.', 'woocommerce-back-in-stock-notifications' ),
						'id'      => 'wc_bis_delete_unverified_days_threshold',
						'default' => 0,
						'type'    => 'number',
						'class'   => 'double_opt_in_required',
					),

					array(
						'title'    => __( 'Require account to sign up', 'woocommerce-back-in-stock-notifications' ),
						'desc'     => __( 'Customers must be logged in to sign up for stock notifications.', 'woocommerce-back-in-stock-notifications' ),
						'id'       => 'wc_bis_account_required',
						'default'  => 'no',
						'type'     => 'checkbox',
						'desc_tip' => __( 'When enabled, guests will be redirected to a login page to complete the sign-up process.', 'woocommerce-back-in-stock-notifications' ),
					),

					array(
						'title'   => __( 'Create account on sign-up', 'woocommerce-back-in-stock-notifications' ),
						'desc'    => __( 'Create an account when guests sign up for stock notifications.', 'woocommerce-back-in-stock-notifications' ),
						'id'      => 'wc_bis_create_new_account_on_registration',
						'default' => 'no',
						'type'    => 'checkbox',
						'class'   => 'account_required_field',
					),

					array(
						'title'             => __( 'Minimum stock quantity', 'woocommerce-back-in-stock-notifications' ),
						'desc'              => __( 'Stock quantity required to trigger stock notifications when restocking.', 'woocommerce-back-in-stock-notifications' ),
						'id'                => 'wc_bis_stock_threshold',
						'default'           => 0,
						'type'              => 'number',
						'custom_attributes' => array(
							'min'  => 0,
							'step' => 1,
						),
					),

					array(
						'type' => 'sectionend',
						'id'   => 'bis_settings_general',
					),

					array(
						'title' => __( 'Product Page', 'woocommerce-back-in-stock-notifications' ),
						'type'  => 'title',
						'id'    => 'bis_settings_products',
					),

					array(
						'title'   => __( 'Display opt-in checkbox', 'woocommerce-back-in-stock-notifications' ),
						'desc'    => __( 'Enable this option if you would like guests to provide explicit consent in order to sign up.', 'woocommerce-back-in-stock-notifications' ),
						'id'      => 'wc_bis_opt_in_required',
						'default' => 'no',
						'type'    => 'checkbox',
						'class'   => 'account_required_field',
					),

					array(
						'title'             => __( 'Opt-in checkbox text', 'woocommerce-back-in-stock-notifications' ),
						'id'                => 'wc_bis_create_new_account_optin_text',
						'placeholder'       => wc_bis_get_form_privacy_default_text(),
						'default'           => wc_bis_get_form_privacy_default_text(),
						'type'              => 'textarea',
						'custom_attributes' => array(
							'rows' => 5,
						),
						'class'             => 'opt_in_required',
					),

					array(
						'title'    => __( 'Display signed-up customers', 'woocommerce-back-in-stock-notifications' ),
						'desc'     => __( 'Let visitors know how many customers have already signed up.', 'woocommerce-back-in-stock-notifications' ),
						'id'       => 'wc_bis_show_product_registrations_count',
						'default'  => 'no',
						'desc_tip' => __( 'Note: If page caching is enabled on your site, the displayed count may not be accurate at all times.', 'woocommerce-back-in-stock-notifications' ),
						'type'     => 'checkbox',
					),

					array(
						'title'       => __( 'Signed-up customers text', 'woocommerce-back-in-stock-notifications' ),
						'id'          => 'wc_bis_product_registrations_text',
						'placeholder' => wc_bis_get_form_signups_count_default_text(),
						'default'     => wc_bis_get_form_signups_count_default_text(),
						'desc'        => __( 'Text to use when 1 customer has signed up for a stock notification.', 'woocommerce-back-in-stock-notifications' ),
						'type'        => 'text',
						'class'       => 'product_registrations_text',
					),

					array(
						'title'       => '',
						'id'          => 'wc_bis_product_registrations_plural_text',
						/* translators: customers_count */
						'placeholder' => wc_bis_get_form_signups_count_plural_default_text(),
						'default'     => wc_bis_get_form_signups_count_plural_default_text(),
						/* translators: customers_count */
						'desc'        => __( 'Text to use when multiple customers have signed up for stock notifications. <code>{customers_count}</code> will be substituted by the number of signed-up customers.', 'woocommerce-back-in-stock-notifications' ),
						'type'        => 'text',
						'class'       => 'product_registrations_text',
					),

					array(
						'title'       => __( 'Sign-up form text', 'woocommerce-back-in-stock-notifications' ),
						'id'          => 'wc_bis_form_header_text',
						'placeholder' => wc_bis_get_form_header_default_text(),
						'default'     => wc_bis_get_form_header_default_text(),
						'type'        => 'text',
					),

					array(
						'title'       => __( 'Sign-up form text &mdash; already signed up', 'woocommerce-back-in-stock-notifications' ),
						'id'          => 'wc_bis_form_header_signed_up_text',
						'placeholder' => wc_bis_get_form_header_signed_up_default_text(),
						'default'     => wc_bis_get_form_header_signed_up_default_text(),
						'type'        => 'text',
						'desc'        => __( 'Text to display to logged-in customers who have already signed up, instead of the <strong>Sign-up form text</strong> above. <code>{manage_account_link}</code> will be substituted by the text below and converted into a <strong>My Account > Stock Notifications</strong> page link.', 'woocommerce-back-in-stock-notifications' ),
					),

					array(
						'title'       => '',
						'id'          => 'wc_bis_form_header_signed_up_link_text',
						'placeholder' => wc_bis_get_form_header_signed_up_link_default_text(),
						'default'     => wc_bis_get_form_header_signed_up_link_default_text(),
						'type'        => 'text',
						'desc'        => __( 'Text substituted into <code>{manage_account_link}</code> above.', 'woocommerce-back-in-stock-notifications' ),
					),

					array(
						'title'       => __( 'Sign-up form button text', 'woocommerce-back-in-stock-notifications' ),
						'id'          => 'wc_bis_form_button_text',
						'placeholder' => wc_bis_get_form_button_default_text(),
						'default'     => wc_bis_get_form_button_default_text(),
						'type'        => 'text',
					),

					array(
						'type' => 'sectionend',
						'id'   => 'bis_settings_general',
					),

					array(
						'title' => __( 'Catalog', 'woocommerce-back-in-stock-notifications' ),
						'type'  => 'title',
						'id'    => 'bis_settings_catalog',
					),

					array(
						'title'   => __( 'Display sign-up prompt in catalog', 'woocommerce-back-in-stock-notifications' ),
						'desc'    => __( 'Display a message next to out-of-stock products in catalog pages, prompting customers to sign up for stock notifications.', 'woocommerce-back-in-stock-notifications' ),
						'id'      => 'wc_bis_loop_signup_prompt_status',
						'default' => 'no',
						'type'    => 'checkbox',
					),

					array(
						'title'       => __( 'Catalog sign-up prompt text', 'woocommerce-back-in-stock-notifications' ),
						'id'          => 'wc_bis_loop_signup_prompt_text',
						'placeholder' => wc_bis_get_loop_signup_prompt_default_text(),
						'default'     => wc_bis_get_loop_signup_prompt_default_text(),
						'desc'        => __( 'Text to display next to out-of-stock products in catalog pages. <code>{prompt_link}</code> will be substituted by the text below and converted into a product page link.', 'woocommerce-back-in-stock-notifications' ),
						'type'        => 'text',
						'class'       => 'loop_signup_prompt_text',
					),

					array(
						'title'       => '',
						'id'          => 'wc_bis_loop_signup_prompt_link_text',
						'placeholder' => wc_bis_get_loop_signup_prompt_link_default_text(),
						'default'     => wc_bis_get_loop_signup_prompt_link_default_text(),
						'desc'        => __( 'Text substituted into <code>{prompt_link}</code> above.', 'woocommerce-back-in-stock-notifications' ),
						'type'        => 'text',
						'class'       => 'loop_signup_prompt_text',
					),

					array(
						'title'       => __( 'Catalog sign-up prompt text &mdash; already signed up', 'woocommerce-back-in-stock-notifications' ),
						'id'          => 'wc_bis_loop_signup_prompt_signed_up_text',
						'placeholder' => wc_bis_get_loop_signup_prompt_signed_up_default_text(),
						'default'     => wc_bis_get_loop_signup_prompt_signed_up_default_text(),
						'desc'        => __( 'Text to display next to out-of-stock products in catalog pages to logged-in customers who have already signed up. <code>{prompt_link}</code> will be substituted by the text below and converted into a <strong>My Account > Stock Notifications</strong> page link.', 'woocommerce-back-in-stock-notifications' ),
						'type'        => 'text',
						'class'       => 'loop_signup_prompt_text',
					),

					array(
						'title'       => '',
						'id'          => 'wc_bis_loop_signup_prompt_signed_up_link_text',
						'placeholder' => wc_bis_get_loop_signup_prompt_signed_up_link_default_text(),
						'default'     => wc_bis_get_loop_signup_prompt_signed_up_link_default_text(),
						'desc'        => __( 'Text substituted into <code>{prompt_link}</code> above.', 'woocommerce-back-in-stock-notifications' ),
						'type'        => 'text',
						'class'       => 'loop_signup_prompt_text',
					),

					array(
						'type' => 'sectionend',
						'id'   => 'bis_settings_catalog',
					),

				)
			);
		}

		/**
		 * Add warning notice before displaying content.
		 */
		public function output() {

			if ( ! empty( $_GET['dismiss_wc_bis_onboarding'] ) ) {
				WC_BIS_Admin_Notices::remove_maintenance_notice( 'welcome' );
			}

			$force_output = false;

			// Hint: `woocommerce_registration_generate_password` make sure that this option is set to `yes`.
			if ( 'no' === get_option( 'woocommerce_registration_generate_password', 'no' ) && 'yes' === get_option( 'wc_bis_create_new_account_on_registration', 'no' ) ) {
				/* translators: %s settings page link */
				WC_BIS_Admin_Notices::add_notice( sprintf( __( 'WooCommerce is currently <a href="%s">configured</a> to create new accounts without generating passwords automatically. Guests who sign up to receive stock notifications will need to reset their password before they can log into their new account.', 'woocommerce-back-in-stock-notifications' ), esc_url( admin_url( 'admin.php?page=wc-settings&tab=account' ) ) ), 'warning' );

				// Force output.
				$force_output = true;
			}

			if ( 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' ) ) {
				/* translators: %s settings page link */
				WC_BIS_Admin_Notices::add_notice( sprintf( __( 'WooCommerce is currently <a href="%s">configured</a> to hide out-of-stock products from your catalog. Customers will not be able sign up for back-in-stock notifications while this option is enabled.', 'woocommerce-back-in-stock-notifications' ), esc_url( admin_url( 'admin.php?page=wc-settings&tab=products&section=inventory' ) ) ), 'warning' );

				// Force output.
				$force_output = true;
			}

			if ( $force_output ) {
				WC_BIS_Admin_Notices::output_notices();
			}

			parent::output();
		}
	}

endif;

return new WC_BIS_Settings();
