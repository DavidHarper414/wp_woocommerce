/**
 * External dependencies
 */
import React from 'react';
import { recordEvent } from '@woocommerce/tracks';
import { render, fireEvent, waitFor } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { PaymentGateways } from '..';

jest.mock( '@woocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

describe( 'PaymentGateways', () => {
	it( 'should fire settings_payments_business_location_update	when country selection is changed', async () => {
		const setBusinessRegistrationCountry = jest.fn();
		const { getByRole, findByText } = render(
			<PaymentGateways
				providers={ [] }
				installedPluginSlugs={ [] }
				installingPlugin={ null }
				setupPlugin={ jest.fn() }
				acceptIncentive={ jest.fn() }
				updateOrdering={ jest.fn() }
				isFetching={ false }
				businessRegistrationCountry={ null }
				setBusinessRegistrationCountry={
					setBusinessRegistrationCountry
				}
			/>
		);

		const countrySelectorButton = getByRole(
			'combobox'
		) as HTMLSelectElement;
		fireEvent.click( countrySelectorButton );
		const ukraineOption = await findByText( 'Ukraine' );
		fireEvent.click( ukraineOption );
		const applyButton = await findByText( 'Apply' );
		fireEvent.click( applyButton );

		await waitFor( () => {
			expect( setBusinessRegistrationCountry ).toHaveBeenCalledWith(
				'UA'
			);
			expect( recordEvent ).toHaveBeenCalledWith(
				'settings_payments_business_location_update',
				{
					old_location: 'US',
					new_location: 'UA',
				}
			);
		} );
	} );
} );
