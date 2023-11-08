const { test, expect, request } = require( '@playwright/test' );
const { admin } = require( '../../test-data/data' );
const { getTranslationFor } = require('../../utils/translations');

const postTitle = `Post-${ new Date().getTime().toString() }`;

test.describe( 'Can create a new post', () => {
	test.use( { storageState: process.env.ADMINSTATE } );

	test.afterAll( async ( { baseURL } ) => {
		const base64auth = Buffer.from(
			`${ admin.username }:${ admin.password }`
		).toString( 'base64' );
		const wpApi = await request.newContext( {
			baseURL: `${ baseURL }/wp-json/wp/v2/`,
			extraHTTPHeaders: {
				Authorization: `Basic ${ base64auth }`,
			},
		} );

		let response = await wpApi.get( `posts` );
		const allPosts = await response.json();

		await allPosts.forEach( async ( post ) => {
			if ( post.title.rendered === postTitle ) {
				response = await wpApi.delete( `posts/${ post.id }`, {
					data: {
						force: true,
					},
				} );
//				expect( response.ok() ).toBeTruthy();
			}
		} );
	} );

	test( 'can create new post', async ( { page } ) => {
		await page.goto( 'wp-admin/post-new.php' );

		const welcomeModalVisible = await test.step(
			'Check if the Welcome modal appeared',
			async () => {
				return await page
					.getByRole( 'heading', {
						name: `${getTranslationFor('Welcome to the block editor')}`,
					} )
					.isVisible();
			}
		);

		if ( welcomeModalVisible ) {
			await test.step( 'Welcome modal appeared. Close it.', async () => {
				await page
					.getByRole( 'document' )
					.getByRole( 'button', { name: getTranslationFor('Close') } )
					.click();
			} );
		} else {
			await test.step( 'Welcome modal did not appear.', async () => {
				// do nothing.
			} );
		}

		await page
			.getByRole( 'textbox', { name: getTranslationFor('Add Title') } )
			.fill( postTitle );

		await page.getByRole( 'button', { name: getTranslationFor('Add default block') } ).click();

		await page
			.getByRole( 'document', {
				name:
				`${getTranslationFor('Empty block; start writing or type forward slash to choose a block')}`,
			} )
			.fill( 'Test Post' );

		await page
			.getByRole( 'button', { name: getTranslationFor('Publish'), exact: true } )
			.click();

		await page
			.getByRole( 'region', { name: getTranslationFor('Editor publish') } )
			.getByRole( 'button', { name: getTranslationFor('Publish'), exact: true } )
			.click();

		await expect(
			page.getByText( `${ postTitle } ${getTranslationFor('is now live.')}` )
		).toBeVisible();
	} );
} );
