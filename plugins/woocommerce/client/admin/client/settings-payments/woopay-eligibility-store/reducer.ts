/**
 * Internal dependencies
 */
import { Action } from './actions';
import { WooPayEligibilityState } from './types';

const DEFAULT_STATE: WooPayEligibilityState = {
	isEligible: null,
};

const reducer = (
	state = DEFAULT_STATE,
	action: Action
): WooPayEligibilityState => {
	switch ( action.type ) {
		case 'SET_IS_ELIGIBLE':
			return {
				...state,
				isEligible: action.isEligible,
			};
		default:
			return state;
	}
};

export default reducer;
