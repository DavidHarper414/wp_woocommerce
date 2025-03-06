/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

export const CORE_NAME = 'core/comment-author-name';
export const VARIATION_NAME = 'woocommerce/product-review-author-name';

export const BLOCK_TITLE = __( 'Product Review Author', 'woocommerce' );
export const BLOCK_DESCRIPTION = __(
	'Displays the author of the product review.',
	'woocommerce'
);

export interface ProductReviewAuthorAttributes {
	isLink: boolean;
	linkTarget: string;
	textAlign?: string;
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__woocommerceNamespace?: string;
}

export interface ExtendedBlockEditProps
	extends BlockEditProps< ProductReviewAuthorAttributes > {
	name: string;
	context?: {
		commentId?: number;
	};
}
