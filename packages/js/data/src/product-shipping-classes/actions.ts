/**
 * Internal dependencies
 */
import { ProductShippingClass } from './types';

export type Resolvers = {
	createProductShippingClass: (
		query: ProductShippingClass,
		options: {
			optimisticQueryUpdate?: Partial< ProductShippingClass >;
			optimisticUrlParameters?: IdType[];
		}
	) => ProductShippingClass;
};
