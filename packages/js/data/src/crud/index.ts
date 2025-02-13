/**
 * External dependencies
 */
import { createReduxStore, register } from '@wordpress/data';
import { Reducer, Action } from 'redux';

/**
 * Internal dependencies
 */
import { createSelectors } from './selectors';
import { createDispatchActions } from './actions';
import defaultControls from '../controls';
import { createResolvers } from './resolvers';
import { createReducer } from './reducer';

interface CrudStoreParams<
	TResourceName,
	TResourceTypePlural,
	Actions,
	Selectors,
	Resolvers,
	Controls,
	TReducer
> {
	storeName: string;
	resourceName: TResourceName;
	namespace: string;
	pluralResourceName: TResourceTypePlural;
	storeConfig?: {
		reducer?: TReducer;
		actions?: Actions;
		selectors?: Selectors;
		resolvers?: Resolvers;
		controls?: Controls;
	};
}

export const createCrudDataStore = <
	TResourceType,
	TResourceName extends string,
	TResourceTypePlural extends string,
	Actions,
	Selectors
>( {
	storeName,
	resourceName,
	namespace,
	pluralResourceName,
	storeConfig,
}: CrudStoreParams<
	TResourceName,
	TResourceTypePlural,
	Actions,
	Selectors,
	Resolvers,
	Controls,
	TReducer
> ) => {
	const crudActions = createDispatchActions( {
		resourceName,
		namespace,
	} );
	const crudResolvers = createResolvers<
		TResourceName,
		TResourceTypePlural,
		TResourceType
	>( {
		storeName,
		resourceName,
		pluralResourceName,
		namespace,
	} );

	const crudSelectors = createSelectors<
		TResourceName,
		TResourceTypePlural,
		TResourceType
	>( {
		resourceName,
		pluralResourceName,
		namespace,
	} );

	const {
		reducer,
		actions = {},
		selectors = {},
		resolvers = {},
		controls = {},
	} = storeConfig || {};

	const crudReducer = createReducer( reducer );

	const store = createReduxStore<
		unknown,
		Actions,
		Selectors & typeof crudSelectors
	>( storeName, {
		reducer: crudReducer,
		actions: { ...crudActions, ...actions },
		selectors: {
			...crudSelectors,
			...selectors,
		},
		resolvers: { ...crudResolvers, ...resolvers },
		controls: {
			...defaultControls,
			...controls,
		},
	} );

	register( store );

	return store;
};
