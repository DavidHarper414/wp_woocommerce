/**
 * External dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { createSelectors } from './selectors';
import { createDispatchActions } from './actions';
import defaultControls from '../controls';
import { createResolvers } from './resolvers';
import { createReducer } from './reducer';
import { Item } from '../items';

interface CrudStoreParams<
	TResourceName,
	TResourceNamePlural,
	TActions,
	TSelectors,
	TResolvers,
	TControls,
	TReducer
> {
	storeName: string;
	resourceName: TResourceName;
	namespace: string;
	pluralResourceName: TResourceNamePlural;
	storeConfig?: {
		reducer?: TReducer;
		actions?: TActions;
		selectors?: TSelectors;
		resolvers?: TResolvers;
		controls?: TControls;
	};
}

export const createCrudDataStore = <
	TResourceType extends Item,
	TActions extends Record< string, ( ...args: any[] ) => any >,
	TSelectors
>( {
	storeName,
	resourceName,
	namespace,
	pluralResourceName,
	storeConfig,
}: CrudStoreParams<
	TResourceName,
	TResourceNamePlural,
	TActions,
	TSelectors
> ) => {
	const crudActions = createDispatchActions< TResourceName, TResourceType >( {
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

	const crudSelectors = createSelectors( {
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

	const store = createReduxStore< unknown, TActions, TSelectors >(
		storeName,
		{
			reducer: crudReducer,
			actions: { ...crudActions, ...actions } as TActions,
			selectors: {
				...crudSelectors,
				...selectors,
			} as TSelectors,
			resolvers: { ...crudResolvers, ...resolvers },
			controls: {
				...defaultControls,
				...controls,
			},
		}
	);

	register( store );

	return store;
};
