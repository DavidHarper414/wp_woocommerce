/**
 * External dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Internal dependencies
 */
import type { ActiveFilterItem, ProductFiltersContext } from '../../frontend';

type ActiveFiltersContext = {
	removeLabelTemplate: string;
	item: ActiveFilterItem
};

const { actions } = store( 'woocommerce/product-filters', {
	state: {
		get removeActiveFilterLabel() {
			const { item, removeLabelTemplate } = getContext< ActiveFiltersContext >();
			return removeLabelTemplate.replace( '{{label}}', item.activeLabel );
		},
	},
	actions: {
		removeAllActiveFilters: () => {
			const context = getContext< ProductFiltersContext >();
			context.activeFilters = [];
			actions.navigate();
		},
		removeActiveFilter: () => {
			const { item } = getContext< ActiveFiltersContext >();
			actions.removeActiveFiltersBy( ( filter ) => filter.value === item.value && filter.type === item.type );
			actions.navigate();
		},
	},
} );
