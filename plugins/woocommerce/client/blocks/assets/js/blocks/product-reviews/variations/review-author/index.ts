/**
 * External dependencies
 */
import type { Block } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { registerBlockVariation } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	CORE_NAME,
	VARIATION_NAME,
	BLOCK_TITLE,
	BLOCK_DESCRIPTION,
} from './constants';
import withProductReviewAuthorEdit from './edit';

function registerProductReviewAuthorNamespace(
	props: Block,
	blockName: string
) {
	if ( blockName === CORE_NAME ) {
		// Gracefully handle if settings.attributes is undefined.
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore -- We need this because `attributes` is marked as `readonly`
		props.attributes = {
			...props.attributes,
			__woocommerceNamespace: {
				type: 'string',
			},
		};
	}

	return props;
}

addFilter(
	'blocks.registerBlockType',
	'woocommerce/product-review-author',
	registerProductReviewAuthorNamespace
);

const registerProductReviewAuthorVariation = () => {
	registerBlockVariation( CORE_NAME, {
		description: BLOCK_DESCRIPTION,
		name: VARIATION_NAME,
		title: BLOCK_TITLE,
		isActive: ( blockAttributes ) => {
			return blockAttributes.__woocommerceNamespace === VARIATION_NAME;
		},
		attributes: {
			__woocommerceNamespace: VARIATION_NAME,
		},
	} );
};

// Enhance core/post-content block to show custom placeholder when used as Product Description variation
addFilter(
	'editor.BlockEdit',
	'woocommerce/with-product-review-author-edit',
	withProductReviewAuthorEdit
);

export { registerProductReviewAuthorVariation };
