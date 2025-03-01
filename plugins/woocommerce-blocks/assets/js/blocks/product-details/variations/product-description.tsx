/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';
import { page } from '@wordpress/icons';
import { registerBlockVariation } from '@wordpress/blocks';
import type { Block } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';

export const CORE_NAME = 'core/post-content';
export const VARIATION_NAME = 'woocommerce/product-description';

const BLOCK_TITLE = __( 'Product Description 1', 'woocommerce' );
const BLOCK_DESCRIPTION = __(
	'Displays the description of the product.',
	'woocommerce'
);

const EXTENDED_CORE_ELEMENTS = [ CORE_NAME ];

function registerProductDescriptionNamespace(
	props: Block,
	blockName: string
) {
	if ( EXTENDED_CORE_ELEMENTS.includes( blockName ) ) {
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
	'core/custom-class-name/attribute',
	registerProductDescriptionNamespace
);

const registerProductDescription = () => {
	registerBlockVariation( CORE_NAME, {
		description: BLOCK_DESCRIPTION,
		name: VARIATION_NAME,
		title: BLOCK_TITLE,
		isActive: ( blockAttributes ) => {
			return blockAttributes.__woocommerceNamespace === VARIATION_NAME;
		},
		icon: {
			src: (
				<Icon
					icon={ page }
					className="wc-block-editor-components-block-icon"
				/>
			),
		},
		attributes: {
			__woocommerceNamespace: VARIATION_NAME,
		},
		scope: [ 'block', 'inserter' ],
	} );
};

export default registerProductDescription;
