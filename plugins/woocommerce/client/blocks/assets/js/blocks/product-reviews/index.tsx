/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { isExperimentalBlocksEnabled } from '@woocommerce/block-settings';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import save from './save';
import edit from './edit';
import icon from './icon';
import { registerProductReviewAuthorVariation } from './variations/review-author';
import { registerProductReviewTemplateVariation } from './variations/review-template';

if ( isExperimentalBlocksEnabled() ) {
	// @ts-expect-error metadata is not typed.
	registerBlockType( metadata, {
		icon,
		edit,
		save,
	} );

	registerProductReviewAuthorVariation();
	registerProductReviewTemplateVariation();
}
