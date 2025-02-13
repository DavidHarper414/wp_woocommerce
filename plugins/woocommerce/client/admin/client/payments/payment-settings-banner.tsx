/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getAdminLink } from '@woocommerce/settings';
import {
	WCPayBanner,
	WCPayBannerBody,
	WCPayBannerFooter,
} from '@woocommerce/onboarding';
import { recordEvent } from '@woocommerce/tracks';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './payment-recommendations.scss';
import { getAdminSetting } from '~/utils/admin-settings';
import { usePaymentsBanner } from './use-payments-banner';
import { WOOPAY_ELIGIBILITY_STORE_NAME } from '~/settings-payments/woopay-eligibility-store';
import type { WooPayEligibilityState } from '~/settings-payments/woopay-eligibility-store/types';

const recordTrack = () => {
	recordEvent( 'settings_payments_banner_connect_click' );
};

const WCPaySettingBanner = () => {
	const WC_PAY_SETUP_URL = getAdminLink(
		'admin.php?wcpay-connect=1&_wpnonce=' +
			getAdminSetting( 'wcpay_welcome_page_connect_nonce' )
	);

	const isWooPayEligible = useSelect( ( select ) => {
		const store = select( WOOPAY_ELIGIBILITY_STORE_NAME ) as {
			getIsEligible: () => WooPayEligibilityState[ 'isEligible' ];
		};
		return store.getIsEligible();
	}, [] );

	return (
		<WCPayBanner>
			<WCPayBannerBody
				textPosition="right"
				actionButton={
					<Button
						href={ WC_PAY_SETUP_URL }
						isPrimary
						onClick={ recordTrack }
					>
						{ __( 'Get started', 'woocommerce' ) }
					</Button>
				}
				isWooPayEligible={ isWooPayEligible ?? false }
			/>
			<WCPayBannerFooter isWooPayEligible={ isWooPayEligible ?? false } />
		</WCPayBanner>
	);
};

const DefaultPaymentMethodsHeaderText = () => (
	<>
		<h2>{ __( 'Payment Methods', 'woocommerce' ) }</h2>
		<div id="payment_gateways_options-description">
			<p>
				{ __(
					'Installed payment methods are listed below and can be sorted to control their display order on the frontend.',
					'woocommerce'
				) }
			</p>
		</div>
	</>
);

export const PaymentsBannerWrapper = () => {
	const { hasFinishedResolution, shouldShowBanner } = usePaymentsBanner();

	if ( hasFinishedResolution && shouldShowBanner ) {
		return <WCPaySettingBanner />;
	}
	return <DefaultPaymentMethodsHeaderText />;
};
