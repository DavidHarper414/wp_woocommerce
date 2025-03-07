/**
 * External dependencies
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { WC_BLOCKS_IMAGE_URL } from '@woocommerce/block-settings';
import type { BlockEditProps } from '@wordpress/blocks';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ProductGalleryThumbnailsBlockSettings } from './block-settings';
import type { ProductGalleryThumbnailsBlockAttributes } from './types';

export const Edit = ( {
	attributes,
	setAttributes,
}: BlockEditProps< ProductGalleryThumbnailsBlockAttributes > ) => {
	const blockRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( ! blockRef.current ) return;

		// The wrapper of the large image block might contain styles that affect the height (margin, padding, etc.).
		const largeImageBlockWrapper =
			blockRef.current.parentElement?.querySelector(
				'[data-type="woocommerce/product-gallery-large-image"]'
			)?.parentElement;

		if ( ! largeImageBlockWrapper ) return;

		const updateHeight = () => {
			if ( ! blockRef.current ) return;
			const computedStyle = window.getComputedStyle(
				largeImageBlockWrapper
			);
			const marginTop = parseInt( computedStyle.marginTop, 10 );
			const marginBottom = parseInt( computedStyle.marginBottom, 10 );
			const totalHeight =
				largeImageBlockWrapper.offsetHeight + marginTop + marginBottom;

			blockRef.current.style.maxHeight = `${ totalHeight }px`;
		};

		// Initial height update
		updateHeight();

		// Create ResizeObserver to monitor the large image block
		const resizeObserver = new ResizeObserver( updateHeight );
		resizeObserver.observe( largeImageBlockWrapper );

		// Cleanup
		return () => {
			resizeObserver.disconnect();
		};
	}, [ blockRef.current?.parentElement ] );

	const blockProps = useBlockProps( {
		ref: blockRef,
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
