/**
 * External dependencies
 */
import { store, getContext } from '@wordpress/interactivity';
import type { HTMLElementEvent } from '@woocommerce/types';

/**
 * Internal dependencies
 */
import { ProductFiltersContext, ProductFiltersStore } from '../../frontend';
import { formatPrice, getCurrency } from '../../utils';

function inRange( value: number, min: number, max: number ) {
	return value >= min && value <= max;
}

export type ProductFilterPriceContext = {
	minRange: number;
	maxRange: number;
	activeLabelTemplates: Record< string, string >;
};

export type ProductFilterPriceStore = {
	state: {
		minPrice: number;
		maxPrice: number;
		formattedMinPrice: string;
		formattedMaxPrice: string;
	};
	actions: {
		getActivePriceAndLabel: (
			min: number,
			max: number
		) => {
			activeValue: string;
			activeLabel: string;
		};
		setPrice: ( type: 'min' | 'max', value: number ) => void;
		setMinPrice: ( e: HTMLElementEvent< HTMLInputElement > ) => void;
		setMaxPrice: ( e: HTMLElementEvent< HTMLInputElement > ) => void;
	};
};

const { state, actions } = store<
	ProductFiltersStore & ProductFilterPriceStore
>( 'woocommerce/product-filters', {
	state: {
		get minPrice() {
			const { activeFilters, minRange } = getContext<
				ProductFiltersContext & ProductFilterPriceContext
			>();
			const priceFilter = activeFilters.find(
				( filter ) => filter.type === 'price'
			);
			if ( priceFilter ) {
				const [ min ] = priceFilter.value.split( '|' );
				return min ? parseInt( min, 10 ) : minRange;
			}
			return minRange;
		},
		get maxPrice() {
			const { activeFilters, maxRange } = getContext<
				ProductFiltersContext & ProductFilterPriceContext
			>();
			const priceFilter = activeFilters.find(
				( filter ) => filter.type === 'price'
			);
			if ( priceFilter ) {
				const [ , max ] = priceFilter.value.split( '|' );
				return max ? parseInt( max, 10 ) : maxRange;
			}
			return maxRange;
		},
		get formattedMinPrice(): string {
			return formatPrice(
				state.minPrice,
				getCurrency( { minorUnit: 0 } )
			);
		},
		get formattedMaxPrice(): string {
			return formatPrice(
				state.maxPrice,
				getCurrency( { minorUnit: 0 } )
			);
		},
	},
	actions: {
		getActivePriceAndLabel( min: number, max: number ) {
			const context = getContext< ProductFilterPriceContext >();
			if (
				min &&
				min > context.minRange &&
				max &&
				max < context.maxRange
			)
				return {
					activeValue: `${ min }|${ max }`,
					activeLabel: context.activeLabelTemplates.minAndMax
						.replace(
							'{{min}}',
							formatPrice( min, getCurrency( { minorUnit: 0 } ) )
						)
						.replace(
							'{{max}}',
							formatPrice( max, getCurrency( { minorUnit: 0 } ) )
						),
				};

			if ( min && min > context.minRange ) {
				return {
					activeValue: `${ min }|`,
					activeLabel: context.activeLabelTemplates.minOnly.replace(
						'{{min}}',
						formatPrice( min, getCurrency( { minorUnit: 0 } ) )
					),
				};
			}

			if ( max && max < context.maxRange ) {
				return {
					activeValue: `|${ max }`,
					activeLabel: context.activeLabelTemplates.maxOnly.replace(
						'{{max}}',
						formatPrice( max, getCurrency( { minorUnit: 0 } ) )
					),
				};
			}

			return {
				activeValue: '',
				activeLabel: '',
			};
		},
		setPrice: ( type: 'min' | 'max', value: number ) => {
			const context = getContext<
				ProductFilterPriceContext & ProductFiltersContext
			>();
			const price: Record< string, number > = {
				min: state.minPrice,
				max: state.maxPrice,
			};

			if (
				type === 'min' &&
				value &&
				inRange( value, context.minRange, context.maxRange ) &&
				value < state.maxPrice
			) {
				price.min = value;
			}

			if (
				type === 'max' &&
				value &&
				inRange( value, context.minRange, context.maxRange ) &&
				value > state.minPrice
			) {
				price.max = value;
			}

			if ( price.min === context.minRange ) price.min = 0;
			if ( price.max === context.maxRange ) price.max = 0;

			context.activeFilters = context.activeFilters.filter(
				( item ) => item.type !== 'price'
			);
			const { activeValue, activeLabel } = actions.getActivePriceAndLabel(
				price.min,
				price.max
			);

			if ( activeValue ) {
				const newActivePriceFilter = {
					type: 'price',
					value: activeValue,
					activeLabel,
				};

				context.activeFilters.push( newActivePriceFilter );
			}
		},
		setMinPrice: ( e: HTMLElementEvent< HTMLInputElement > ) => {
			const price = parseInt( e.target.value, 10 );
			actions.setPrice( 'min', price );
		},
		setMaxPrice: ( e: HTMLElementEvent< HTMLInputElement > ) => {
			const price = parseInt( e.target.value, 10 );
			actions.setPrice( 'max', price );
		},
	},
} );
