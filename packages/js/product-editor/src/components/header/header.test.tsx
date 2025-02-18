/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import { useEntityId, useEntityRecord } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Header } from './header';
import { EditorLoadingContext } from '../../contexts/editor-loading-context';

// Mock the dependencies
jest.mock( '@wordpress/core-data', () => ( {
	...jest.requireActual( '@wordpress/core-data' ),
	useEntityId: jest.fn(),
	useEntityRecord: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	...jest.requireActual( '@wordpress/data' ),
	useSelect: jest.fn(),
} ) );

jest.mock( '@woocommerce/admin-layout', () => ( {
	useAdminSidebarWidth: () => 0,
	WooHeaderItem: {
		Slot: () => null,
	},
} ) );

describe( 'Header', () => {
	beforeEach( () => {
		// Setup default mocks
		( useEntityId as jest.Mock ).mockReturnValue( 1 );
		( useEntityRecord as jest.Mock ).mockReturnValue( {
			editedRecord: {
				name: 'Test Product',
				status: 'publish',
				catalog_visibility: 'visible',
			},
		} );
		( useSelect as jest.Mock ).mockReturnValue( {
			name: 'Test Product',
			status: 'publish',
		} );
	} );

	it( 'should render the header with product title', () => {
		render(
			<EditorLoadingContext.Provider value={ false }>
				<Header onTabSelect={ () => {} } selectedTab="general" />
			</EditorLoadingContext.Provider>
		);

		expect( screen.getByRole( 'heading' ) ).toHaveTextContent(
			'Test Product'
		);
	} );
} );
