/**
 * External dependencies
 */
import {
	createInterpolateElement,
	Fragment,
	useEffect,
	useState,
} from '@wordpress/element';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './product-list-content.scss';
import '~/customize-store/intro/intro.scss';
import '~/customize-store/style.scss';
import ProductCard from '../product-card/product-card';
import { Product, ProductType } from '../product-list/types';
import { appendURLParams } from '../../utils/functions';
import { ADMIN_URL, getAdminSetting } from '~/utils/admin-settings';
import { NoAIBanner } from '~/customize-store/intro/intro-banners';

export default function ProductListContent( props: {
	products: Product[];
	group?: string;
	productGroup?: string;
	type: ProductType;
	className?: string;
	searchTerm?: string;
	category?: string;
} ): JSX.Element {
	const wccomHelperSettings = getAdminSetting( 'wccomHelper', {} );

	const classes = classnames(
		'woocommerce-marketplace__product-list-content',
		props.className
	);

	const [ columns, setColumns ] = useState( 1 );

	const updateColumns = () => {
		const screenWidth = window.innerWidth;
		if ( screenWidth >= 1920 ) {
			setColumns( 4 );
		} else if ( screenWidth >= 1024 ) {
			setColumns( 3 );
		} else if ( screenWidth >= 769 ) {
			setColumns( 2 );
		} else {
			setColumns( 1 );
		}
	};

	useEffect( () => {
		updateColumns();
		// Update columns on screen resize to adjust for responsive layout
		window.addEventListener( 'resize', updateColumns );

		return () => window.removeEventListener( 'resize', updateColumns );
	}, [] );

	const bannerPosition = columns * 2 - 1;

	return (
		<>
			<div className={ classes }>
				{ props.products.map( ( product, index ) => (
					<Fragment key={ product.id }>
						<ProductCard
							key={ product.id }
							type={ props.type }
							product={ {
								id: product.id,
								slug: product.slug,
								title: product.title,
								image: product.image,
								type: product.type,
								icon: product.icon,
								vendorName: product.vendorName,
								vendorUrl: product.vendorUrl
									? appendURLParams( product.vendorUrl, [
											[
												'utm_source',
												'extensionsscreen',
											],
											[ 'utm_medium', 'product' ],
											[ 'utm_campaign', 'wcaddons' ],
											[ 'utm_content', 'devpartner' ],
									  ] )
									: '',
								price: product.price,
								url: appendURLParams(
									product.url,
									Object.entries( {
										...wccomHelperSettings.inAppPurchaseURLParams,
										...( props.productGroup !== undefined
											? { utm_group: props.productGroup }
											: {} ),
									} )
								),
								averageRating: product.averageRating,
								reviewsCount: product.reviewsCount,
								description: product.description,
								isInstallable: product.isInstallable,
							} }
							tracksData={ {
								position: index + 1,
								...( product.label && {
									label: product.label,
								} ),
								...( props.group && { group: props.group } ),
								...( props.searchTerm && {
									searchTerm: props.searchTerm,
								} ),
								...( props.category && {
									category: props.category,
								} ),
							} }
						/>
						{ index === bannerPosition && <NoAIBanner /> }
					</Fragment>
				) ) }
			</div>
			<div
				className={
					'woocommerce-marketplace__browse-wp-theme-directory'
				}
			>
				<b>{ __( 'Didn’t find a theme you like?', 'woocommerce' ) }</b>
				{ createInterpolateElement(
					__(
						' Browse the <a>WordPress.org theme directory</a> to discover more.',
						'woocommerce'
					),
					{
						a: (
							// eslint-disable-next-line jsx-a11y/anchor-has-content
							<a
								href={
									ADMIN_URL +
									'theme-install.php?search=e-commerce'
								}
							/>
						),
					}
				) }
			</div>
		</>
	);
}
