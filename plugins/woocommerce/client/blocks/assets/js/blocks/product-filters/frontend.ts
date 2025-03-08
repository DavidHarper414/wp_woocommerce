/**
 * External dependencies
 */
import * as iAPI from '@wordpress/interactivity';

const { getContext, store, getServerContext } = iAPI;

const getSetting = window.wc.wcSettings.getSetting;
const isBlockTheme = getSetting( 'isBlockTheme' );
const isProductArchive = getSetting( 'isProductArchive' );
const needsRefresh = getSetting( 'needsRefreshForInteractivityAPI', false );

function isParamsEqual(
	obj1: Record< string, string >,
	obj2: Record< string, string >
): boolean {
	const keys1 = Object.keys( obj1 );
	const keys2 = Object.keys( obj2 );

	// First check if both objects have the same number of keys
	if ( keys1.length !== keys2.length ) {
		return false;
	}

	// Check if all keys and values are the same
	for ( const key of keys1 ) {
		if ( obj1[ key ] !== obj2[ key ] ) {
			return false;
		}
	}

	return true;
}

async function navigate( href: string, options = {} ) {
	/**
	 * We may need to reset the current page when changing filters.
	 * This is because the current page may not exist for this set
	 * of filters and will 404 when the user navigates to it.
	 *
	 * There are different pagination formats to consider, as documented here:
	 * https://github.com/WordPress/gutenberg/blob/317eb8f14c8e1b81bf56972cca2694be250580e3/packages/block-library/src/query-pagination-numbers/index.php#L22-L85
	 */
	const url = new URL( href );
	// When pretty permalinks are enabled, the page number may be in the path name.
	url.pathname = url.pathname.replace( /\/page\/[0-9]+/i, '' );
	// When plain permalinks are enabled, the page number may be in the "paged" query parameter.
	url.searchParams.delete( 'paged' );
	// On posts and pages the page number will be in a query parameter that
	// identifies which block we are paginating.
	url.searchParams.forEach( ( _, key ) => {
		if ( key.match( /^query(?:-[0-9]+)?-page$/ ) ) {
			url.searchParams.delete( key );
		}
	} );
	// Make sure to update the href with the changes.
	href = url.href;

	if ( needsRefresh || ( ! isBlockTheme && isProductArchive ) ) {
		return ( window.location.href = href );
	}

	const { actions } = await import( '@wordpress/interactivity-router' );
	return actions.navigate( href, options );
}

type FilterItem = {
	label: string;
	ariaLabel: string;
	value: string;
	selected: boolean;
	count: number;
	type: string;
	attributeQueryType: 'and' | 'or';
};

export type ActiveFilterItem = Pick< FilterItem, 'type' | 'value' | 'attributeQueryType' > & {
	activeLabel: string;
};

export type ProductFiltersContext = {
	isOverlayOpened: boolean;
	params: Record< string, string >;
	originalParams: Record< string, string >;
	activeFilters: ActiveFilterItem[];
	item: FilterItem;
	activeLabelTemplate: string;
	filterType: string;
};

const { state, actions } = store( 'woocommerce/product-filters', {
	state: {
		get params() {
			const { activeFilters } = getContext< ProductFiltersContext >();
			const params: Record< string, string > = {};

			function addParam( key: string, value: string ) {
				if ( key in params && params[ key ].length > 0 )
					return ( params[ key ] = `${ params[ key ] },${ value }` );
				params[ key ] = value;
			}

			activeFilters.forEach( ( filter ) => {
				const { type, value } = filter;

				if ( ! value ) return;

				if ( type === 'price' ) {
					const [ min, max ] = value.split( '|' );
					if ( min ) params.min_price = min;
					if ( max ) params.max_price = max;
				}

				if ( type === 'status' ) {
					addParam( 'filter_stock_status', value );
				}

				if ( type === 'rating' ) {
					addParam( `rating_filter`, value );
				}

				if( type.includes('attribute') ) {
					const [ , slug ] = type.split( '/' );
					addParam( `filter_${ slug }`, value );
					params[ `query_type_${ slug }` ] = filter.attributeQueryType || 'or';
				}
			} );
			return params;
		},
		get activeFilters() {
			const { activeFilters } = getContext< ProductFiltersContext >();
			return activeFilters
				.filter( ( item ) => !! item.value )
				.sort( ( a, b ) => {
					return a.activeLabel
						.toLowerCase()
						.localeCompare( b.activeLabel.toLowerCase() );
				} )
				.map( ( item ) => ( {
					...item,
					uid: `${ item.type }/${ item.value }`,
				} ) );
		},
		get hasFilterOptions() {
			const {activeFilters, filterType } = getContext< ProductFiltersContext >();
			console.log( activeFilters, filterType );
			if( filterType === 'active' ) {
				return activeFilters.length > 0;
			}
			return activeFilters.some( item => item.type === filterType )
		},
	},
	actions: {
		openOverlay: () => {
			const context = getContext< ProductFiltersContext >();
			context.isOverlayOpened = true;
			if ( document.getElementById( 'wpadminbar' ) ) {
				const scrollTop = (
					document.documentElement ||
					document.body.parentNode ||
					document.body
				).scrollTop;
				document.body.style.setProperty(
					'--adminbar-mobile-padding',
					`max(calc(var(--wp-admin--admin-bar--height) - ${ scrollTop }px), 0px)`
				);
			}
		},
		closeOverlay: () => {
			const context = getContext< ProductFiltersContext >();
			context.isOverlayOpened = false;
		},
		closeOverlayOnEscape: ( event: KeyboardEvent ) => {
			const context = getContext< ProductFiltersContext >();
			if ( context.isOverlayOpened && event.key === 'Escape' ) {
				actions.closeOverlay();
			}
		},
		removeActiveFiltersBy: (
			callback: ( item: ActiveFilterItem ) => boolean
		) => {
			const context = getContext< ProductFiltersContext >();
			context.activeFilters = context.activeFilters.filter(
				( item ) => ! callback( item )
			);
		},
		selectFilter: () => {
			const context = getContext< ProductFiltersContext >();
			const newActiveFilter = {
				value: context.item.value,
				type: context.item.type,
				attributeQueryType: context.item.attributeQueryType,
				activeLabel: context.activeLabelTemplate.replace( '{{label}}', context.item.label )
			};
			const newActiveFilters = context.activeFilters.filter(
				( activeFilter ) => ! ( activeFilter.value === newActiveFilter.value && activeFilter.type === newActiveFilter.type )
			);

			newActiveFilters.push( newActiveFilter );

			context.activeFilters = newActiveFilters;
		},
		unselectFilter: () => {
			const {item} = getContext< ProductFiltersContext >();
			actions.removeActiveFiltersBy(
				( activeFilter ) => activeFilter.type === item.type && activeFilter.value === item.value
			);
		},
		*navigate() {
			const { originalParams } = getServerContext
				? getServerContext< ProductFiltersContext >()
				: getContext< ProductFiltersContext >();

			if (
				isParamsEqual(
					state.params,
					originalParams
				)
			) {
				return;
			}

			const url = new URL( window.location.href );
			const { searchParams } = url;

			for ( const key in originalParams ) {
				searchParams.delete( key );
			}

			for ( const key in state.params ) {
				searchParams.set(
					key,
					state.params[ key ]
				);
			}

			yield navigate( url.href );
		},
	},
	callbacks: {
		scrollLimit: () => {
			const { isOverlayOpened } = getContext< ProductFiltersContext >();
			if ( isOverlayOpened ) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = 'auto';
			}
		},
	},
} );
