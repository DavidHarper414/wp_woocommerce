<?php
namespace Automattic\WooCommerce\Blocks\Utils;

/**
 * Utility methods used for the Blockified Product Details block.
 */
class BlockifiedProductDetailsUtils {

	/**
	 * Create accordion item block markup
	 *
	 * @param string $title Accordion Title.
	 * @param string $content Accordion Content.
	 * @return array
	 */
	public static function create_accordion_item( $title, $content ) {
		$markup_html = sprintf(
			'<!-- wp:woocommerce/accordion-item {"openByDefault": false} --><div class="wp-block-woocommerce-accordion-item"><!-- wp:woocommerce/accordion-header -->
		<h3 class="wp-block-woocommerce-accordion-header accordion-item__heading"><button class="accordion-item__toggle"><span>%1$s</span><span class="accordion-item__toggle-icon has-icon-plus" style="width:1.2em;height:1.2em"><svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" fill="currentColor"></path></svg></span></button></h3>
		<!-- /wp:woocommerce/accordion-header -->
		<!-- wp:woocommerce/accordion-panel -->
		<div class="wp-block-woocommerce-accordion-panel"><div class="accordion-content__wrapper"><!-- wp:html -->%2$s<!-- /wp:html --></div></div><!-- /wp:woocommerce/accordion-panel --></div><!-- /wp:woocommerce/accordion-item --></div>',
			$title,
			$content
		);
		return parse_blocks( $markup_html )[0];
	}

	/**
	 * Check if a block is a child of the Blockified Product Details block.
	 *
	 * @param array $block Block.
	 * @return bool
	 */
	public static function is_child_of_product_details_block( $block ) {
		return isset( $block['attrs']['metadata']['wcDescendantOf'] ) && 'woocommerce/blockified-product-details' === $block['attrs']['metadata']['wcDescendantOf'];
	}

	/**
	 * Hook a block to an anchor block.
	 *
	 * @param string $anchor_block_type Anchor block type.
	 * @param string $relative_position Relative position.
	 * @param array  $hooked_block_types Hooked block types.
	 * @param mixed  $context Context.
	 * @return array
	 */
	public static function is_hook_accordion_item_block_to_anchor( $anchor_info, $anchor_block_type, $relative_position, $context ) {
		$position_to_anchor = $anchor_info['position_to_anchor'];

		if ( $anchor_info['block_type'] !== $anchor_block_type ) {
			return false;
		}

		return $context instanceof \WP_Block_Template && 'single-product' === $context->slug && $relative_position === $position_to_anchor;
	}
}
