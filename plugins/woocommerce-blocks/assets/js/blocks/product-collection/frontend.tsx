/**
 * External dependencies
 */
import { store, getElement, getContext } from '@wordpress/interactivity';

/**
 * Internal dependencies
 */
import {
	triggerProductListRenderedEvent,
	triggerViewedProductEvent,
} from './legacy-events';
import { CoreCollectionNames } from './types';
import './style.scss';

export type ProductCollectionStoreContext = {
	// Available on the <li/> product element and deeper
	productId?: number;
	isPrefetchNextOrPreviousLink: boolean;
	accessibilityMessage: string;
	accessibilityLoadingMessage: string;
	accessibilityLoadedMessage: string;
	collection: CoreCollectionNames;
};

const getRouterRegion = ( ref: HTMLDivElement ) =>
	ref?.closest( '[data-wp-router-region]' ) as HTMLDivElement;

const getRouterRegionId = ( ref: HTMLDivElement ) => {
	const routerRegionElement = getRouterRegion( ref );
	return routerRegionElement?.dataset?.wpRouterRegion;
};

const getNavDisabled = ( ref: HTMLDivElement ) => {
	const routerRegionElement = getRouterRegion( ref );
	return routerRegionElement?.dataset?.wpNavigationDisabled;
};

const isValidLink = ( ref: HTMLAnchorElement ) =>
	ref &&
	ref instanceof window.HTMLAnchorElement &&
	ref.href &&
	( ! ref.target || ref.target === '_self' ) &&
	ref.origin === window.location.origin;

const isValidEvent = ( event: MouseEvent ) =>
	event.button === 0 && // Left clicks only.
	! event.metaKey && // Open in new tab (Mac).
	! event.ctrlKey && // Open in new tab (Windows).
	! event.altKey && // Download.
	! event.shiftKey &&
	! event.defaultPrevented;

const forcePageReload = ( href: string ) => {
	window.location.assign( href );
	// It's function called in generator expecting asyncFunc return.
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	return new Promise( () => {} );
};

/**
 * Ensures the visibility of the first product in the collection.
 * Scrolls the page to the first product if it's not in the viewport.
 *
 * @param {string} wpRouterRegionId Unique ID for each Product Collection block on page/post.
 */
function scrollToFirstProductIfNotVisible( wpRouterRegionId?: string ) {
	if ( ! wpRouterRegionId ) {
		return;
	}

	const productSelector = `[data-wp-router-region=${ wpRouterRegionId }] .wc-block-product-template .wc-block-product`;
	const product = document.querySelector( productSelector );
	if ( product ) {
		const rect = product.getBoundingClientRect();
		const isVisible =
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <=
				( window.innerHeight ||
					document.documentElement.clientHeight ) &&
			rect.right <=
				( window.innerWidth || document.documentElement.clientWidth );

		// If the product is not visible, scroll to it.
		if ( ! isVisible ) {
			product.scrollIntoView( {
				behavior: 'smooth',
				block: 'start',
			} );
		}
	}
}

const productCollectionStore = {
	actions: {
		*navigate( event: MouseEvent ) {
			const { ref } = getElement();

			if ( ! ref ) {
				return;
			}

			const ctx = getContext< ProductCollectionStoreContext >();

			const routerRegionId = getRouterRegionId( ref );
			const isNavDisabled = getNavDisabled( ref );

			if ( isNavDisabled ) {
				yield forcePageReload( ref.href );
			}

			if ( isValidLink( ref ) && isValidEvent( event ) ) {
				event.preventDefault();

				const { actions } = yield import(
					'@wordpress/interactivity-router'
				);

				yield actions.navigate( ref.href );

				// Announce that the page has been loaded. If the message is the
				// same, we use a no-break space similar to the @wordpress/a11y
				// package: https://github.com/WordPress/gutenberg/blob/c395242b8e6ee20f8b06c199e4fc2920d7018af1/packages/a11y/src/filter-message.js#L20-L26
				ctx.accessibilityMessage =
					ctx.accessibilityLoadedMessage +
					( ctx.accessibilityMessage ===
					ctx.accessibilityLoadedMessage
						? '\u00A0'
						: '' );

				ctx.isPrefetchNextOrPreviousLink = !! ref.href;

				scrollToFirstProductIfNotVisible( routerRegionId );

				triggerProductListRenderedEvent( {
					collection: ctx.collection,
				} );
			}
		},
		/**
		 * We prefetch the next or previous button page on hover.
		 * Optimizes user experience by preloading content for faster access.
		 */
		*prefetchOnHover() {
			const { ref } = getElement();

			const isNavDisabled = getNavDisabled( ref );

			if ( isNavDisabled ) {
				return;
			}

			if ( isValidLink( ref ) ) {
				const { actions } = yield import(
					'@wordpress/interactivity-router'
				);
				yield actions.prefetch( ref.href );
			}
		},
		*viewProduct() {
			const { collection, productId } =
				getContext< ProductCollectionStoreContext >();

			if ( productId ) {
				triggerViewedProductEvent( { collection, productId } );
			}
		},
	},
	callbacks: {
		/**
		 * Prefetches content for next or previous links after initial user interaction.
		 * Reduces perceived load times for subsequent page navigations.
		 */
		*prefetch() {
			const { ref } = getElement();
			const isNavDisabled = getNavDisabled( ref );

			if ( isNavDisabled ) {
				return;
			}

			const context = getContext< ProductCollectionStoreContext >();

			if ( context?.isPrefetchNextOrPreviousLink && isValidLink( ref ) ) {
				const { actions } = yield import(
					'@wordpress/interactivity-router'
				);
				yield actions.prefetch( ref.href );
			}
		},
		*onRender() {
			const { collection } =
				getContext< ProductCollectionStoreContext >();

			triggerProductListRenderedEvent( { collection } );
		},
	},
};

store( 'woocommerce/product-collection', productCollectionStore );
