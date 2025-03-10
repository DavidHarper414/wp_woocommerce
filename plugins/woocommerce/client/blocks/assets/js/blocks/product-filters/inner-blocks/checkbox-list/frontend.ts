/**
 * External dependencies
 */
import { getContext, store } from '@wordpress/interactivity';

type CheckboxListContext = {
	showAll: boolean;
};

store( 'woocommerce/product-filter-checkbox-list', {
	actions: {
		showAllListItems: () => {
			const context = getContext< CheckboxListContext >();
			context.showAll = true;
		},
	},
} );
