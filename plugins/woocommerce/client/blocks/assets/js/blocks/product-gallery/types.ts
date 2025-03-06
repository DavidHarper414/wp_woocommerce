export interface ProductGalleryBlockAttributes {
	cropImages: boolean;
	hoverZoom: boolean;
	fullScreenOnClick: boolean;
}

export interface ProductGallerySettingsProps {
	attributes: ProductGalleryBlockAttributes;
	setAttributes: (
		attributes: Partial< ProductGalleryBlockAttributes >
	) => void;
}

interface ImageDataItem {
	id: string;
	src: string;
	srcSet: string;
	sizes: string;
}

export interface ImageDataObject {
	gallery_images: ImageDataItem[];
	variation_images: ImageDataItem[];
	all_images: ImageDataItem[];
}
