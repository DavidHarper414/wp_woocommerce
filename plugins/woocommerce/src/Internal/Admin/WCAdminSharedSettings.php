<?php
/**
 * Manages the WC Admin settings that need to be pre-loaded.
 */

namespace Automattic\WooCommerce\Internal\Admin;

defined( 'ABSPATH' ) || exit;

/**
 * \Automattic\WooCommerce\Internal\Admin\WCAdminSharedSettings class.
 */
class WCAdminSharedSettings {
	/**
	 * Settings prefix used for the window.wcSettings object.
	 *
	 * @var string
	 */
	private $settings_prefix = 'admin';

	/**
	 * Class instance.
	 *
	 * @var WCAdminSharedSettings instance
	 */
	protected static $instance = null;

	/**
	 * Hook into WooCommerce Blocks.
	 */
	protected function __construct() {
		if ( did_action( 'woocommerce_blocks_loaded' ) ) {
			$this->on_woocommerce_blocks_loaded();
		} else {
			add_action( 'woocommerce_blocks_loaded', array( $this, 'on_woocommerce_blocks_loaded' ), 10 );
		}
	}

	/**
	 * Get class instance.
	 *
	 * @return object Instance.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Adds settings to the Blocks AssetDataRegistry when woocommerce_blocks is loaded.
	 *
	 * @return void
	 */
	public function on_woocommerce_blocks_loaded() {
		// Ensure we only add admin settings on the admin.
		if ( ! is_admin() ) {
			return;
		}

		if ( class_exists( '\Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry' ) ) {
			\Automattic\WooCommerce\Blocks\Package::container()->get( \Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry::class )->add(
				$this->settings_prefix,
				function () {
					/**
					 * Filters the shared settings that are passed to the client.
					 *
					 * @since 6.4.0
					 */
					return apply_filters( 'woocommerce_admin_shared_settings', array() );
				}
			);
		}

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_deprecation_scripts' ) );
	}

	/**
	 * Return the deprecated wcSettings properties.
	 *
	 * Set value to null to use the default message or provide a custom message.
	 *
	 * Nested properties can be defined using dot notation.
	 *
	 * @return array
	 */
	protected function get_deprecated_properties() {
		return array(
			'admin.onboarding' => null,
		);
	}

	/**
	 * Enqueue deprecation scripts (client/wp-admin-scripts/wcsettings-deprecation/index.js)
	 */
	public function enqueue_deprecation_scripts() {
		$deprecated_properties = $this->get_deprecated_properties();
		if ( empty( $deprecated_properties ) ) {
			return;
		}
		WCAdminAssets::register_script( 'wp-admin-scripts', 'wcsettings-deprecation', true );
		wp_add_inline_script( 'wc-admin-wcsettings-deprecation', 'var deprecatedWcSettings = ' . wp_json_encode( $deprecated_properties ) . ';', 'before' );
	}
}
