/**
 * External dependencies
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { recordEvent } from '@woocommerce/tracks';
import { TaskType } from '@woocommerce/data';

/**
 * Internal dependencies
 */
import { Shipping } from '../index';

jest.mock( '@woocommerce/tracks', () => ( {
	recordEvent: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	...jest.requireActual( '@wordpress/data' ),
	withSelect: () => ( Component: React.ComponentType ) => Component,
	withDispatch: () => ( Component: React.ComponentType ) => Component,
} ) );

describe( 'Shipping', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should trigger event tasklist_shipping_visit_marketplace_click when clicking the Official WooCommerce Marketplace link', () => {
		const props = {
			settings: {},
			shippingPartners: [],
			activePlugins: [],
			isJetpackConnected: false,
			countryCode: 'US',
			countryName: 'United States',
			isUpdateSettingsRequesting: false,
			onComplete: jest.fn(),
			task: { id: 'shipping' } as TaskType,
		};

		render( <Shipping { ...props } /> );

		fireEvent.click(
			screen.getByText( 'Official WooCommerce Marketplace' )
		);

		expect( recordEvent ).toHaveBeenCalledWith(
			'tasklist_shipping_visit_marketplace_click'
		);
	} );
} );
