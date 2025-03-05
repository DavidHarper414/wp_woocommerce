/**
 * External dependencies
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { WC_BLOCKS_IMAGE_URL } from '@woocommerce/block-settings';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { ProductGalleryThumbnailsBlockSettings } from './block-settings';
import type { ProductGalleryThumbnailsBlockAttributes } from './types';

export const Edit = ( {
	attributes,
	setAttributes,
}: BlockEditProps< ProductGalleryThumbnailsBlockAttributes > ) => {
	const blockProps = useBlockProps( {
		className: `wc-block-product-gallery-thumbnails`,
	} );

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody>
					<ProductGalleryThumbnailsBlockSettings
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
			</InspectorControls>
			{ /* Show 4 thumbnails so that we showcase the scroll effect. */ }
			{ [ ...Array( 4 ).keys() ].map( ( index ) => (
				<div
					className="wc-block-product-gallery-thumbnails__thumbnail"
					key={ index }
				>
					<img
						className="wc-block-product-gallery-thumbnails__image"
						src={ `${ WC_BLOCKS_IMAGE_URL }block-placeholders/product-image-gallery.svg` }
						alt=""
						width={ attributes.thumbnailSize }
						height={ attributes.thumbnailSize }
					/>
				</div>
			) ) }
		</div>
	);
};
