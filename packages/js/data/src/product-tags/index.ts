/**
 * External dependencies
 */
import { register } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_NAME, WC_PRODUCT_TAGS_NAMESPACE } from './constants';
import { createCrudDataStore } from '../crud';
import { ProductTag } from './types';

export const store = createCrudDataStore<
	ProductTag,
	'ProductTag',
	'ProductTags'
>( {
	storeName: STORE_NAME,
	resourceName: 'ProductTag',
	pluralResourceName: 'ProductTags',
	namespace: WC_PRODUCT_TAGS_NAMESPACE,
} );

register( store );
