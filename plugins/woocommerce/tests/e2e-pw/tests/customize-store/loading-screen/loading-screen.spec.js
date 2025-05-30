const { test: base, expect, request } = require( '@playwright/test' );
const { AssemblerPage } = require( '../assembler/assembler.page' );
const { setOption } = require( '../../../utils/options' );
const { activateTheme } = require( '../../../utils/themes' );

const {
	createRequestsToSetupStoreDictionary,
	setupRequestInterceptor,
} = require( './loading-screen.utils' );
const { tags } = require( '../../../fixtures/fixtures' );
const { ADMIN_STATE_PATH } = require( '../../../playwright.config' );

const test = base.extend( {
	pageObject: async ( { page }, use ) => {
		const pageObject = new AssemblerPage( { page } );
		await use( pageObject );
	},
} );

const steps = [
	'Setting up the foundations',
	'Turning on the lights',
	'Opening the doors',
];

test.describe(
	'Assembler - Loading Page',
	{ tag: [ tags.GUTENBERG, tags.NOT_E2E ] },
	() => {
		test.use( { storageState: ADMIN_STATE_PATH } );

		test.beforeAll( async ( { baseURL } ) => {
			try {
				// In some environments the tour blocks clicking other elements.
				await setOption(
					request,
					baseURL,
					'woocommerce_customize_store_onboarding_tour_hidden',
					'yes'
				);
			} catch ( error ) {
				console.log( 'Store completed option not updated' );
			}
		} );

		test.afterAll( async ( { baseURL } ) => {
			try {
				// In some environments the tour blocks clicking other elements.
				await setOption(
					request,
					baseURL,
					'woocommerce_customize_store_onboarding_tour_hidden',
					'no'
				);
				await setOption(
					request,
					baseURL,
					'woocommerce_admin_customize_store_completed',
					'no'
				);

				await activateTheme( baseURL, 'twentynineteen' );
			} catch ( error ) {
				console.log( 'Store completed option not updated' );
			}
		} );

		test( 'should display loading screen and steps on first run', async ( {
			pageObject,
			baseURL,
			page,
		} ) => {
			await pageObject.setupSite( baseURL );

			const requestToSetupStore = createRequestsToSetupStoreDictionary();

			setupRequestInterceptor( page, requestToSetupStore );

			for ( const step of steps ) {
				await expect(
					page.locator( '.woocommerce-onboarding-loader' )
				).toBeVisible();
				await expect( page.getByText( step ) ).toBeVisible();
				await expect( page.getByAltText( step ) ).toBeVisible();
			}

			expect( Object.values( requestToSetupStore ) ).toEqual( [
				true,
				true,
				true,
			] );

			await pageObject.waitForLoadingScreenFinish();
		} );

		test( 'should redirect to intro page in case of errors', async ( {
			pageObject,
			baseURL,
			page,
		} ) => {
			await pageObject.setupSite( baseURL );

			const requestToSetupStore = createRequestsToSetupStoreDictionary();

			// Abort one of the requests to simulate an error.
			await page.route(
				requestToSetupStore[ Math.floor( Math.random() * 3 ) ],
				( route ) => route.abort()
			);

			setupRequestInterceptor( page, requestToSetupStore );

			await expect(
				page
					.locator( '#woocommerce-layout__primary' )
					.getByText(
						'Oops! We encountered a problem while setting up the foundations. Please try again or start with a theme.'
					)
			).toBeVisible();
		} );
	}
);
