<?php
/**
 * REST API Settings Controller
 *
 * Handles requests to save Settings.
 */

namespace Automattic\WooCommerce\Admin\API;

use WC_Admin_Settings;
use Automattic\WooCommerce\Admin\Features\Settings\Init;

defined( 'ABSPATH' ) || exit;

/**
 * Settings Controller.
 *
 * @extends WC_REST_Data_Controller
 */
class Settings extends \WC_REST_Data_Controller {
	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc-admin';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'settings';

	/**
	 * Register routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'save_settings' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'               => array(
						'schema' => array( $this, 'get_item_schema' ),
					),
				),
			)
		);
	}

	/**
	 * Check if a given request has access to update settings.
	 *
	 * @param  WP_REST_Request $request Full details about the request.
	 * @return WP_Error|boolean
	 */
	public function get_items_permissions_check( $request ) {
		return current_user_can( 'manage_woocommerce' );
	}

	/**
	 * Save settings.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function save_settings( $request ) {
        global $current_section, $current_tab;

        $params = $request->get_params();

        try {
            // Get current tab/section and set global variables.
            $current_tab     = empty( $params['tab'] ) ? 'general' : sanitize_title( wp_unslash( $params['tab'] ) ); // WPCS: input var okay, CSRF ok.
            $current_section = empty( $params['section'] ) ? '' : sanitize_title( wp_unslash( $params['section'] ) ); // WPCS: input var okay, CSRF ok.

            $filter_name = '' === $current_section ? 
            "woocommerce_save_settings_{$current_tab}" :
            "woocommerce_save_settings_{$current_tab}_{$current_section}";

            // Save settings if data has been posted
            if ( apply_filters( $filter_name, ! empty( $_POST['save'] ) ) ) {
                WC_Admin_Settings::save();
            }

            $setting_pages = \WC_Admin_Settings::get_settings_pages();
            $settings = Init::get_page_data( array(), $setting_pages );

            return new \WP_REST_Response( array( 'status' => 'success', 'data' => $settings ) );
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'woocommerce_settings_save_error',
                sprintf( __( 'Failed to save settings: %s', 'woocommerce' ), $e->getMessage() ),
                array( 'status' => 500 )
            );
        }
	}

	public function get_item_schema() {
		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'options',
			'type'       => 'object',
			'properties' => array(
				'options' => array(
					'type'        => 'array',
					'description' => __( 'Array of options with associated values.', 'woocommerce' ),
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
			),
		);

		return $schema;
	}
}