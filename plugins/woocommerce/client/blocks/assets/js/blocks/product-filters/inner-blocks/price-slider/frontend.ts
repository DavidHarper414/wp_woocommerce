/**
 * External dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';
import type { HTMLElementEvent } from '@woocommerce/types';

/**
 * Internal dependencies
 */
import type { ProductFiltersStore } from '../../frontend';
import type {
	ProductFilterPriceContext,
	ProductFilterPriceStore,
} from '../price-filter/frontend';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebouncedFunction< T extends ( ...args: any[] ) => any > = ( (
	...args: Parameters< T >
) => void ) & { flush: () => void };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = < T extends ( ...args: any[] ) => any >(
	func: T,
	wait: number,
	immediate?: boolean
): DebouncedFunction< T > => {
	let timeout: ReturnType< typeof setTimeout > | null;
	let latestArgs: Parameters< T > | null = null;

	const debounced = ( ( ...args: Parameters< T > ) => {
		latestArgs = args;
		if ( timeout ) clearTimeout( timeout );
		timeout = setTimeout( () => {
			timeout = null;
			if ( ! immediate && latestArgs ) func( ...latestArgs );
		}, wait );
		if ( immediate && ! timeout ) func( ...args );
	} ) as DebouncedFunction< T >;

	debounced.flush = () => {
		if ( timeout && latestArgs ) {
			func( ...latestArgs );
			clearTimeout( timeout );
			timeout = null;
		}
	};

	return debounced;
};

type ProductFilterPriceSliderStore = ProductFiltersStore &
	ProductFilterPriceStore & {
		state: {
			rangeStyle: () => string;
		};
		actions: {
			selectInputContent: () => void;
			debounceSetPrice: (
				e: HTMLElementEvent< HTMLInputElement >
			) => void;
			limitRange: ( e: HTMLElementEvent< HTMLInputElement > ) => void;
		};
	};

const { state } = store< ProductFilterPriceSliderStore >(
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
			debounceSetPrice: debounce(
				( e: HTMLElementEvent< HTMLInputElement > ) => {
					e.target.dispatchEvent( new Event( 'change' ) );
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
