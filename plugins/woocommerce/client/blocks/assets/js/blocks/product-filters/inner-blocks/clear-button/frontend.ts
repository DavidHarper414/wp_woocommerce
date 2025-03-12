/**
 * External dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Internal dependencies
 */
import { ProductFiltersContext } from '../../frontend';

type ClearButtonContext = {
	parent: string;
};

const { actions } = store( 'woocommerce/product-filters', {
	actions: {
		clearFilters: () => {
			const context = getContext<
				ProductFiltersContext & ClearButtonContext
			>();

			if ( context.parent === 'woocommerce/product-filter-active' ) {
				context.activeFilters = [];
			}

			actions.navigate();
		},
	},
} );
