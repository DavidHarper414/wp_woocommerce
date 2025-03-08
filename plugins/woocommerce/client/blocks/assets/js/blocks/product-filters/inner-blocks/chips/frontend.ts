/**
 * External dependencies
 */
import { getContext, store } from '@wordpress/interactivity';
import { ActiveFilterItem } from '../../frontend';

/**
 * Internal dependencies
 */

export type ChipsContext = {
	showAll: boolean;
	item: Partial< ActiveFilterItem >;
};

const { state, actions } = store( 'woocommerce/product-filters', {
	state: {
		get isChipSelected() {
			const {item} = getContext< ChipsContext >();
			console.log( state.activeFilters, item );
			return state.activeFilters.some( ( filter ) => {
				if( filter.type === 'attribute' ) {
					return filter.attribute?.slug === item.attribute?.slug && filter.value === item.value;
				}
				return filter.value === item.value && filter.type === item.type;
			});
		},
	},
	actions: {
		showAllChips: () => {
			const context = getContext< ChipsContext >();
			context.showAll = true;
		},
		toggleChip: ( value: string ) => {
			const {item} = getContext< ChipsContext >();
			if( state.isChipSelected ) {
				actions.removeActiveFilter( item );
			} else {
				actions.setActiveFilter( item );
			}
		},
	},
} );