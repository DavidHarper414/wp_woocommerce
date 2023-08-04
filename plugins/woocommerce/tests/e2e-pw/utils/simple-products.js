const SETTINGS_URL =
	'wp-admin/admin.php?page=wc-settings&tab=advanced&section=features';

/**
 * This function checks whether the block product editor is enabled on a page.
 *
 * Navigates to the block product editor and verifies it's enabled.
 *
 * @param {Page} page
 *
 * @returns {Promise<boolean>} Boolean value based on the visibility of the element.
 */
async function isBlockProductEditorEnabled( page ) {
	await page.goto( SETTINGS_URL );
	return await page
		.locator( '#woocommerce_feature_product_block_editor_enabled' )
		.isChecked();
}

/**
 * This function is typically used for enabling/disabling the block product editor in settings page.
 *
 * @param {string} action The action that will be performed.
 * @param {Page} page
 */
async function toggleBlockProductEditor( action = 'enable', page ) {
	await page.goto( SETTINGS_URL );
	if ( action === 'disable' ) {
		await page
			.locator( '#woocommerce_feature_product_block_editor_enabled' )
			.uncheck();
	} else {
		await page
			.locator( '#woocommerce_feature_product_block_editor_enabled' )
			.check();
	}
	await page
		.locator( '.submit' )
		.getByRole( 'button', {
			name: 'Save changes',
		} )
		.click();
}

/**
 * This function simulates the clicking of the "Add New" link under the "product" section in the menu.
 *
 * @param {Page} page
 */
async function clickAddNewMenuItem( page ) {
	await page
		.locator( '#menu-posts-product' )
		.getByRole( 'link', { name: 'Add New' } )
		.click();
}

module.exports = {
	clickAddNewMenuItem,
	isBlockProductEditorEnabled,
	toggleBlockProductEditor,
};
