/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { SelectControl } from '@woocommerce/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	BusinessLocationEvent,
	CoreProfilerStateMachineContext,
} from '../index';

import { Heading } from '../components/heading/heading';
import { Navigation } from '../components/navigation/navigation';
export const BusinessLocation = ( {
	sendEvent,
	navigationProgress,
	context,
}: {
	sendEvent: ( event: BusinessLocationEvent ) => void;
	navigationProgress: number;
	context: CoreProfilerStateMachineContext;
} ) => {
	const [ storeCountry, setStoreCountry ] = useState< string >( '' );

	return (
		<div className="woocommerce-profiler-business-location">
			<Navigation percentage={ navigationProgress } />
			<div className="woocommerce-profiler-page__content woocommerce-profiler-business-location__content">
				<Heading
					title={ __(
						'Where is your business located?',
						'woocommerce'
					) }
					subTitle={ __(
						"We'll use this information to help you set up payments, shipping, and taxes.",
						'woocommerce'
					) }
				/>
				<SelectControl
					className="woocommerce-profiler-select-control__country"
					instanceId={ 1 }
					label={
						! storeCountry
							? __( 'Select country/region', 'woocommerce' )
							: ''
					}
					getSearchExpression={ ( query: string ) => {
						return new RegExp(
							'(^' + query + '| — (' + query + '))',
							'i'
						);
					} }
					autoComplete="new-password" // disable autocomplete and autofill
					options={ context.countries }
					excludeSelectedOptions={ false }
					help={ <Icon icon={ chevronDown } /> }
					onChange={ ( results: Array< string > ) => {
						if ( results.length ) {
							setStoreCountry( results[ 0 ] );
						}
					} }
					selected={ storeCountry ? [ storeCountry ] : [] }
					showAllOnFocus
					isSearchable
				></SelectControl>
				<Button
					className="woocommerce-profiler-go-to-mystore__button"
					variant="primary"
					disabled={ ! storeCountry }
					onClick={ () => {
						sendEvent( {
							type: 'BUSINESS_LOCATION_COMPLETED',
							payload: {
								businessInfo: {
									location: storeCountry,
								},
							},
						} );
					} }
				>
					{ __( 'Go to my store', 'woocommerce' ) }
				</Button>
			</div>
		</div>
	);
};
