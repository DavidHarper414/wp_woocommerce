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
	images: Record<string, ImageDataItem>;
	gallery_images: string[];
	variation_images: string[];
	all_images: string[];
}
