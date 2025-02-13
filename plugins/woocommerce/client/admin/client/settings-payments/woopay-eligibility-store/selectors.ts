/**
 * Internal dependencies
 */
import { WooPayEligibilityState } from './types';

export const getIsEligible = ( state: WooPayEligibilityState ) =>
	state.isEligible;
