/**
 * External dependencies
 */
import { Icon, column } from '@wordpress/icons';
import { registerBlockType, createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { Edit, Save } from './edit';
import crossSells from '../../../product-collection/collections/cross-sells';

registerBlockType( 'woocommerce/cart-cross-sells-block', {
	icon: {
		src: (
			<Icon
				icon={ column }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	edit: Edit,
	save: Save,
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'woocommerce/product-collection' ],
				transform: () => {
					return createBlock( 'woocommerce/product-collection', {
						attributes: {
							collection:
								'woocommerce/product-collection/cross-sells',
						},
						innerBlocks: crossSells.innerBlocks,
					} );
				},
			},
		],
	},
} );
