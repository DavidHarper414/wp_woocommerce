<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\Tests\Internal\Admin;

use Automattic\WooCommerce\Internal\Admin\Loader;
use WC_Unit_Test_Case;

/**
 * Loader Loader.
 *
 * @class PaymentExtensionSuggestionIncentives
 */
class LoaderTest extends WC_Unit_Test_Case {
	/**
	 * Set up test.
	 */
	public function setUp(): void {
		parent::setUp();
		add_filter( 'deprecated_hook_trigger_error', '__return_false' );
	}

	/**
	 * Runs after each test.
	 */
	public function tearDown(): void {
		parent::tearDown();
		remove_filter( 'deprecated_hook_trigger_error', '__return_false' );
	}

	/**
	 * Test the status fetching methods
	 */
	public function test_deprecated_statuses_fetch_methods() {
		$this->assertSame( array(), Loader::get_order_statuses( array() ) );
		$this->assertSame( array(), Loader::get_unregistered_order_statuses() );

		remove_filter( 'deprecated_hook_trigger_error', '__return_false' );
	}
}
