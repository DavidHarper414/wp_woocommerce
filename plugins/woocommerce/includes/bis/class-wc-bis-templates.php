<?php
/**
 * WC_BIS_Templates class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Display functions and filters.
 *
 * @class    WC_BIS_Templates
 * @version  1.6.7
 */
class WC_BIS_Templates {

	/**
	 * Should dequeue scripts status.
	 *
	 * @var array
	 */
	private $should_dequeue_scripts;

	/**
	 * Setup hooks and functions.
	 */
	public function __construct() {

		// Template functions and hooks.
		require_once WC_BIS_ABSPATH . 'includes/wc-bis-template-functions.php';
		require_once WC_BIS_ABSPATH . 'includes/wc-bis-template-hooks.php';

		// Front end scripts and JS templates.
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );
		add_action( 'wp_print_footer_scripts', array( $this, 'dequeue_product_scripts' ), 9 );

		// Defaults.
		$this->should_dequeue_scripts = true;
	}

	/*
	---------------------------------------------------*/
	/*
		Setters.                                         */
	/*---------------------------------------------------*/

	/**
	 * Force enqueuing scripts or not.
	 *
	 * @return void
	 */
	public function enqueue_scripts() {
		$this->should_dequeue_scripts = false;
	}

	/*
	---------------------------------------------------*/
	/*
		Callbacks.                                       */
	/*---------------------------------------------------*/

	/**
	 * Front-end styles and scripts.
	 *
	 * @return void
	 */
	public function frontend_scripts() {

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		// Styles
		wp_register_style( 'wc-bis-css', WC_BIS()->get_plugin_url() . '/assets/css/frontend/woocommerce.css', false, WC_BIS()->get_plugin_version(), 'all' );
		wp_style_add_data( 'wc-bis-css', 'rtl', 'replace' );
		wp_enqueue_style( 'wc-bis-css' );

		if ( WC_BIS_Core_Compatibility::wc_current_theme_is_fse_theme() ) {
			wp_register_style( 'wc-bis-blocks-style', WC_BIS()->get_plugin_url() . '/assets/css/frontend/blocktheme.css', false, WC_BIS()->get_plugin_version() );
			wp_style_add_data( 'wc-bis-blocks-style', 'rtl', 'replace' );
			wp_enqueue_style( 'wc-bis-blocks-style' );
		}

		$dependencies = array( 'jquery', 'jquery-ui-datepicker' );

		/**
		 * Filter to allow adding custom script dependencies here.
		 *
		 * @param  array  $dependencies
		 */
		$dependencies = apply_filters( 'woocommerce_bis_script_dependencies', $dependencies );

		wp_register_script( 'wc-bis-main', WC_BIS()->get_plugin_url() . '/assets/js/frontend/wc-bis-main' . $suffix . '.js', $dependencies, WC_BIS()->get_plugin_version(), true );
		wp_script_add_data( 'wc-bis-main', 'strategy', 'defer' );

		/**
		 * Filter front-end params.
		 *
		 * @param  array  $params
		 */
		$params = apply_filters(
			'woocommerce_bis_front_end_params',
			array(
				'version'                 => WC_BIS()->get_plugin_version(),
				'wc_ajax_url'             => WC_AJAX::get_endpoint( '%%endpoint%%' ),
				'registration_form_nonce' => wp_create_nonce( 'wc-bis-registration-form' ),
			)
		);

		wp_localize_script( 'wc-bis-main', 'wc_bis_params', $params );
		wp_enqueue_script( 'wc-bis-main' );

		// Load JS only when needed.
		if ( (bool) apply_filters( 'woocommerce_bis_should_enqueue_scripts', is_account_page() || is_product() ) ) {
			$this->enqueue_scripts();
		}
	}

	/**
	 * Dequeue script when not needed.
	 *
	 * @return void
	 */
	public function dequeue_product_scripts() {

		if ( $this->should_dequeue_scripts ) {
			wp_dequeue_script( 'wc-bis-main' );
		}
	}
}
