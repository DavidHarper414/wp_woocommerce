<?php

namespace Automattic\WooCommerce\Tests\Internal\Admin;

use Automattic\WooCommerce\Internal\Admin\ProductDownloadsPreview;
use WC_Helper_Product;
use WC_Unit_Test_Case;

/**
 * Tests for ProductDownloadsPreview class
 *
 * @covers \Automattic\WooCommerce\Internal\Admin\ProductDownloadsPreview
 */
class ProductDownloadsPreviewTest extends WC_Unit_Test_Case {
	/**
	 * The product downloads preview class instance
	 *
	 * @var ProductDownloadsPreview
	 */
	private $preview;

	/**
	 * Test product ID
	 *
	 * @var int
	 */
	private $product_id;

	/**
	 * Test attachment ID
	 *
	 * @var int
	 */
	private $attachment_id;

	/**
	 * Setup test environment
	 */
	public function setUp(): void {
		parent::setUp();
		$this->preview = new ProductDownloadsPreview();

		// Create a test attachment
		$this->attachment_id = $this->create_test_image();

		// Create a test product
		$product          = WC_Helper_Product::create_simple_product();
		$this->product_id = $product->get_id();
	}

	/**
	 * Tear down test environment
	 */
	public function tearDown(): void {
		// Clean up created product
		WC_Helper_Product::delete_product( $this->product_id );

		// Clean up attachment
		if ( $this->attachment_id ) {
			wp_delete_attachment( $this->attachment_id, true );
		}

		parent::tearDown();
	}

	/**
	 * Create a test image attachment
	 *
	 * @return int Attachment ID
	 */
	private function create_test_image() {
		// Create test image file
		$upload_dir = wp_upload_dir();
		$filename   = $upload_dir['path'] . '/test-image.jpg';

		// Create a simple JPG image
		$image = imagecreatetruecolor( 100, 100 );
		imagejpeg( $image, $filename );

		// Create attachment
		$attachment = array(
			'post_mime_type' => 'image/jpeg',
			'post_title'     => 'Test Image',
			'post_content'   => '',
			'post_status'    => 'publish',
			'file'           => $filename,
		);

		$attachment_id = wp_insert_attachment( $attachment, $filename );

		// Update attachment metadata
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$attach_data = wp_generate_attachment_metadata( $attachment_id, $filename );
		wp_update_attachment_metadata( $attachment_id, $attach_data );

		return $attachment_id;
	}

	/**
	 * Test that register method adds the necessary action
	 */
	public function test_register_adds_actions() {
		$this->preview->register();
		$this->assertEquals( 5, has_action( 'init', array( $this->preview, 'serve_admin_image_src' ) ) );
	}

	/**
	 * Test get_admin_image_src_url returns empty string for non-admin users
	 */
	public function test_get_admin_image_src_url_returns_empty_for_non_admin() {
		$user_id = $this->factory->user->create( array( 'role' => 'customer' ) );
		wp_set_current_user( $user_id );

		$result = $this->preview->get_admin_image_src_url( $this->product_id, $this->attachment_id, 'thumbnail' );

		$this->assertEmpty( $result );
	}

	/**
	 * Test get_admin_image_src_url returns properly formatted URL for admin users
	 */
	public function test_get_admin_image_src_url_returns_url_for_admin() {
		$user_id = $this->factory->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$result = $this->preview->get_admin_image_src_url( $this->product_id, $this->attachment_id, 'thumbnail' );

		$this->assertNotEmpty( $result );
		$this->assertStringContainsString( 'wc-uploads-image-src=' . $this->attachment_id, $result );
		$this->assertStringContainsString( 'product=' . $this->product_id, $result );
		$this->assertStringContainsString( 'size=thumbnail', $result );
		$this->assertStringContainsString( 'nonce=', $result );
	}

	/**
	 * Test serve_admin_image_src bails early if required GET params are missing
	 */
	public function test_serve_admin_image_src_bails_early_without_required_params() {
		$_GET = array();
		ob_start();
		$this->preview->serve_admin_image_src();
		$output = ob_get_clean();

		$this->assertEmpty( $output );

		$_GET = array( 'wc-uploads-image-src' => $this->attachment_id );
		ob_start();
		$this->preview->serve_admin_image_src();
		$output = ob_get_clean();

		$this->assertEmpty( $output );
	}
}
