/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Ignoring because `__experimentalUnitControl` is not yet in the type definitions.
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis, @woocommerce/dependency-group
import { __experimentalUnitControl as UnitControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { ProductGalleryThumbnailsSettingsProps } from '../types';

export const ProductGalleryThumbnailsBlockSettings = ( {
	attributes,
	setAttributes,
}: ProductGalleryThumbnailsSettingsProps ) => {
	const { thumbnailSize } = attributes;

	return (
		<UnitControl
			label={ __( 'Thumbnail Size', 'woocommerce' ) }
			value={ thumbnailSize }
			onChange={ ( value: string | undefined ) =>
				setAttributes( {
					thumbnailSize: value || '115px', // The current default size.
				} )
			}
			units={ [ { value: 'px', label: 'px' } ] }
			min={ 10 }
			max={ 300 }
			step={ 5 }
			size="default"
			__next36pxDefaultSize
			help={ __(
				'Choose the size of each thumbnail. If thumbnails size is bigger than the product image, thumbnails will turn to slider.',
				'woocommerce'
			) }
		/>
	);
};
