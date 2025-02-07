/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

import {
	PLUGINS_STORE_NAME,
	SETTINGS_STORE_NAME,
	ONBOARDING_STORE_NAME,
} from '@woocommerce/data';

/**
 * Internal dependencies
 */
import { getCountryCode } from '~/dashboard/utils';
import WooCommerceShippingItem from './experimental-woocommerce-shipping-item';
import { ShippingRecommendationsList } from './shipping-recommendations';
import './shipping-recommendations.scss';
import { ShippingTour } from '../guided-tours/shipping-tour';

const ShippingRecommendations: React.FC = () => {
	const {
		activePlugins,
		installedPlugins,
		countryCode,
		isSellingDigitalProductsOnly,
	} = useSelect( ( select ) => {
		// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
		const settings = select( SETTINGS_STORE_NAME ).getSettings( 'general' );

		const { getActivePlugins, getInstalledPlugins } =
			select( PLUGINS_STORE_NAME );

		// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
		const profileItems = select( ONBOARDING_STORE_NAME ).getProfileItems()
			.product_types;

		return {
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
			activePlugins: getActivePlugins(),
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
			installedPlugins: getInstalledPlugins(),
			countryCode: getCountryCode(
				settings.general?.woocommerce_default_country
			),
			isSellingDigitalProductsOnly:
				profileItems?.length === 1 && profileItems[ 0 ] === 'downloads',
		};
	}, [] );

	if (
		activePlugins.includes( 'woocommerce-shipping' ) ||
		activePlugins.includes( 'woocommerce-services' )
	) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	if ( countryCode !== 'US' || isSellingDigitalProductsOnly ) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	return (
		<>
			<ShippingTour showShippingRecommendationsStep={ true } />
			<ShippingRecommendationsList>
				<WooCommerceShippingItem
					isPluginInstalled={ installedPlugins.includes(
						'woocommerce-shipping'
					) }
				/>
			</ShippingRecommendationsList>
		</>
	);
};

export default ShippingRecommendations;
