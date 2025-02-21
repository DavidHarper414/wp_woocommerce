/**
 * External dependencies
 */
import { store } from '@wordpress/interactivity';

/**
 * Internal dependencies
 */
import type { StoreNoticesStore } from '../../blocks/store-notices/frontend';
import { triggerAddedToCartEvent } from './legacy-events';

type Item = {
	key?: string;
	id: number;
	quantity: number;
};

export type Store = {
	state: {
		restUrl: string;
		nonce: string;
		cart: {
			items: Item[];
		};
	};
	actions: {
		addCartItem: ( args: { id: number; quantity: number } ) => void;
		// Todo: Check why if I switch to an async function here the types of the store stop working.
		refreshCartItems: () => void;
	};
};

type StoreAPIError = { message: string; code: string };
type CartItemResponse = Item | StoreAPIError;
type CartItemsResponse = Item[] | StoreAPIError;

function isSuccessfulResponse(
	res: Response,
	json: CartItemsResponse | CartItemResponse
): json is Item | Item[] {
	return res.status.toString().startsWith( '2' );
}

function generateError( json: StoreAPIError ) {
	return Object.assign( new Error( json.message || 'Unknown error.' ), {
		code: json.code || 'unknown_error',
	} );
}

let pendingRefresh = false;
let refreshTimeout = 3000;
let eventId = 0;

function emitSyncEvent() {
	++eventId;

	window.dispatchEvent(
		new CustomEvent( 'wc-blocks_cart_sync_required', {
			detail: { type: 'from_iAPI', id: eventId },
		} )
	);
}

// Question: disable "used before defined" lint rule?
export const { state, actions } = store< Store >( 'woocommerce', {
	actions: {
		*addCartItem( { id, quantity }: { id: number; quantity: number } ) {
			let itemIndex = state.cart.items.findIndex(
				( { id: productId } ) => id === productId
			);
			const previousQuantity =
				state.cart.items[ itemIndex ]?.quantity ?? 0;
			let key: string | null = null;

			// Optimistically updates the number of items in the cart.
			if ( itemIndex !== -1 ) {
				state.cart.items[ itemIndex ].quantity = quantity;
				key = state.cart.items[ itemIndex ].key || null;
			} else {
				state.cart.items.push( { id, quantity } );
				itemIndex = state.cart.items.length - 1;
			}

			// Updates the database.
			try {
				const res: Response = yield fetch(
					`${ state.restUrl }wc/store/v1/cart/items/${ key || '' }`,
					{
						method: key ? 'PUT' : 'POST',
						headers: {
							Nonce: state.nonce,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify( state.cart.items[ itemIndex ] ),
					}
				);
				const json: CartItemResponse = yield res.json();

				// Checks if the response contains an error.
				if ( ! isSuccessfulResponse( res, json ) )
					throw generateError( json );

				// Updates the local cart.
				state.cart.items[ itemIndex ] = json;

				// dispatch legacy event
				triggerAddedToCartEvent( {
					preserveCartData: true,
				} );

				// Dispatches the event to sync the @wordpress/data store.
				emitSyncEvent();
			} catch ( error ) {
				// Reverts the optimistic update.
				state.cart.items[ itemIndex ].quantity = previousQuantity || 0;

				throw error;
			}
		},
		*refreshCartItems() {
			// Skips if there's a pending request.
			if ( pendingRefresh ) return;

			pendingRefresh = true;

			try {
				const res: Response = yield fetch(
					`${ state.restUrl }wc/store/v1/cart/items`,
					{ headers: { 'Content-Type': 'application/json' } }
				);
				const json: CartItemsResponse = yield res.json();

				// Checks if the response contains an error.
				if ( ! isSuccessfulResponse( res, json ) )
					throw generateError( json );

				// Updates the local cart.
				state.cart.items = json;

				// Resets the timeout.
				refreshTimeout = 3000;
			} catch ( error ) {
				// Tries again after the timeout.
				setTimeout( actions.refreshCartItems, refreshTimeout );

				// Increases the timeout exponentially.
				refreshTimeout *= 2;
			} finally {
				pendingRefresh = false;
			}
		},
	},
} );

window.addEventListener(
	'wc-blocks_cart_sync_required',
	async ( event: Event ) => {
		const customEvent = event as CustomEvent< {
			type: string;
			id: number;
		} >;
		if ( customEvent.detail.type === 'from_@wordpress/data' ) {
			actions.refreshCartItems();
		}
	}
);
