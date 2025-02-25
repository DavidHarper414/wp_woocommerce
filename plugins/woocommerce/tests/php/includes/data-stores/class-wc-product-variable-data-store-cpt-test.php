<?php

/**
 * Class WC_Product_Variable_Data_Store_CPT_Test
 */
class WC_Product_Variable_Data_Store_CPT_Test extends WC_Unit_Test_Case {

	/**
	 * Helper filter to force prices inclusive of tax.
	 */
	public function __return_incl() {
		return 'incl';
	}

	/**
	 * @testdox Variation price cache accounts for Customer VAT exemption.
	 */
	public function test_variation_price_cache_vat_exempt() {
		// Set store to include tax in price display.
		add_filter( 'wc_tax_enabled', '__return_true' );
		add_filter( 'woocommerce_prices_include_tax', '__return_true' );
		add_filter( 'pre_option_woocommerce_tax_display_shop', array( $this, '__return_incl' ) );
		add_filter( 'pre_option_woocommerce_tax_display_cart', array( $this, '__return_incl' ) );

		// Create tax rate.
		$tax_id = WC_Tax::_insert_tax_rate(
			array(
				'tax_rate_country'  => '',
				'tax_rate_state'    => '',
				'tax_rate'          => '10.0000',
				'tax_rate_name'     => 'VAT',
				'tax_rate_priority' => '1',
				'tax_rate_compound' => '0',
				'tax_rate_shipping' => '1',
				'tax_rate_order'    => '1',
				'tax_rate_class'    => '',
			)
		);

		// Create our variable product.
		$product = WC_Helper_Product::create_variation_product();

		// Verify that a VAT exempt customer gets prices with tax removed.
		WC()->customer->set_is_vat_exempt( true );

		$prices_no_tax    = array( '9.09', '13.64', '14.55', '15.45', '16.36', '17.27' );
		$variation_prices = $product->get_variation_prices( true );

		$this->assertEquals( $prices_no_tax, array_values( $variation_prices['price'] ) );

		// Verify that a normal customer gets prices with tax included.
		// This indirectly proves that the customer's VAT exemption influences the cache key.
		WC()->customer->set_is_vat_exempt( false );

		$prices_with_tax  = array( '10.00', '15.00', '16.00', '17.00', '18.00', '19.00' );
		$variation_prices = $product->get_variation_prices( true );

		$this->assertEquals( $prices_with_tax, array_values( $variation_prices['price'] ) );

		// Clean up.
		WC_Tax::_delete_tax_rate( $tax_id );

		remove_filter( 'wc_tax_enabled', '__return_true' );
		remove_filter( 'woocommerce_prices_include_tax', '__return_true' );
		remove_filter( 'pre_option_woocommerce_tax_display_shop', array( $this, '__return_incl' ) );
		remove_filter( 'pre_option_woocommerce_tax_display_cart', array( $this, '__return_incl' ) );
	}

	/**
	 * @testdox Test read_children method handles various scenarios correctly including invalid transient data
	 */
	public function test_read_children() {
		$data_store = new WC_Product_Variable_Data_Store_CPT();
		$product    = WC_Helper_Product::create_variation_product();

		// Set invalid transient data.
		$invalid_data = 'not an array';
		set_transient( 'wc_product_children_' . $product->get_id(), $invalid_data );

		// Test read still works with invalid transient.
		$children = $data_store->read_children( $product, false );
		$this->assertIsArray( $children );
		$this->assertArrayHasKey( 'all', $children );
		$this->assertArrayHasKey( 'visible', $children );
		$this->assertNotEmpty( $children['all'] );

		// Set corrupt transient data.
		$corrupt_data = array(
			'version' => 'wrong_version',
			'all'     => 'not an array',
			'visible' => array(),
		);
		set_transient( 'wc_product_children_' . $product->get_id(), wp_json_encode( $corrupt_data ) );

		// Test read still works with corrupt transient.
		$children_after_corrupt = $data_store->read_children( $product, false );
		$this->assertEquals( $children, $children_after_corrupt, 'Should return correct data even with corrupt transient' );
	}

	/**
	 * @testdox Test read_price_data method handles various pricing scenarios including invalid transient data
	 */
	public function test_read_price_data() {
		$data_store = new WC_Product_Variable_Data_Store_CPT();
		$product    = WC_Helper_Product::create_variation_product();

		// Get initial valid price data.
		$initial_prices = $data_store->read_price_data( $product, false );

		// Set invalid transient data.
		$transient_name = 'wc_var_prices_' . $product->get_id();
		set_transient( $transient_name, 'invalid data' );

		// Test read still works with invalid transient.
		$prices_after_invalid = $data_store->read_price_data( $product, false );
		$this->assertEquals(
			$initial_prices,
			$prices_after_invalid,
			'Should return correct prices even with invalid transient'
		);

		// Set corrupt transient data.
		$corrupt_data = array(
			'version'    => 'wrong_version',
			'price_hash' => array(
				'price'         => 'not an array',
				'regular_price' => array(),
				'sale_price'    => array(),
			),
		);
		set_transient( $transient_name, wp_json_encode( $corrupt_data ) );

		// Test read still works with corrupt transient.
		$prices_after_corrupt = $data_store->read_price_data( $product, false );
		$this->assertArrayHasKey( 'price', $prices_after_corrupt );
		$this->assertArrayHasKey( 'regular_price', $prices_after_corrupt );
		$this->assertArrayHasKey( 'sale_price', $prices_after_corrupt );
		$this->assertEquals(
			$initial_prices,
			$prices_after_corrupt,
			'Should return correct prices even with corrupt transient'
		);
	}
}
