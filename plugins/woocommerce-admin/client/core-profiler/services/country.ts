/**
 * External dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';

function decodeHtml( content: string ) {
	if ( ! content ) {
		return '';
	}

	return decodeEntities( content );
}
/**
 * Type definitions
 */
export type Country = {
	code: string;
	name: string;
	states: {
		code: string;
		name: string;
	}[];
};

type CountryStateOption = {
	key: string;
	label: string;
};

type UserLocation = {
	latitude: string;
	longitude: string;
	country_short: string;
	country_long: string;
	region: string;
	city: string;
};

/**
 * Get all country and state combinations used for select dropdowns.
 *
 * @return {Object} Select options, { value: 'US:GA', label: 'United States - Georgia' }
 * @param  countries {Country[]} Countries object.
 */
export function getCountryStateOptions(
	countries: Country[]
): CountryStateOption[] {
	const countryStateOptions: CountryStateOption[] = countries.reduce(
		( acc, country ) => {
			if ( ! country.states.length ) {
				// @ts-expect-error tmp
				acc.push( {
					key: country.code,
					label: decodeHtml( country.name ),
				} );
				return acc;
			}

			const countryStates = country.states.map( ( state ) => {
				return {
					key: country.code + ':' + state.code,
					label:
						decodeHtml( country.name ) +
						' — ' +
						decodeHtml( state.name ),
				};
			} );
			// @ts-expect-error tmp
			acc.push( ...countryStates );

			return acc;
		},
		[]
	);

	return countryStateOptions;
}

/**
 * Get the user's location
 *
 * @return {Object} {
 * 	latitude: '39.039474',
 *  longitude: '-77.491809',
 *  country_short: 'US',
 *  country_long: 'United States of America',
 *  region: 'Virginia',
 *  city: 'Ashburn'
 * }
 */
export const getUserLocation = (): Promise< UserLocation | null > => {
	// cache buster
	const v = new Date().getTime();
	return fetch( 'https://public-api.wordpress.com/geo/?v=' + v )
		.then( ( res ) => {
			if ( ! res.ok ) {
				// @ts-expect-error tmp
				return res.body().then( ( body ) => {
					throw new Error( body );
				} );
			}
			return res.json();
		} )
		.catch( () => {
			return null;
		} );
};
