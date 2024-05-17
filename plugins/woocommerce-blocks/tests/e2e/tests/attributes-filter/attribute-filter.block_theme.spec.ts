/**
 * External dependencies
 */
import { test, expect } from '@woocommerce/e2e-playwright-utils';
import { cli } from '@woocommerce/e2e-utils';
import path from 'path';

const PRODUCT_CATALOG_LINK = '/shop';
const TEMPLATE_PATH = path.join(
	__dirname,
	'../shared/filters-with-product-collection.handlebars'
);

const blockData = {
	name: 'Filter by Attribute',
	slug: 'woocommerce/attribute-filter',
	urlSearchParamWhenFilterIsApplied: 'filter_size=small&query_type_size=or',
};

test.describe( `${ blockData.name } Block`, () => {
	test.beforeEach( async ( { admin, editor, editorUtils } ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'woocommerce/filter-wrapper',
			attributes: {
				filterType: 'attribute-filter',
				heading: 'Filter By Attribute',
			},
		} );
		const attributeFilter = await editorUtils.getBlockByName(
			blockData.slug
		);

		await attributeFilter.getByText( 'Size' ).click();
		await attributeFilter.getByText( 'Done' ).click();
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
		const attributeFilter = await editorUtils.getBlockByName(
			blockData.slug
		);
		await editor.selectBlocks( attributeFilter );

		await expect(
			page.getByRole( 'checkbox', { name: 'Small' } )
		).toBeVisible();

		await page.getByLabel( 'DropDown' ).click();

		await expect(
			attributeFilter.getByRole( 'checkbox', {
				name: 'Small',
			} )
		).toBeHidden();

		await expect(
			page.getByRole( 'checkbox', { name: 'Small' } )
		).toBeHidden();

		await expect( page.getByRole( 'combobox' ) ).toBeVisible();
	} );

	test( 'should allow toggling the visibility of the filter button', async ( {
		page,
		editorUtils,
		editor,
	} ) => {
		const attributeFilter = await editorUtils.getBlockByName(
			blockData.slug
		);
		await editor.selectBlocks( attributeFilter );

		await expect(
			attributeFilter.getByRole( 'button', {
				name: 'Apply',
			} )
		).toBeHidden();

		await page.getByText( "Show 'Apply filters' button" ).click();

		await expect(
			attributeFilter.getByRole( 'button', {
				name: 'Apply',
			} )
		).toBeVisible();
	} );
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

		await editorUtils.enterEditMode();
		await editor.insertBlock( {
			name: 'woocommerce/filter-wrapper',
			attributes: {
				filterType: 'attribute-filter',
				heading: 'Filter By Attribute',
			},
		} );
		const attributeFilter = await editorUtils.getBlockByName(
			blockData.slug
		);

		await attributeFilter.getByText( 'Size' ).click();
		await attributeFilter.getByText( 'Done' ).click();

		await editor.saveSiteEditorEntities();
		await page.goto( PRODUCT_CATALOG_LINK );
	} );

	test( 'should show all products', async ( { frontendUtils, page } ) => {
		const legacyTemplate = await frontendUtils.getBlockByName(
			'woocommerce/legacy-template'
		);

		const products = legacyTemplate
			.getByRole( 'list' )
			.locator( '.product' );

		await expect( products ).toHaveCount( 16 );

		await expect(
			page.getByRole( 'checkbox', { name: 'Small' } )
		).toBeVisible();

		await expect(
			page.getByRole( 'checkbox', { name: 'Medium' } )
		).toBeVisible();

		await expect(
			page.getByRole( 'checkbox', { name: 'Large' } )
		).toBeVisible();
	} );

	test( 'should show only products that match the filter', async ( {
		frontendUtils,
		page,
	} ) => {
		await page.getByRole( 'checkbox', { name: 'Small' } ).click();

		const legacyTemplate = await frontendUtils.getBlockByName(
			'woocommerce/legacy-template'
		);

		const products = legacyTemplate
			.getByRole( 'list' )
			.locator( '.product' );

		await expect( page ).toHaveURL(
			new RegExp( blockData.urlSearchParamWhenFilterIsApplied )
		);

		await expect( products ).toHaveCount( 1 );
	} );
} );

test.describe( `${ blockData.name } Block - with Product Collection`, () => {
	test.beforeEach( async ( { requestUtils } ) => {
		await requestUtils.updateTemplateContents(
			'woocommerce/woocommerce//archive-product',
			TEMPLATE_PATH,
			{}
		);
	} );

	test( 'should show all products', async ( { page } ) => {
		await page.goto( PRODUCT_CATALOG_LINK );
		const products = page
			.locator( '.wp-block-woocommerce-product-template' )
			.getByRole( 'listitem' );

		await expect( products ).toHaveCount( 16 );
	} );

	test( 'should show only products that match the filter', async ( {
		page,
	} ) => {
		await page.goto( PRODUCT_CATALOG_LINK );
		await page.getByRole( 'checkbox', { name: 'Small' } ).click();

		await expect( page ).toHaveURL(
			new RegExp( blockData.urlSearchParamWhenFilterIsApplied )
		);

		const products = page
			.locator( '.wp-block-woocommerce-product-template' )
			.getByRole( 'listitem' );

		await expect( products ).toHaveCount( 1 );
	} );

	test( 'should refresh the page only if the user clicks on button', async ( {
		page,
		admin,
		editor,
		editorUtils,
	} ) => {
		await admin.visitSiteEditor( {
			postId: 'woocommerce/woocommerce//archive-product',
			postType: 'wp_template',
		} );

		await editorUtils.enterEditMode();
		const attributeFilterControl = await editorUtils.getBlockByName(
			blockData.slug
		);
		await expect( attributeFilterControl ).toBeVisible();
		await editor.selectBlocks( attributeFilterControl );
		await editor.openDocumentSettingsSidebar();

		await page.getByText( "Show 'Apply filters' button" ).click();

		await editor.saveSiteEditorEntities();
		await page.goto( PRODUCT_CATALOG_LINK );

		await page.getByRole( 'checkbox', { name: 'Small' } ).click();
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
