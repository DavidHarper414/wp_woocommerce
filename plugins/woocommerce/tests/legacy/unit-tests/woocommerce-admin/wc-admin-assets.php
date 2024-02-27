<?php
/**
 * Loader tests
 *
 * @package WooCommerce\Admin\Tests\Loader
 */

use Automattic\WooCommerce\Internal\Admin\WCAdminAssets;

/**
 * WC_Admin_Tests_Page_WCAdminAssets Class
 *
 * @package WooCommerce\Admin\Tests\WCAdminAssets
 */
class WC_Admin_Tests_WCAdminAssets extends WP_UnitTestCase {
	/**
	 * Test get_url()
	 */
	public function test_get_url() {
		$result = WCAdminAssets::get_url( 'flavortown', 'js' );

		// All we are concerned about in this test is the js filename. Pop it off the end of the asset url.
		$parts           = explode( '/', $result );
		$final_file_name = array_pop( $parts );

		// There should be no difference between SCRIPT_DEBUG being on or off.
		$expected_value = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? 'flavortown.js' : 'flavortown.js';

		$this->assertEquals(
			$expected_value,
			$final_file_name,
			'the anticipated js file name should use .min when SCRIPT_DEBUG is off, and have no .min when SCRIPT_DEBUG is on.'
		);
	}
}
