/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './extensions.scss';
import { MarketplaceContext } from '../../contexts/marketplace-context';
import CategorySelector from '../category-selector/category-selector';
import ProductListContent from '../product-list-content/product-list-content';
import ProductLoader from '../product-loader/product-loader';
import NoResults from '../product-list-content/no-results';
import { Product, ProductType } from '../product-list/types';
import { MARKETPLACE_ITEMS_PER_PAGE } from '../constants';

interface ExtensionsProps {
	products?: Product[];
	perPage?: number;
}

export default function Extensions( props: ExtensionsProps ): JSX.Element {
	const marketplaceContextValue = useContext( MarketplaceContext );
	const { isLoading } = marketplaceContextValue;

	const products =
		props.products?.slice(
			0,
			props.perPage ?? MARKETPLACE_ITEMS_PER_PAGE
		) ?? [];

	let title = __( '0 extensions found', 'woocommerce' );

	if ( products.length > 0 ) {
		title = sprintf(
			// translators: %s: number of extensions
			_n(
				'%s extension',
				'%s extensions',
				products.length,
				'woocommerce'
			),
			products.length
		);
	}

	function content() {
		if ( isLoading ) {
			return <ProductLoader />;
		}

		if ( products.length === 0 ) {
			return <NoResults type={ ProductType.extension } />;
		}

		return (
			<>
				<CategorySelector type={ ProductType.extension } />
				<ProductListContent
					products={ products }
					type={ ProductType.extension }
				/>
			</>
		);
	}

	return (
		<div className="woocommerce-marketplace__extensions">
			<h2 className="woocommerce-marketplace__product-list-title  woocommerce-marketplace__product-list-title--extensions">
				{ title }
			</h2>
			{ content() }
		</div>
	);
}
