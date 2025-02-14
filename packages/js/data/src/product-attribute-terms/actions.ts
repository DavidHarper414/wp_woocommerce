/**
 * Internal dependencies
 */
import { ProductAttributeTerm } from './types';

export type Resolvers = {
	createProductAttributeTerm: (
		query: ProductAttributeTermQuery,
		options: {
			optimisticQueryUpdate?: ProductAttributeTermQuery;
			optimisticUrlParameters?: IdType[];
		}
	) => ProductAttributeTerm[];
};
