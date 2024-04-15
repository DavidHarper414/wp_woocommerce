/**
 * External dependencies
 */
import { test as base, expect } from '@woocommerce/e2e-playwright-utils';
import { cli } from '@woocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import ProductCollectionPage from '../product-collection/product-collection.page';

const blockData = {
	name: 'Filter by Stock',
	slug: 'woocommerce/stock-filter',
	urlSearchParamWhenFilterIsApplied: '?filter_stock_status=outofstock',
};

const test = base.extend< {
	productCollectionPageObject: ProductCollectionPage;
} >( {
	productCollectionPageObject: async (
		{ page, admin, editor, templateApiUtils, editorUtils },
		use
	) => {
		const pageObject = new ProductCollectionPage( {
			page,
			admin,
			editor,
			templateApiUtils,
			editorUtils,
		} );
		await use( pageObject );
	},
} );

test.describe( `${ blockData.name } Block - with PHP classic template`, () => {
	test.beforeEach( async ( { admin, page, editor, editorUtils } ) => {
		await cli(
			'npm run wp-env run tests-cli -- wp option update wc_blocks_use_blockified_product_grid_block_as_template false'
		);

		await admin.visitSiteEditor( {
			postId: 'woocommerce/woocommerce//archive-product',
			postType: 'wp_template',
		} );

		await editor.canvas.locator( 'body' ).click();

		await editorUtils.insertBlockUsingGlobalInserter( 'Filter by Stock' );
		await editor.saveSiteEditorEntities();
		await page.goto( `/shop` );
	} );

	test( 'should show all products', async ( { frontendUtils } ) => {
		const legacyTemplate = await frontendUtils.getBlockByName(
			'woocommerce/legacy-template'
		);

		const stockFilter = await frontendUtils.getBlockByName(
			'woocommerce/filter-wrapper'
		);

		const products = legacyTemplate
			.getByRole( 'list' )
			.locator( '.product' );

		await expect( products ).toHaveCount( 16 );

		await expect( stockFilter.getByText( 'In Stock' ) ).toBeVisible();
		await expect( stockFilter.getByText( 'Out of Stock' ) ).toBeVisible();
	} );

	test( 'should show only products that match the filter', async ( {
		frontendUtils,
	} ) => {
		const stockFilter = await frontendUtils.getBlockByName(
			'woocommerce/filter-wrapper'
		);

		await stockFilter.getByText( 'Out of Stock' ).click();

		const legacyTemplate = await frontendUtils.getBlockByName(
			'woocommerce/legacy-template'
		);

		const products = legacyTemplate
			.getByRole( 'list' )
			.locator( '.product' );

		await expect( products ).toHaveCount( 1 );
	} );
} );

test.describe( `${ blockData.name } Block - with Product Collection`, () => {
	test.beforeEach(
		async ( { admin, editorUtils, productCollectionPageObject } ) => {
			await admin.createNewPost();
			await productCollectionPageObject.insertProductCollection();
			await productCollectionPageObject.chooseCollectionInPost(
				'productCatalog'
			);
			await editorUtils.insertBlockUsingGlobalInserter(
				'Filter by Stock'
			);
			await editorUtils.publishAndVisitPost();
		}
	);

	test( 'should show all products', async ( { page } ) => {
		const products = page
			.locator( '.wp-block-woocommerce-product-template' )
			.getByRole( 'listitem' );

		await expect( products ).toHaveCount( 9 );
	} );

	test( 'should show only products that match the filter', async ( {
		page,
	} ) => {
		await page.getByText( 'Out of Stock' ).click();

		await page.waitForURL( ( url ) =>
			url
				.toString()
				.includes( blockData.urlSearchParamWhenFilterIsApplied )
		);

		const products = page
			.locator( '.wp-block-woocommerce-product-template' )
			.getByRole( 'listitem' );

		await expect( products ).toHaveCount( 1 );
	} );

	test( 'should refresh the page only if the user click on button', async ( {
		page,
		admin,
		editor,
		editorUtils,
		productCollectionPageObject,
	} ) => {
		await admin.createNewPost();
		await productCollectionPageObject.insertProductCollection();
		await productCollectionPageObject.chooseCollectionInPost(
			'productCatalog'
		);
		await editorUtils.insertBlockUsingGlobalInserter( 'Filter by Stock' );

		const stockFilterControls = await editorUtils.getBlockByName(
			'woocommerce/stock-filter'
		);
		await editor.selectBlocks( stockFilterControls );
		await editor.openDocumentSettingsSidebar();
		await page.getByText( "Show 'Apply filters' button" ).click();
		await editorUtils.publishAndVisitPost();

		await page.addInitScript( () => {
			document.addEventListener( 'DOMContentLoaded', () => {
				// eslint-disable-next-line dot-notation
				window[ '__DOMContentLoaded__' ] = true;
			} );
		} );

		await page.getByText( 'Out of Stock' ).click();
		await page.getByRole( 'button', { name: 'Apply' } ).click();

		await page.waitForEvent( 'domcontentloaded' );

		const domContentLoaded = await page.evaluate(
			// eslint-disable-next-line dot-notation
			() => window[ '__DOMContentLoaded__' ] === true
		);

		await expect( page.url() ).toContain(
			blockData.urlSearchParamWhenFilterIsApplied
		);

		expect( domContentLoaded ).toBe( true );
	} );
} );
