/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

export const CORE_NAME = 'core/post-content';
export const VARIATION_NAME = 'woocommerce/product-description';

export const BLOCK_TITLE = __( 'Product Description', 'woocommerce' );
export const BLOCK_DESCRIPTION = __(
	'Displays the description of the product.',
	'woocommerce'
);

export const PLACEHOLDER_TEXT = __(
	'This block displays the product description. When viewing a product page, the description content will automatically appear here.',
	'woocommerce'
);

export interface ProductDescriptionAttributes {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__woocommerceNamespace?: string;
}

export interface ExtendedBlockEditProps
	extends BlockEditProps< ProductDescriptionAttributes > {
	name: string;
	context?: {
		postId?: number;
		postType?: string;
	};
	__unstableLayoutClassNames?: string;
}
