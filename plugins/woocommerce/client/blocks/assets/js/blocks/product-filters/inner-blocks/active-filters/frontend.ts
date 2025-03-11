/**
 * External dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

/**
 * Internal dependencies
 */
import type {
	ActiveFilterItem,
	ProductFiltersContext,
	ProductFiltersStore,
} from '../../frontend';

type ActiveFiltersContext = {
	removeLabelTemplate: string;
	item: ActiveFilterItem;
};

const activeFiltersStore = {
	state: {
		get removeActiveFilterLabel() {
			const { item, removeLabelTemplate } =
				getContext< ActiveFiltersContext >();
			return removeLabelTemplate.replace( '{{label}}', item.activeLabel );
		},
		get hasActiveFilters() {
			const { activeFilters } = getContext< ProductFiltersContext >();
			return activeFilters.length > 0;
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
			actions._removeActiveFiltersBy(
				( filter ) =>
					filter.value === item.value && filter.type === item.type
			);
			actions.navigate();
		},
	},
};

const { actions } = store< ProductFiltersStore & typeof activeFiltersStore >(
	'woocommerce/product-filters',
	activeFiltersStore
);
