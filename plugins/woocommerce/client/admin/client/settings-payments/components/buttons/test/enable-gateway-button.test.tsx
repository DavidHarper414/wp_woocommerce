/**
 * External dependencies
 */
import React, { act } from 'react';
import { recordEvent } from '@woocommerce/tracks';
import { render, fireEvent } from '@testing-library/react';
import { PaymentProviderState } from '@woocommerce/data';
import { dispatch, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { EnableGatewayButton } from '..';

jest.mock( '@woocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	...jest.requireActual( '@wordpress/data' ),
	useDispatch: jest.fn(),
	dispatch: jest.fn(),
} ) );

describe( 'EnableGatewayButton', () => {
	beforeEach( () => {
		( useDispatch as jest.Mock ).mockReturnValue( {
			togglePaymentGateway: jest
				.fn()
				.mockImplementation( () => Promise.resolve() ),
		} );
		( dispatch as jest.Mock ).mockReturnValue( {
			createErrorNotice: jest.fn(),
		} );
	} );
	it( 'should record settings_payments_provider_enable_click event on click of the button', () => {
		Object.defineProperty( window, 'woocommerce_admin', {
			value: {
				nonces: {
					gateway_toggle: 'nonce',
				},
			},
		} );

		const { getByRole } = render(
			<EnableGatewayButton
				gatewayId="test-gateway"
				gatewayState={
					{
						enabled: false,
						account_connected: false,
						needs_setup: true,
						test_mode: false,
						dev_mode: false,
					} as PaymentProviderState
				}
				settingsHref="/settings"
				onboardingHref={ '' }
				gatewayHasRecommendedPaymentMethods={ false }
				isOffline={ false }
			/>
		);

		act( () => {
			fireEvent.click( getByRole( 'link', { name: 'Enable' } ) );
		} );
		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_payments_provider_enable_click',
			{
				provider_id: 'test-gateway',
			}
		);
	} );
} );
