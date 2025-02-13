/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { WC_ADMIN_NAMESPACE } from './constants';
import { WooPayEligibilityResponse } from './types';

export function* getWooPayEligibility() {
	const response: WooPayEligibilityResponse = yield apiFetch( {
		path: `${ WC_ADMIN_NAMESPACE }/settings/payments/woopay-eligibility`,
	} );

	return response;
}

export function setIsEligible( isEligible: boolean ) {
	return {
		type: 'SET_IS_ELIGIBLE' as const,
		isEligible,
	};
}

export type Action = ReturnType< typeof setIsEligible >;
