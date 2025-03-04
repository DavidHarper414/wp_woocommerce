/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';
import { page } from '@wordpress/icons';
import { registerBlockVariation } from '@wordpress/blocks';
import type { Block, BlockEditProps } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { useBlockProps } from '@wordpress/block-editor';
import clsx from 'clsx';

export const CORE_NAME = 'core/post-content';
export const VARIATION_NAME = 'woocommerce/product-description';

const BLOCK_TITLE = __( 'Product Description 1', 'woocommerce' );
const BLOCK_DESCRIPTION = __(
	'Displays the description of the product.',
	'woocommerce'
);

const PLACEHOLDER_TEXT = __(
	'This block displays the product description. When viewing a product page, the description content will automatically appear here.',
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

interface ProductDescriptionAttributes {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__woocommerceNamespace?: string;
}

interface ExtendedBlockEditProps
	extends BlockEditProps< ProductDescriptionAttributes > {
	name: string;
	context?: {
		postId?: number;
		postType?: string;
	};
}

const withProductDescriptionEdit =
	( BlockEdit: React.ComponentType< ExtendedBlockEditProps > ) =>
	( props: ExtendedBlockEditProps ) => {
		const {
			name,
			context,
			attributes,
			__unstableLayoutClassNames: layoutClassNames,
		} = props;

		// If this is not our variation, return the original BlockEdit
		if (
			name !== CORE_NAME ||
			attributes.__woocommerceNamespace !== VARIATION_NAME
		) {
			return <BlockEdit { ...props } />;
		}

		// If we have context, it means we're in a product context, so render the original BlockEdit of core/post-content
		if ( context?.postId && context?.postType ) {
			return <BlockEdit { ...props } />;
		}

		const blockProps = useBlockProps( {
			className: clsx(
				layoutClassNames,
				'wc-block-product-description__placeholder'
			),
		} );

		// Otherwise, render our custom placeholder
		return (
			<div { ...blockProps }>
				<p>{ PLACEHOLDER_TEXT }</p>
			</div>
		);
	};

// Render Product Description placeholder if we're not in a product context
addFilter(
	'editor.BlockEdit',
	'woocommerce/with-product-description-edit',
	withProductDescriptionEdit
);

export default registerProductDescription;
