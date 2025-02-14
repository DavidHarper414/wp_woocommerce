/**
 * Internal dependencies
 */
import { ProductShippingClass } from './types';

export type Resolvers = {
	createProductShippingClass: (
		query: Partial< ProductShippingClass >,
		options: {
			optimisticQueryUpdate?: Partial< ProductShippingClass >;
			optimisticUrlParameters?: IdType[];
		}
	) => ProductShippingClass;
};
