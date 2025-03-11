/**
 * External dependencies
 */
import {
	store,
	getContext,
	getElement,
	withScope,
} from '@wordpress/interactivity';
import type { HTMLElementEvent } from '@woocommerce/types';

/**
 * Internal dependencies
 */
import type { ProductFiltersStore } from '../../frontend';
import type {
	ProductFilterPriceContext,
	ProductFilterPriceStore,
} from '../price-filter/frontend';

function debounceWithScope< Args extends unknown[] >(
	func: ( ...args: Args ) => void,
	timeout = 300
) {
	let timer: ReturnType< typeof setTimeout > | null;
	return function ( this: unknown, ...args: Args ) {
		if ( timer ) clearTimeout( timer );
		timer = setTimeout(
			withScope( () => {
				func.apply( this, args );
			} ),
			timeout
		);
	};
}

type ProductFilterPriceSliderStore = ProductFiltersStore &
	ProductFilterPriceStore & {
		state: {
			rangeStyle: () => string;
		};
		actions: {
			selectInputContent: () => void;
			limitRange: ( e: HTMLElementEvent< HTMLInputElement > ) => void;
			debounceSetMinPrice: (
				e: HTMLElementEvent< HTMLInputElement >
			) => void;
			debounceSetMaxPrice: (
				e: HTMLElementEvent< HTMLInputElement >
			) => void;
		};
	};

const { state, actions } = store< ProductFilterPriceSliderStore >(
	'woocommerce/product-filters',
	{
		state: {
			rangeStyle: () => {
				const context = getContext< ProductFilterPriceContext >();
				return `--low: ${
					( 100 * ( state.minPrice - context.minRange ) ) /
					( context.maxRange - context.minRange )
				}%; --high: ${
					( 100 * ( state.maxPrice - context.minRange ) ) /
					( context.maxRange - context.minRange )
				}%;`;
			},
		},
		actions: {
			selectInputContent: () => {
				const element = getElement();
				if ( element?.ref instanceof HTMLInputElement ) {
					element.ref.select();
				}
			},
			debounceSetMinPrice: debounceWithScope(
				( e: HTMLElementEvent< HTMLInputElement > ) => {
					actions.setMinPrice( e );
					actions.navigate();
				},
				1000
			),
			debounceSetMaxPrice: debounceWithScope(
				( e: HTMLElementEvent< HTMLInputElement > ) => {
					actions.setMaxPrice( e );
					actions.navigate();
				},
				1000
			),
			limitRange: ( e: HTMLElementEvent< HTMLInputElement > ) => {
				if ( e.target.classList.contains( 'min' ) ) {
					e.target.value = Math.min(
						parseInt( e.target.value, 10 ),
						state.maxPrice - 1
					).toString();
				} else {
					e.target.value = Math.max(
						parseInt( e.target.value, 10 ),
						state.minPrice + 1
					).toString();
				}
			},
		},
	}
);
