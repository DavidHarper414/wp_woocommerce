/**
 * External dependencies
 */
import { Reducer } from 'redux';

/**
 * Internal dependencies
 */
import { STORE_NAME, WC_PRODUCT_VARIATIONS_NAMESPACE } from './constants';
import { createCrudDataStore } from '../crud';
import * as actions from './actions';
import * as selectors from './selectors';
import { reducer } from './reducer';
import { ResourceState } from '../crud/reducer';
import { ProductVariation } from './types';

export const store = createCrudDataStore<
	ProductVariation,
	'ProductVariation',
	'ProductVariations',
	typeof actions,
	typeof selectors
>( {
	storeName: STORE_NAME,
	resourceName: 'ProductVariation',
	pluralResourceName: 'ProductVariations',
	namespace: WC_PRODUCT_VARIATIONS_NAMESPACE,
	storeConfig: {
		reducer: reducer as Reducer< ResourceState >,
		actions,
		selectors,
	},
} );
