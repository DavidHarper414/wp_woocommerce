<?php
declare(strict_types=1);

namespace Automattic\WooCommerce\Blocks\BlockTypes;

use Automattic\WooCommerce\Admin\Features\Features;
use Automattic\WooCommerce\Blocks\Utils\StyleAttributesUtils;
use WP_Block;

/**
 * Block type for variation selector attribute options in add to cart with options.
 * It's responsible to render the attribute options.
 */
class AddToCartWithOptionsVariationSelectorAttributeOptions extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'add-to-cart-with-options-variation-selector-attribute-options';
}
