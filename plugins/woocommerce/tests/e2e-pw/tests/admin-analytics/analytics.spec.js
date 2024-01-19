const { test, expect } = require( '@playwright/test' );
const { getTranslationFor } = require('../../utils/translations');

test.describe( 'Analytics pages', () => {
	test.use( { storageState: process.env.ADMINSTATE } );

	const aPages = [
		'Overview',
		'Products',
		'Revenue',
		'Orders',
		'Variations',
		'Categories',
		'Coupons',
		'Taxes',
		'Downloads',
		'Stock',
		'Settings',
	];
	for ( const [index,value] of aPages.entries() ) {
		test( `A user can view the ${ value } page without it crashing`, async ( {
			page,
		} ) => {
			const urlTitle = value.toLowerCase();
			await page.goto(
				`/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2F${ urlTitle }`
			);
			const pageTitle = page.locator(
				'.woocommerce-layout__header-wrapper > h1'
			);
			await expect( pageTitle ).toContainText( getTranslationFor( value ) );
			await expect(
				page.locator( '#woocommerce-layout__primary' )
			).toBeVisible();
		} );
	}
} );