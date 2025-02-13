<?php
/**
 * REST API Settings Controller
 *
 * Handles requests to save Settings.
 */

namespace Automattic\WooCommerce\Admin\API;

use WC_Admin_Settings;

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

    public function get_items( $request ) {
        error_log('working');
        return new \WP_REST_Response( array( 'status' => 'success' ) );
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
		// Get all registered WooCommerce settings pages
		$settings_pages = WC_Admin_Settings::get_settings_pages();

        try {
            // Get current tab/section.
            $current_tab     = empty( $_GET['tab'] ) ? 'general' : sanitize_title( wp_unslash( $_GET['tab'] ) ); // WPCS: input var okay, CSRF ok.
            $current_section = empty( $_REQUEST['section'] ) ? '' : sanitize_title( wp_unslash( $_REQUEST['section'] ) ); // WPCS: input var okay, CSRF ok.

            // Save settings if data has been posted.
            if ( '' !== $current_section && apply_filters( "woocommerce_save_settings_{$current_tab}_{$current_section}", ! empty( $_POST['save'] ) ) ) { // WPCS: input var okay, CSRF ok.
                WC_Admin_Settings::save();
            } elseif ( '' === $current_section && apply_filters( "woocommerce_save_settings_{$current_tab}", ! empty( $_POST['save'] ) ) ) { // WPCS: input var okay, CSRF ok.
                WC_Admin_Settings::save();
            }

            return new \WP_REST_Response( array( 'status' => 'success' ) );
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