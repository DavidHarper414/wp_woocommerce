/**
 * External dependencies
 */
import React from 'react';
import { recordEvent } from '@woocommerce/tracks';
import { render, fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { SettingsPaymentsMain } from '../settings-payments-main';

jest.mock( '@woocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

describe( 'SettingsPaymentsMain', () => {
	it( 'should record settings_payments_pageview event on load', () => {
		render( <SettingsPaymentsMain /> );

		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_payments_pageview'
		);
	} );

	it( 'should record settings_payments_provider_installed event on successful installation of a provider plugin', async () => {
		const { findAllByRole, findByText } = render(
			<SettingsPaymentsMain />
		);
		await findByText( 'PayPal' );
		const providerEnableButtons = await findAllByRole( 'button', {
			name: /Enable/i,
		} );
		const firstProviderEnableButton = providerEnableButtons[ 0 ];
		fireEvent.click( firstProviderEnableButton );

		expect( recordEvent ).toHaveBeenCalledWith(
			'settings_payments_provider_installed',
			{
				provider: expect.any( String ),
			}
		);
	} );
} );
