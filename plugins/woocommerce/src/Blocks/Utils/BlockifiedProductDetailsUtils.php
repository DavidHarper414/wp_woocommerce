<?php
namespace Automattic\WooCommerce\Blocks\Utils;

/**
 * Utility methods used for the Blockified Product Details block.
 */
class BlockifiedProductDetailsUtils {
	/**
	 * Check if a block is a child of the Blockified Product Details block.
	 *
	 * @param array $block Block.
	 * @return bool
	 */
	private static function is_child_of_product_details_block( $block ) {
		return isset( $block['attrs']['metadata']['wcDescendantOf'] ) && 'woocommerce/blockified-product-details' === $block['attrs']['metadata']['wcDescendantOf'];
	}

	/**
	 * Check if the accordion should be hooked to the product details block.
	 *
	 * @param array  $anchor_info Anchor info.
	 * @param string $anchor_block_type Anchor block type.
	 * @param string $relative_position Relative position.
	 * @param mixed  $context Context.
	 * @return array
	 */
	public static function is_valid_product_details_accordion_hook(
		$anchor_info,
		$anchor_block_type,
		$relative_position,
		$context
	) {
		$position_to_anchor = $anchor_info['position_to_anchor'];

		if ( $anchor_info['block_type'] !== $anchor_block_type ) {
			return false;
		}

		return $context instanceof \WP_Block_Template && 'single-product' === $context->slug && $relative_position === $position_to_anchor && self::is_child_of_product_details_block( $anchor_info );
	}
}
