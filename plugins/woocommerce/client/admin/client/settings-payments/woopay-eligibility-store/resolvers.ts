/**
 * Internal dependencies
 */
import { getWooPayEligibility, setIsEligible } from './actions';
import { WooPayEligibilityResponse } from './types';

export function* getIsEligible(): Generator<
	unknown,
	ReturnType< typeof setIsEligible >,
	WooPayEligibilityResponse
> {
	const response = yield getWooPayEligibility();
	return setIsEligible( response.is_eligible );
}
