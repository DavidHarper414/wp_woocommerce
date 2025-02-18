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
	collection: CoreCollectionNames;
};

const getRouterRegion = ( ref: HTMLElement ) =>
	ref?.closest( '[data-wp-router-region]' ) as HTMLElement;

const getRouterRegionId = ( ref: HTMLElement ) => {
	const routerRegionElement = getRouterRegion( ref );
	return routerRegionElement?.dataset?.wpRouterRegion;
};

const getNavDisabled = ( ref: HTMLElement ) => {
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
 * Focuses on the first product if it's not in the viewport.
 *
 * @param {string} wpRouterRegionId Unique ID for each Product Collection block on page/post.
 */
function focusOnFirstProductIfNotVisible( wpRouterRegionId?: string ) {
	if ( ! wpRouterRegionId ) {
		return;
	}

	// If the image is not visible, focus on the product link.
	const productSelector = `[data-wp-router-region=${ wpRouterRegionId }] .wc-block-product-template .wc-block-product a`;
	const product = document.querySelector( productSelector ) as HTMLElement;
	if ( product ) {
		product.focus();
	}
}

const productCollectionStore = {
	actions: {
		*navigate( event: MouseEvent ) {
			const { ref } = getElement() as unknown as {
				ref: HTMLAnchorElement;
			};

			if ( ! ref ) {
				return;
			}

			const isNavDisabled = getNavDisabled( ref );

			if ( isNavDisabled ) {
				yield forcePageReload( ref.href );
			}

			if ( isValidLink( ref ) && isValidEvent( event ) ) {
				event.preventDefault();

				const ctx = getContext< ProductCollectionStoreContext >();
				const routerRegionId = getRouterRegionId( ref );

				const { actions } = yield import(
					'@wordpress/interactivity-router'
				);

				yield actions.navigate( ref.href );

				ctx.isPrefetchNextOrPreviousLink = !! ref.href;

				focusOnFirstProductIfNotVisible( routerRegionId );

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
			const { ref } = getElement() as unknown as {
				ref: HTMLAnchorElement;
			};

			if ( ! ref ) {
				return;
			}

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
			const { ref } = getElement() as unknown as {
				ref: HTMLAnchorElement;
			};

			if ( ! ref ) {
				return;
			}

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
