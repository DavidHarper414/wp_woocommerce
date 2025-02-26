const { test } = require( './fixtures' );
const { ADMIN_STATE_PATH } = require( '../playwright.config' );

exports.test = test.extend( {
	page: async ( { page, restApi }, use ) => {
		// Enable product block editor
		await restApi.put(
			'wc/v3/settings/advanced/woocommerce_feature_product_block_editor_enabled',
			{
				value: 'yes',
			}
		);

		// Disable the product editor tour
		await restApi.post( 'wc-admin/options', {
			woocommerce_block_product_tour_shown: 'yes',
		} );

		await use( page );

		// Disable product block editor
		await restApi.put(
			'wc/v3/settings/advanced/woocommerce_feature_product_block_editor_enabled',
			{
				value: 'no',
			}
		);
	},
	storageState: ADMIN_STATE_PATH,
} );
