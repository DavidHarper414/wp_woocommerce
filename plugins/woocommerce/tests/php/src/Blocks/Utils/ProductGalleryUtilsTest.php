<?php

namespace Automattic\WooCommerce\Tests\Blocks\Utils;

use Automattic\WooCommerce\Blocks\Utils\ProductGalleryUtils;
use WP_UnitTestCase;

/**
 * Tests for the ProductGalleryUtils class.
 */
class ProductGalleryUtilsTest extends \WP_UnitTestCase {
	/**
	 * Test get_product_gallery_image_data method.
	 */
	public function test_get_product_gallery_image_data() {
		$variable_product = \WC_Helper_Product::create_variation_product();
		$image_id         = wp_insert_attachment(
			array(
				'post_title'     => 'Test Image',
				'post_type'      => 'attachment',
				'post_mime_type' => 'image/jpeg',
			)
		);
		$variable_product->set_image_id( $image_id );
		$gallery_image_ids = array(
			wp_insert_attachment(
				array(
					'post_title'     => 'Gallery Image 1',
					'post_type'      => 'attachment',
					'post_mime_type' => 'image/jpeg',
				)
			),
			wp_insert_attachment(
				array(
					'post_title'     => 'Gallery Image 2',
					'post_type'      => 'attachment',
					'post_mime_type' => 'image/jpeg',
				)
			),
		);
		$variable_product->set_gallery_image_ids( $gallery_image_ids );
		$variable_product->save();

		$image_data = ProductGalleryUtils::get_product_gallery_image_data( $variable_product );

		$this->assertArrayHasKey( 'image_ids', $image_data );
		$this->assertArrayHasKey( 'images', $image_data );
		$this->assertNotEmpty( $image_data['image_ids'] );
		$this->assertNotEmpty( $image_data['images'] );

		// Assert that the keys of $image_data['image_ids'] are IDs.
		foreach ( $image_data['image_ids'] as $image_id ) {
			$this->assertIsString( $image_id );
			$image_id = intval( $image_id );
			$this->assertIsInt( $image_id );
		}

		// Assert that the keys of $image_data['images'] are IDs.
		foreach ( $image_data['images'] as $key => $image ) {
			$this->assertIsInt( $key );
		}

		// Assert that each item in $image_data['images'] has required keys.
		foreach ( $image_data['images'] as $image ) {
			$this->assertArrayHasKey( 'id', $image );
			$this->assertArrayHasKey( 'sizes', $image );
			$this->assertArrayHasKey( 'src_set', $image );
			$this->assertArrayHasKey( 'src', $image );
		}
	}
}
