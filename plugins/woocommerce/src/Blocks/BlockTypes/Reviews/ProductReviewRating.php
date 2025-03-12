<?php
namespace Automattic\WooCommerce\Blocks\BlockTypes\Reviews;

use Automattic\WooCommerce\Blocks\BlockTypes\AbstractBlock;

/**
 * ProductReviewRating class.
 */
class ProductReviewRating extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'product-review-rating';

	/**
	 * Get the frontend style handle for this block type.
	 *
	 * @return string[]|null
	 */
	protected function get_block_type_style() {
		return null;
	}

	/**
	 * Render the block.
	 *
	 * @param array $attributes Block attributes.
	 * @return string Rendered block content.
	 */
	protected function render( $attributes, $content, $block ) {
		if ( ! isset( $block->context['commentId'] ) ) {
			return '';
		}

		$rating = intval( get_comment_meta( $block->context['commentId'], 'rating', true ) );

		return '<div class="wp-block-woocommerce-product-review-rating">' . wc_get_rating_html( $rating ) . '</div>';
	}
}
