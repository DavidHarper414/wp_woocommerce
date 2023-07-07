/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	ProductDataSuggestion,
	ProductDataSuggestionRequest,
	ApiErrorResponse,
} from '../utils/types';
import { requestJetpackToken } from '../utils';

type ProductDataSuggestionSuccessResponse = {
	suggestions: ProductDataSuggestion[];
};

type ProductDataSuggestionErrorResponse = ApiErrorResponse;

export const useProductDataSuggestions = () => {
	const fetchSuggestions = async (
		request: ProductDataSuggestionRequest
	): Promise< ProductDataSuggestion[] > => {
		try {
			const token = await requestJetpackToken();
			const { suggestions } =
				await apiFetch< ProductDataSuggestionSuccessResponse >( {
					path: '/wooai/product-data-suggestions',
					method: 'POST',
					data: { ...request, token },
				} );

			return suggestions;
		} catch ( error ) {
			/* eslint-disable-next-line no-console */
			console.error( error );

			const errorResponse = error as ProductDataSuggestionErrorResponse;
			const hasStatus = errorResponse?.data?.status;
			const hasMessage = errorResponse?.message;

			// Check if the status is 500 or greater.
			const isStatusGte500 =
				errorResponse?.data?.status && errorResponse.data.status >= 500;

			// If the error response doesn't have a status or message, or if the status is 500 or greater, throw a generic error.
			if ( ! hasStatus || ! hasMessage || isStatusGte500 ) {
				throw new Error(
					__(
						`Apologies, this is an experimental feature and there was an error with this service. Please try again.`,
						'woocommerce'
					)
				);
			}

			throw new Error( errorResponse.message );
		}
	};

	return {
		fetchSuggestions,
	} as const;
};
