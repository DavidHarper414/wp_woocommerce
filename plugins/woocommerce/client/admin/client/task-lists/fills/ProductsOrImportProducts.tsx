/**
 * External dependencies
 */
import { WooOnboardingTask } from '@woocommerce/onboarding';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { useProfileItems } from '../hooks/useProfileItems';
import { isImportProduct } from './utils';
import { Products } from './products';
import { Products as ImportProducts } from './import-products';
const ProductsOrImportProducts = () => {
	const profileItems = useProfileItems();
	return isImportProduct( profileItems.business_choice ) ? (
		<ImportProducts />
	) : (
		<Products />
	);
};

registerPlugin( 'wc-admin-onboarding-task-products', {
	scope: 'woocommerce-tasks',
	render: () => (
		<WooOnboardingTask id="products">
			<ProductsOrImportProducts />
		</WooOnboardingTask>
	),
} );
