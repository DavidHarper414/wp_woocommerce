/**
 * External dependencies
 */
import { test as base, expect } from '@woocommerce/e2e-playwright-utils';
import { cli } from '@woocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import ProductCollectionPage from '../product-collection/product-collection.page';

export const blockData = {
	name: 'Filter by Stock',
	slug: 'woocommerce/stock-filter',
	urlSearchParamWhenFilterIsApplied: 'filter_stock_status=outofstock',
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

test.describe( `${ blockData.name } Block`, () => {
	test.beforeEach( async ( { admin, editor } ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'woocommerce/filter-wrapper',
			attributes: {
				filterType: 'stock-filter',
				heading: 'Filter By Price',
			},
		} );

		await editor.openDocumentSettingsSidebar();
	} );

	test( "should allow changing the block's title", async ( { page } ) => {
		const textSelector =
			'.wp-block-woocommerce-filter-wrapper .wp-block-heading';

		const title = 'New Title';

		await page.locator( textSelector ).fill( title );

		await expect( page.locator( textSelector ) ).toHaveText( title );
	} );

	test( 'should allow changing the display style', async ( {
		page,
		editorUtils,
		editor,
	} ) => {
		const stockFilter = await editorUtils.getBlockByName( blockData.slug );
		await editor.selectBlocks( stockFilter );

		await expect(
			stockFilter.getByRole( 'checkbox', {
				name: 'In Stock',
			} )
		).toBeVisible();

		await expect(
			stockFilter.getByRole( 'checkbox', {
				name: 'Out of Stock',
			} )
		).toBeVisible();

		await page.getByLabel( 'DropDown' ).click();

		await expect(
			stockFilter.getByRole( 'checkbox', {
				name: 'In Stock',
			} )
		).toBeHidden();

		await expect(
			stockFilter.getByRole( 'checkbox', {
				name: 'Out of Stock',
			} )
		).toBeHidden();

		await expect( page.getByRole( 'combobox' ) ).toBeVisible();
	} );

	test( 'should allow toggling the visibility of the filter button', async ( {
		page,
		editorUtils,
		editor,
	} ) => {
		const priceFilterControls = await editorUtils.getBlockByName(
			blockData.slug
		);
		await editor.selectBlocks( priceFilterControls );

		await expect(
			priceFilterControls.getByRole( 'button', {
				name: 'Apply',
			} )
		).toBeHidden();

		await page.getByText( "Show 'Apply filters' button" ).click();

		await expect(
			priceFilterControls.getByRole( 'button', {
				name: 'Apply',
			} )
		).toBeVisible();
	} );
} );

test.describe( `${ blockData.name } Block - with PHP classic template`, () => {
	test.beforeEach( async ( { admin, page, editor } ) => {
		await cli(
			'npm run wp-env run tests-cli -- wp option update wc_blocks_use_blockified_product_grid_block_as_template false'
		);

		await admin.visitSiteEditor( {
			postId: 'woocommerce/woocommerce//archive-product',
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await editor.canvas
			.locator(
				'.wp-block-woocommerce-classic-template__placeholder-image'
			)
			.waitFor();

		await editor.insertBlock( {
			name: 'woocommerce/filter-wrapper',
			attributes: {
				filterType: 'stock-filter',
				heading: 'Filter By Price',
			},
		} );
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
		async ( {
			admin,
			editorUtils,
			productCollectionPageObject,
			editor,
		} ) => {
			await admin.createNewPost();
			await productCollectionPageObject.insertProductCollection();
			await productCollectionPageObject.chooseCollectionInPost(
				'productCatalog'
			);
			await editor.insertBlock( {
				name: 'woocommerce/filter-wrapper',
				attributes: {
					filterType: 'stock-filter',
					heading: 'Filter By Stock',
				},
			} );
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

		await expect( page ).toHaveURL(
			new RegExp( blockData.urlSearchParamWhenFilterIsApplied )
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
		await editor.insertBlock( {
			name: 'woocommerce/filter-wrapper',
			attributes: {
				filterType: 'stock-filter',
				heading: 'Filter By Price',
			},
		} );
		const stockFilterControls = await editorUtils.getBlockByName(
			blockData.slug
		);
		await editor.selectBlocks( stockFilterControls );
		await editor.openDocumentSettingsSidebar();
		await page.getByText( "Show 'Apply filters' button" ).click();
		await editorUtils.publishAndVisitPost();

		await page.getByText( 'Out of Stock' ).click();
		await page.getByRole( 'button', { name: 'Apply' } ).click();

		await expect( page ).toHaveURL(
			new RegExp( blockData.urlSearchParamWhenFilterIsApplied )
		);

		const products = page
			.locator( '.wp-block-woocommerce-product-template' )
			.getByRole( 'listitem' );

		await expect( products ).toHaveCount( 1 );
	} );
} );
