<?php
/**
 * REST API Data currencies controller.
 *
 * Handles requests to the /data/currencies endpoint.
 *
 * @package WooCommerce\RestApi
 * @since   3.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * REST API Data Currencies controller class.
 *
 * @package WooCommerce\RestApi
 */
class WC_REST_Data_Currencies_Controller extends WC_REST_Data_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'wc/v3';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'data/currencies';

	/**
	 * Register routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'include_extra' => array(
							'description' => __( 'Include currency_position, thousand_separator, decimal_separator, and number_of_decimals.', 'woocommerce' ),
							'type'        => 'boolean',
							'default'     => false,
						),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/current',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_current_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<currency>[\w-]{3})',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'location' => array(
							'description' => __( 'ISO4217 currency code.', 'woocommerce' ),
							'type'        => 'string',
						),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Get currency information.
	 *
	 * @param  string          $code    Currency code.
	 * @param  WP_REST_Request $request Request data.
	 * @return array|mixed Response data, ready for insertion into collection data.
	 */
	public function get_currency( $code, $request ) {
		$currencies = get_woocommerce_currencies();
		$data       = array();

		if ( ! array_key_exists( $code, $currencies ) ) {
			return false;
		}

		$currency = array(
			'code'   => $code,
			'name'   => $currencies[ $code ],
			'symbol' => get_woocommerce_currency_symbol( $code ),
		);

		return $currency;
	}

	/**
	 * Return the list of currencies.
	 *
	 * @param  WP_REST_Request $request Request data.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_items( $request ) {
		$currencies    = get_woocommerce_currencies();
		$symbols       = get_woocommerce_currency_symbols();
		$include_extra = $request['include_extra'] ?? false;
		if ( $include_extra ) {
			$locale_info = include WC()->plugin_path() . '/i18n/locale-info.php';
			// Convert it to have the following format
			// array(
			// 'USD' => array(
			// 'currency_code' => 'USD',
			// 'currency_symbol' => '$',
			// 'currency_position' => 'left',
			// 'thousand_separator' => ',',
			// 'decimal_separator' => '.',
			// 'number_of_decimals' => 2,
			// ),
			// );
			$locale_info = array_combine( array_column( $locale_info, 'currency_code' ), array_values( $locale_info ) );
		}

		$data = array();
		foreach ( array_keys( $currencies ) as $code ) {
			$currency = array(
				'code'   => $code,
				'name'   => $currencies[ $code ],
				'symbol' => $symbols[ $code ] ?? '',
			);

			if ( $include_extra && isset( $locale_info[ $code ] ) ) {
				$currency['currency_position']  = $locale_info[ $code ]['currency_pos'];
				$currency['thousand_separator'] = $locale_info[ $code ]['thousand_sep'];
				$currency['decimal_separator']  = $locale_info[ $code ]['decimal_sep'];
				$currency['number_of_decimals'] = intval( $locale_info[ $code ]['num_decimals'] );
			}
			$response = $this->prepare_item_for_response( $currency, $request );
			$data[]   = $this->prepare_response_for_collection( $response );
		}

		return rest_ensure_response( $data );
	}

	/**
	 * Return information for a specific currency.
	 *
	 * @param  WP_REST_Request $request Request data.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_item( $request ) {
		$data = $this->get_currency( strtoupper( $request['currency'] ), $request );
		if ( empty( $data ) ) {
			return new WP_Error( 'woocommerce_rest_data_invalid_currency', __( 'There are no currencies matching these parameters.', 'woocommerce' ), array( 'status' => 404 ) );
		}
		return $this->prepare_item_for_response( $data, $request );
	}

	/**
	 * Return information for the current site currency.
	 *
	 * @param  WP_REST_Request $request Request data.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_current_item( $request ) {
		$currency = get_option( 'woocommerce_currency' );
		return $this->prepare_item_for_response( $this->get_currency( $currency, $request ), $request );
	}

	/**
	 * Prepare the data object for response.
	 *
	 * @param object          $item Data object.
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response $response Response data.
	 */
	public function prepare_item_for_response( $item, $request ) {
		$data     = $this->add_additional_fields_to_object( $item, $request );
		$data     = $this->filter_response_by_context( $data, 'view' );
		$response = rest_ensure_response( $data );

		$response->add_links( $this->prepare_links( $item ) );

		/**
		 * Filter currency returned from the API.
		 *
		 * @param WP_REST_Response $response The response object.
		 * @param array            $item     Currency data.
		 * @param WP_REST_Request  $request  Request used to generate the response.
		 */
		return apply_filters( 'woocommerce_rest_prepare_data_currency', $response, $item, $request );
	}

	/**
	 * Prepare links for the request.
	 *
	 * @param object $item Data object.
	 * @return array Links for the given currency.
	 */
	protected function prepare_links( $item ) {
		$code  = strtoupper( $item['code'] );
		$links = array(
			'self'       => array(
				'href' => rest_url( sprintf( '/%s/%s/%s', $this->namespace, $this->rest_base, $code ) ),
			),
			'collection' => array(
				'href' => rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ),
			),
		);

		return $links;
	}


	/**
	 * Get the currency schema, conforming to JSON Schema.
	 *
	 * @return array
	 */
	public function get_item_schema() {
		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'data_currencies',
			'type'       => 'object',
			'properties' => array(
				'code'               => array(
					'type'        => 'string',
					'description' => __( 'ISO4217 currency code.', 'woocommerce' ),
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'name'               => array(
					'type'        => 'string',
					'description' => __( 'Full name of currency.', 'woocommerce' ),
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'symbol'             => array(
					'type'        => 'string',
					'description' => __( 'Currency symbol.', 'woocommerce' ),
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'currency_position'  => array(
					'type'        => 'string',
					'description' => __( 'Currency position. Available when `include_extra` is set to true.', 'woocommerce' ),
					'context'     => array( 'view' ),
					'readonly'    => true,
					'required'    => false,
				),
				'thousand_separator' => array(
					'type'        => 'string',
					'description' => __( 'Thousand separator. Available when `include_extra` is set to true.', 'woocommerce' ),
					'context'     => array( 'view' ),
					'readonly'    => true,
					'required'    => false,
				),
				'decimal_separator'  => array(
					'type'        => 'string',
					'description' => __( 'Decimal separator. Available when `include_extra` is set to true.', 'woocommerce' ),
					'context'     => array( 'view' ),
					'readonly'    => true,
					'required'    => false,
				),
				'number_of_decimals' => array(
					'type'        => 'integer',
					'description' => __( 'Number of decimals. Available when `include_extra` is set to true.', 'woocommerce' ),
					'context'     => array( 'view' ),
					'readonly'    => true,
					'required'    => false,
				),
			),
		);

		return $this->add_additional_fields_schema( $schema );
	}
}
