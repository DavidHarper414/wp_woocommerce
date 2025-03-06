/**
 * Internal dependencies
 */
import { setOption } from '../../utils/options';
import { activateTheme, getCurrentTheme } from '../../utils/themes';
import AcceptanceHelper from './helper';
const { test, request } = require( '@playwright/test' );
const { CUSTOMER_STATE_PATH } = require( '../../playwright.config' );

[ 'twentytwentyfour', 'storefront' ].forEach( ( theme ) => {
	test.describe( `Feature: Following Signup Prompts In Catalog Pages: ${ theme }`, () => {
		let helper;
		let originalTheme;

		test.beforeAll( async ( { baseURL } ) => {
			originalTheme = await getCurrentTheme( baseURL );
			await activateTheme( baseURL, theme );
		} );

		test.afterAll( async ( { baseURL } ) => {
			await activateTheme( baseURL, originalTheme );
		} );

		test.beforeEach( async ( { baseURL, page } ) => {
			await setOption(
				request,
				baseURL,
				'woocommerce_coming_soon',
				'no'
			);
			await setOption(
				request,
				baseURL,
				'wc_bis_account_required',
				'no'
			);
			await setOption( request, baseURL, 'wc_bis_opt_in_required', 'no' );
			await setOption(
				request,
				baseURL,
				'wc_bis_double_opt_in_required',
				'no'
			);
			helper = new AcceptanceHelper( baseURL, page );
		} );
		test.afterEach( async ( {} ) => {
			helper.deleteCurrentProduct();
		} );
		test.describe( 'Logged in', async () => {
			test.use( { storageState: CUSTOMER_STATE_PATH } );
			test( 'Logged in: Simple product', async () => {
				const { given, when, then } = helper;
				await given.signUpPromptsInCatalogAreEnabled();
				await given.aSimpleProductThatIsOutOfStock();
				await given.iAmOnTheCatalogPage();

				await given.iSeeAPromptToSignUpToBeNotifiedWhenTheProductIsBackInStock();

				await when.iFollowTheSignUpPromptLink();

				await then.iSeeANoticeWithFurtherInstructions();
				await then.iCompleteTheSignUpProcess();

				await when.iReloadThePage();
				await then.iSeeThatIAlreadyJoinedTheWaitlist();
			} );
			test( 'Logged in: Variable product', async () => {
				const { given, when, then } = helper;
				await given.signUpPromptsInCatalogAreEnabled();
				await given.aVariableProductWhoseVariationsAreAllOutOfStock();
				await given.iAmOnTheCatalogPage();

				await given.iSeeAPromptToSignUpToBeNotifiedWhenTheProductIsBackInStock();

				await when.iFollowTheSignUpPromptLink();

				await then.iSeeANoticeWithFurtherInstructions();
				await when.iChooseAVariationThatIsOutOfStock();
				await then.iCompleteTheSignUpProcess();

				await when.iReloadThePage();
				await then.iSeeThatIAlreadyJoinedTheWaitlist();
			} );
		} );
		test.describe( 'Guest', async () => {
			test( 'Guest: Simple product', async () => {
				const { given, when, then } = helper;
				await given.signUpPromptsInCatalogAreEnabled();
				await given.aSimpleProductThatIsOutOfStock();
				await given.iAmOnTheCatalogPage();

				await given.iSeeAPromptToSignUpToBeNotifiedWhenTheProductIsBackInStock();

				await when.iFollowTheSignUpPromptLink();
				await then.iSeeANoticeWithFurtherInstructions();
			} );
			test( 'Guest: Variable product', async () => {
				const { given, when, then } = helper;
				await given.signUpPromptsInCatalogAreEnabled();
				await given.aVariableProductWhoseVariationsAreAllOutOfStock();
				await given.iAmOnTheCatalogPage();

				await given.iSeeAPromptToSignUpToBeNotifiedWhenTheProductIsBackInStock();

				await when.iFollowTheSignUpPromptLink();

				await then.iSeeANoticeWithFurtherInstructions();
			} );
		} );
	} );
} );
