/**
 * Internal dependencies
 */
import ProductListContent from '../product-list-content/product-list-content';
import ProductListHeader from '../product-list-header/product-list-header';
import { Product, ProductType } from './types';

interface ProductListProps {
	title: string;
	description: string;
	productGroup?: string;
	products: Product[];
	groupURL: string;
	type: ProductType;
	groupURLText: string | null;
}

export default function ProductList( props: ProductListProps ): JSX.Element {
	const {
		title,
		description,
		products,
		groupURL,
		type,
		productGroup,
		groupURLText,
	} = props;

	return (
		<div className="woocommerce-marketplace__product-list">
			<ProductListHeader
				title={ title }
				groupURL={ groupURL }
				groupURLText={ groupURLText }
				description={ description }
			/>
			<ProductListContent
				group={ title }
				products={ products }
				type={ type }
				productGroup={ productGroup }
			/>
		</div>
	);
}
