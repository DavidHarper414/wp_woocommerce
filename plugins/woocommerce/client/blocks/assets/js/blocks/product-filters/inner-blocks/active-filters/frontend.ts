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

type ActiveFiltersStore = {
	state: {
		removeActiveFilterLabel: () => string;
		hasActiveFilters: () => boolean;
	};
	actions: {
		removeAllActiveFilters: () => void;
		removeActiveFilter: () => void;
	};
};

const { actions } = store< ProductFiltersStore & ActiveFiltersStore >(
	'woocommerce/product-filters',
	{
		state: {
			get removeActiveFilterLabel() {
				const { item, removeLabelTemplate } =
					getContext< ActiveFiltersContext >();
				return removeLabelTemplate.replace(
					'{{label}}',
					item.activeLabel
				);
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
	}
);
