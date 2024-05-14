/**
 * External dependencies
 */
import { test, expect } from '@woocommerce/e2e-playwright-utils';
import { BlockData } from '@woocommerce/e2e-types';

const blockData: BlockData = {
	name: 'Mini-Cart',
	slug: 'woocommerce/mini-cart',
	mainClass: '.wc-block-minicart',
	selectors: {
		editor: {
			block: '.wp-block-woocommerce-mini-cart',
			insertButton: "//button//span[text()='Mini-Cart']",
		},
		frontend: {},
	},
};

test.describe( 'Merchant → Mini Cart', () => {
	test.describe( 'in FSE editor', () => {
		test( 'can be inserted in FSE area', async ( {
			editorUtils,
			editor,
			admin,
		} ) => {
			await admin.visitSiteEditor( {
				postId: `woocommerce/woocommerce//single-product`,
				postType: 'wp_template',
			} );
			await editorUtils.enterEditMode();

			await editor.setContent( '' );

			await editor.insertBlock( { name: blockData.slug } );
			await expect(
				editor.canvas.getByLabel( 'Block: Mini-Cart' )
			).toBeVisible();
		} );

		test( 'can only be inserted once', async ( { editorUtils, admin } ) => {
			await admin.visitSiteEditor( {
				postId: `woocommerce/woocommerce//single-product`,
				postType: 'wp_template',
			} );
			await editorUtils.enterEditMode();
			await editorUtils.openGlobalBlockInserter();

			await editorUtils.page
				.getByLabel( 'Search for blocks and patterns' )
				.fill( blockData.slug );

			const miniCartButton = editorUtils.page.getByRole( 'option', {
				name: blockData.name,
			} );

			await expect( miniCartButton ).toBeVisible();
			await expect( miniCartButton ).toBeDisabled();
		} );
	} );
} );
