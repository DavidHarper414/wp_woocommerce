/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

export const CORE_NAME = 'core/comment-template';
export const VARIATION_NAME = 'woocommerce/product-review-template';

export const BLOCK_TITLE = __( 'Product Review Template', 'woocommerce' );
export const BLOCK_DESCRIPTION = __(
	'Contains the block elements used to display a review, like the title, date, author, avatar and more..',
	'woocommerce'
);

export interface ProductReviewTemplateAttributes {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__woocommerceNamespace?: string;
}

export interface ExtendedBlockEditProps
	extends BlockEditProps< ProductReviewTemplateAttributes > {
	name: string;
	context: {
		postId?: number;
	};
}
