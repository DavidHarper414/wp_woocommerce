/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import * as selectors from './selectors';
import * as actions from './actions';
import * as resolvers from './resolvers';
import reducer from './reducer';

registerStore( STORE_KEY, {
	reducer,
	actions,
	controls,
	selectors,
	resolvers,
} );

export const WOOPAY_ELIGIBILITY_STORE_NAME = STORE_KEY;
