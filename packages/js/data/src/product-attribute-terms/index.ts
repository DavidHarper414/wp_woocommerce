/**
 * Internal dependencies
 */
import { STORE_NAME, WC_PRODUCT_ATTRIBUTE_TERMS_NAMESPACE } from './constants';
import { createCrudDataStore } from '../crud';
import { ProductAttributeTerm } from './types';

export const store = createCrudDataStore<
	ProductAttributeTerm,
	'ProductAttributeTerm',
	'ProductAttributeTerms'
>( {
	storeName: STORE_NAME,
	resourceName: 'ProductAttributeTerm',
	pluralResourceName: 'ProductAttributeTerms',
	namespace: WC_PRODUCT_ATTRIBUTE_TERMS_NAMESPACE,
} );
