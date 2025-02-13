/**
 * External dependencies
 */
import { faker } from '@faker-js/faker';

/**
 * Internal dependencies
 */
import { ADMIN_STATE_PATH } from '../../playwright.config';
import { expect, test as baseTest } from '../../fixtures/fixtures';
import { admin } from '../../test-data/data';

async function expectEmail( page, receiverEmailAddress, subject ) {
	await page.goto(
		`wp-admin/tools.php?page=wpml_plugin_log&search[place]=receiver&search[term]=${ encodeURIComponent(
			receiverEmailAddress
		) }&orderby=timestamp&order=desc`
	);

	const row = page
		.getByRole( 'row' )
		.filter( {
			has: page.getByRole( 'cell', {
				name: receiverEmailAddress,
				exact: true,
			} ),
		} )
		.filter( {
			has: page.getByRole( 'cell', {
				name: subject,
				exact: true,
			} ),
		} );

	await expect( row ).toBeVisible();

	return row;
}

const test = baseTest.extend( {
	storageState: ADMIN_STATE_PATH,
	order: async ( { api }, use ) => {
		let order;

		await api
			.post( 'orders', {
				status: 'processing',
				billing: { email: faker.internet.exampleEmail() },
			} )
			.then( ( response ) => {
				order = response.data;
			} )
			.catch( ( error ) => {
				console.error( error );
			} );

		await use( order );

		await api.delete( `orders/${ order.id }`, { force: true } );
	},
} );

[
	{
		status: 'processing',
		role: 'customer',
		subject: 'Your .+ order has been received!',
		content: 'Thank you for your order',
	},
	{
		status: 'processing',
		role: 'admin',
		subject: 'New order #ORDER_ID',
		content: 'Congratulations on the sale',
	},
	{
		status: 'completed',
		role: 'customer',
		subject: 'Your .+ order is now complete',
		content: 'Thanks for shopping with us',
	},
	{
		status: 'cancelled',
		role: 'admin',
		subject: 'Order #ORDER_ID has been cancelled',
		content: 'Thanks for reading',
	},
].forEach( ( { role, status, subject, content } ) => {
	// eslint-disable-next-line playwright/expect-expect
	test( `${ role } receives email for ${ status } order`, async ( {
		page,
		api,
		order,
	} ) => {
		// Inject the order id into the expected subject and make it a regex
		subject = new RegExp( subject.replace( 'ORDER_ID', `${ order.id }` ) );

		await api
			.put( `orders/${ order.id }`, {
				status,
			} )
			.catch( ( error ) => {
				console.error( error );
			} );

		let orderStatus;
		await api.get( `orders/${ order.id }` ).then( ( response ) => {
			orderStatus = response.data.status;
		} );

		await expect( orderStatus ).toEqual( status );

		let emailRow;
		await test.step( 'check the email exists', async () => {
			emailRow = await expectEmail(
				page,
				role === 'customer' ? order.billing.email : admin.email,
				subject
			);
		} );

		await test.step( 'check the email content', async () => {
			await emailRow.getByRole( 'button', { name: 'View log' } ).click();

			const modalContent = page.locator(
				'#wp-mail-logging-modal-content-body-content'
			);

			await expect(
				modalContent.getByText(
					`Receiver ${
						role === 'customer' ? order.billing.email : admin.email
					}`
				)
			).toBeVisible();
			await expect( modalContent.getByText( subject ) ).toBeVisible();

			const emailContentFrame = modalContent
				.locator( 'iframe' )
				.contentFrame();

			await expect( emailContentFrame.locator( 'body' ) ).toContainText(
				content
			);
		} );
	} );
} );

// eslint-disable-next-line playwright/expect-expect
test( 'Merchant can resend order details to customer', async ( {
	order,
	page,
} ) => {
	await page.goto(
		`wp-admin/admin.php?page=wc-orders&action=edit&id=${ order.id }`
	);
	await page
		.locator( 'li#actions > select' )
		.selectOption( 'send_order_details' );
	await page.locator( 'button.wc-reload' ).click();

	await expectEmail(
		page,
		order.billing.email,
		new RegExp( `Details for order #${ order.id }` )
	);
} );
