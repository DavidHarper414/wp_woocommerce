/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { isExperimentalBlocksEnabled } from '@woocommerce/block-settings';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';
import icon from './icon';

console.log( 'isExperimentalBlocksEnabled', isExperimentalBlocksEnabled() );
if ( isExperimentalBlocksEnabled() ) {
	console.log( 'isExperimentalBlocksEnabled' );
	// @ts-expect-error metadata is not typed.
	registerBlockType( metadata, {
		icon,
		edit,
	} );
}
