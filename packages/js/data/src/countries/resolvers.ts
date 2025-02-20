/**
 * External dependencies
 */
import { apiFetch, select } from '@wordpress/data-controls';
import { controls } from '@wordpress/data';
import { DispatchFromMap } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import * as actions from './actions';
import {
	getLocalesSuccess,
	getLocalesError,
	getCountriesSuccess,
	getCountriesError,
	getCurrenciesSuccess,
	getCurrenciesError,
} from './actions';
import { NAMESPACE } from '../constants';
import { Locales, Country, GeolocationResponse } from './types';
import { STORE_NAME } from './constants';

const resolveSelect =
	controls && controls.resolveSelect ? controls.resolveSelect : select;

export function* getLocale() {
	yield resolveSelect( STORE_NAME, 'getLocales' );
}

export function* getLocales() {
	try {
		const url = NAMESPACE + '/data/countries/locales';
		const results: Locales = yield apiFetch( {
			path: url,
			method: 'GET',
		} );

		return getLocalesSuccess( results );
	} catch ( error ) {
		return getLocalesError( error );
	}
}

export function* getCountry() {
	yield resolveSelect( STORE_NAME, 'getCountries' );
}

export function* getCountries() {
	try {
		const url = NAMESPACE + '/data/countries';
		const results: Country[] = yield apiFetch( {
			path: url,
			method: 'GET',
		} );

		return getCountriesSuccess( results );
	} catch ( error ) {
		return getCountriesError( error );
	}
}

export function* getCurrencies() {
	const getPriceFormat = ( symbolPosition: string ) => {
		switch ( symbolPosition ) {
			case 'left':
				return '%1$s%2$s';
			case 'right':
				return '%2$s%1$s';
			case 'left_space':
				return '%1$s %2$s';
			case 'right_space':
				return '%2$s %1$s';
		}

		return '%1$s%2$s';
	};

	try {
		const url = 'wc/v3/data/currencies?include_extra=true';
		const results = yield apiFetch( {
			path: url,
			method: 'GET',
		} );

		return getCurrenciesSuccess(
			results.reduce( ( acc, currency ) => {
				acc[ currency.code ] = {
					code: currency.code,
					symbol: currency.symbol,
					symbolPosition: currency.currency_position,
					decimalSeparator: currency.decimal_separator,
					priceFormat: getPriceFormat( currency.currency_position ),
					thousandSeparator: currency.thousand_separator,
					precision: currency.number_of_decimals,
				};

				return acc;
			}, {} )
		);
	} catch ( error ) {
		return getCurrenciesError( error );
	}
}

export const geolocate =
	() =>
	async ( { dispatch }: { dispatch: DispatchFromMap< typeof actions > } ) => {
		try {
			const url = `https://public-api.wordpress.com/geo/?v=${ new Date().getTime() }`;
			const response = await fetch( url, {
				method: 'GET',
			} );
			const result: GeolocationResponse = await response.json();
			dispatch.geolocationSuccess( result );
		} catch ( error ) {
			dispatch.geolocationError( error );
		}
	};
