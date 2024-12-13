/**
 * External dependencies
 */
import { test, expect, BlockData } from '@woocommerce/e2e-utils';

// Block is soft-depreacted meaning that it's hidden from the inserter.
const blockData: BlockData = {
	name: 'Related Products',
	slug: 'woocommerce/related-products',
	mainClass: '.wc-block-related-products',
	selectors: {
		frontend: {},
		editor: {},
	},
};

const relatedProductsControlsBlockData: BlockData = {
	name: 'Related Products Controls',
	slug: 'woocommerce/related-products',
	mainClass: '.wc-block-related-products',
	selectors: {
		frontend: {},
		editor: {},
	},
};

test.describe( `${ blockData.name } Block`, () => {
	test( "can't be added in the Post Editor", async ( { admin, editor } ) => {
		await admin.createNewPost();
		await editor.insertBlock( { name: blockData.slug } );
		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeHidden();
	} );

	test( "can't be added in the Product Catalog Template", async ( {
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `woocommerce/woocommerce//archive-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await editor.setContent( '' );

		try {
			await editor.insertBlock( { name: blockData.slug } );
		} catch ( _error ) {
			// noop
		}

		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeHidden();
	} );

	test( "can't be added in the Single Product Template", async ( {
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `woocommerce/woocommerce//single-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );
		await editor.setContent( '' );

		// Inserting Related Products by name
		// (but it's a Product Collection variation).
		await editor.insertBlockUsingGlobalInserter( blockData.name );

		// Verifying by slug - it's expected it's NOT woocommerce/related-products.
		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeVisible();

		await expect(
			await editor.getBlockByName( relatedProductsControlsBlockData.slug )
		).toBeVisible();
	} );

	test( "doesn't display additional Products (Beta) options", async ( {
		page,
		admin,
		editor,
	} ) => {
		await admin.visitSiteEditor( {
			postId: `woocommerce/woocommerce//single-product`,
			postType: 'wp_template',
			canvas: 'edit',
		} );
		const relatedProducts = await editor.getBlockByName( blockData.slug );
		await editor.selectBlocks( relatedProducts );
		await editor.openDocumentSettingsSidebar();

		const inspectorControls = page.getByRole( 'region', {
			name: 'Editor settings',
		} );

		const upgradeNotice = inspectorControls.getByRole( 'button', {
			name: 'Upgrade to Product Collection',
		} );
		const advancedFilters = inspectorControls.getByRole( 'heading', {
			name: 'Advanced filters',
		} );

		await expect( upgradeNotice ).toBeHidden();
		await expect( advancedFilters ).toBeHidden();

		// Reality check - the above test will pass if:
		// 1. options are not there - valid case,
		// 2. selectors changed or are incorrect - invalid case.
		//
		// To confirm test is correct, we verify if Products (Beta)
		// have these options available using the same locators.
		await editor.setContent( '' );
		const querySlug = 'core/query';
		const productsBetaSlug = 'woocommerce/product-query';
		await editor.insertBlock( {
			name: querySlug,
			attributes: { namespace: productsBetaSlug },
		} );
		const productsBeta = await editor.getBlockByName( querySlug );
		await editor.selectBlocks( productsBeta );
		await expect( upgradeNotice ).toBeVisible();
		await expect( advancedFilters ).toBeVisible();
	} );
} );
