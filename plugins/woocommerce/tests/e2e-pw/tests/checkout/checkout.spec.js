/**
 * External dependencies
 */
import { addAProductToCart } from '@woocommerce/e2e-utils-playwright';
import { faker } from '@faker-js/faker';

/**
 * Internal dependencies
 */
import { expect, tags, test as baseTest } from '../../fixtures/fixtures';
import { getFakeCustomer, getFakeProduct } from '../../utils/data';
import {
	createBlocksCheckoutPage,
	BLOCKS_CHECKOUT_PAGE,
} from '../../utils/pages';
import { logInFromMyAccount } from '../../utils/login';

//todo handle other countries and states than the default (US, CA) when filling the addresses

const checkoutPages = [
	{ name: 'classic checkout', slug: 'checkout' },
	BLOCKS_CHECKOUT_PAGE,
];

const test = baseTest.extend( {
	page: async ( { page, api }, use ) => {
		await createBlocksCheckoutPage( page.context().browser() );

		// get the current value of woocommerce_enable_checkout_login_reminder
		const loginAtCheckoutResponse = await api.get(
			'settings/account/woocommerce_enable_checkout_login_reminder'
		);

		// enable the setting if it is not already enabled
		const loginAtCheckoutInitialValue = loginAtCheckoutResponse.data.value;
		if ( loginAtCheckoutInitialValue !== 'yes' ) {
			await api.put(
				'settings/account/woocommerce_enable_checkout_login_reminder',
				{
					value: 'yes',
				}
			);
		}

		// get the current value of woocommerce_enable_checkout_login_reminder
		const signUpResponse = await api.get(
			'settings/account/woocommerce_enable_signup_and_login_from_checkout'
		);

		// enable the setting if it is not already enabled
		const signUpInitialValue = signUpResponse.data.value;
		if ( signUpInitialValue !== 'yes' ) {
			await api.put(
				'settings/account/woocommerce_enable_signup_and_login_from_checkout',
				{
					value: 'yes',
				}
			);
		}

		// Check id COD payment is enabled and enable it if it is not
		const codResponse = await api.get( 'payment_gateways/cod' );
		const codEnabled = codResponse.enabled;

		if ( ! codEnabled ) {
			await api.put( 'payment_gateways/cod', {
				enabled: true,
			} );
		}

		// Check id BACS payment is enabled and enable it if it is not
		const bacsResponse = await api.get( 'payment_gateways/bacs' );
		const bacsEnabled = bacsResponse.enabled;

		if ( ! bacsEnabled ) {
			await api.put( 'payment_gateways/bacs', {
				enabled: true,
			} );
		}

		await page.context().clearCookies();
		await use( page );

		// revert the settings to initial state
		if ( loginAtCheckoutInitialValue !== 'yes' ) {
			await api.put(
				'settings/account/woocommerce_enable_checkout_login_reminder',
				{
					value: loginAtCheckoutInitialValue,
				}
			);
		}

		if ( signUpInitialValue !== 'yes' ) {
			await api.put(
				'settings/account/woocommerce_enable_signup_and_login_from_checkout',
				{
					value: signUpInitialValue,
				}
			);
		}

		if ( ! codEnabled ) {
			await api.put( 'payment_gateways/cod', {
				enabled: codEnabled,
			} );
		}

		if ( ! bacsEnabled ) {
			await api.put( 'payment_gateways/bacs', {
				enabled: bacsEnabled,
			} );
		}
	},
	product: async ( { api }, use ) => {
		let product;

		// Using dec: 0 to avoid small rounding issues
		await api
			.post( 'products', getFakeProduct( { dec: 0 } ) )
			.then( ( response ) => {
				product = response.data;
			} );

		await use( product );

		await api.delete( `products/${ product.id }`, { force: true } );
	},
	tax: async ( { api }, use ) => {
		let tax;
		await api
			.post( 'taxes', {
				country: 'US',
				state: '*',
				cities: '*',
				postcodes: '*',
				rate: '25',
				name: 'US Tax',
				shipping: false,
			} )
			.then( ( r ) => {
				tax = r.data;
			} );

		await use( tax );

		await api.delete( `taxes/${ tax.id }`, {
			force: true,
		} );
	},
	customer: async ( { api }, use ) => {
		const customerData = getFakeCustomer();
		let customer;

		await api.post( 'customers', customerData ).then( ( response ) => {
			customer = response.data;
			customer.password = customerData.password;
		} );

		// add a shipping zone and method for the customer
		let shippingZoneId;
		await api
			.post( 'shipping/zones', {
				name: `Free Shipping ${ customerData.shipping.city }`,
			} )
			.then( ( response ) => {
				shippingZoneId = response.data.id;
			} );
		await api.put( `shipping/zones/${ shippingZoneId }/locations`, [
			{
				code: `${ customerData.shipping.country }:${ customerData.shipping.state }`,
				type: 'state',
			},
		] );
		await api.post( `shipping/zones/${ shippingZoneId }/methods`, {
			method_id: 'free_shipping',
		} );

		await use( customer );

		await api.delete( `customers/${ customer.id }`, { force: true } );
		await api.delete( `shipping/zones/${ shippingZoneId }`, {
			force: true,
		} );
	},
} );

async function checkOrderDetails( page, product, qty, tax ) {
	await expect( page.locator( 'td.product-name' ) ).toHaveText(
		`${ product.name } × ${ qty }`
	);

	const expectedTotalPrice = (
		parseFloat( product.price ) *
		qty *
		( 1 + parseFloat( tax.rate ) / 100 )
	).toLocaleString( 'en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	} );
	await expect( page.locator( 'tr.order-total > td' ) ).toContainText(
		expectedTotalPrice
	);
}

async function addProductToCartAndProceedToCheckout(
	pageSlug,
	page,
	product,
	qty,
	tax
) {
	await addAProductToCart( page, product.id, qty );
	await page.goto( pageSlug );
	await checkOrderDetails( page, product, qty, tax );
}

async function placeOrder( page ) {
	await page.getByRole( 'button', { name: 'Place order' } ).click();

	await expect(
		page.getByText( 'Your order has been received' )
	).toBeVisible();
}

async function fillBillingDetails( page, data, createAccount ) {
	await page
		.getByRole( 'textbox', { name: 'First name' } )
		.fill( data.first_name );
	await page
		.getByRole( 'textbox', { name: 'Last name' } )
		.fill( data.last_name );
	await page
		.getByRole( 'textbox', { name: 'Street address' } )
		.fill( data.address_1 );
	await page
		.getByRole( 'textbox', { name: 'Town / City' } )
		.fill( data.city );
	await page
		.getByRole( 'textbox', { name: 'ZIP Code' } )
		.fill( data.postcode );
	await page.getByRole( 'textbox', { name: 'Phone' } ).fill( data.phone );
	await page
		.getByRole( 'textbox', { name: 'Email address' } )
		.fill( data.email );

	if ( createAccount ) {
		await page.getByText( 'Create an account?' ).check();
	}
}

checkoutPages.forEach( ( { name, slug } ) => {
	test(
		`guest can checkout paying with cash on delivery on ${ name }`,
		{ tag: [ tags.PAYMENTS, tags.SERVICES, tags.HPOS ] },
		async ( { page, product, tax } ) => {
			await addProductToCartAndProceedToCheckout(
				slug,
				page,
				product,
				2,
				tax
			);
			const newCustomer = getFakeCustomer();
			await fillBillingDetails( page, newCustomer.billing, false );
			await page.getByText( 'Cash on delivery' ).click();
			await placeOrder( page );
			await page.goto( 'my-account/' );
			await expect( page.locator( '#username' ) ).toBeVisible();
		}
	);
} );

test(
	'guest can create an account at checkout',
	{ tag: [ tags.PAYMENTS, tags.SERVICES, tags.HPOS ] },
	async ( { page, product, tax } ) => {
		await addProductToCartAndProceedToCheckout(
			'checkout',
			page,
			product,
			2,
			tax
		);
		const newCustomer = getFakeCustomer();
		await fillBillingDetails( page, newCustomer.billing, true );
		await page.getByText( 'Direct bank transfer' ).click();
		await placeOrder( page );
		await page.goto( 'my-account/' );
		await expect(
			page
				.getByLabel( 'Account pages' )
				.getByRole( 'link', { name: 'Log out' } )
		).toBeVisible();
	}
);

test(
	'logged in customer can checkout with default billing address and direct bank transfer',
	{ tag: [ tags.PAYMENTS, tags.SERVICES, tags.HPOS ] },
	async ( { page, product, customer, tax } ) => {
		await page.goto( 'my-account/' );
		await logInFromMyAccount( page, customer.email, customer.password );
		await addProductToCartAndProceedToCheckout(
			'checkout',
			page,
			product,
			2,
			tax
		);
		await page.getByText( 'Direct bank transfer' ).click();
		await placeOrder( page );
	}
);

test(
	'customer can login at checkout and place the order with a different shipping address',
	{ tag: [ tags.PAYMENTS, tags.SERVICES, tags.HPOS ] },
	async ( { page, product, tax, customer } ) => {
		const qty = 3;
		await addProductToCartAndProceedToCheckout(
			'checkout',
			page,
			product,
			qty,
			tax
		);
		await page.getByText( 'Click here to login' ).click();
		await logInFromMyAccount(
			page,
			customer.email,
			customer.password,
			false
		);
		await checkOrderDetails( page, product, qty, tax );

		await page.getByText( 'Ship to a different address?' ).click();

		const shippingAddress = {
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			address_1: faker.location.streetAddress(),
			city: faker.location.city(),
			postcode: faker.location.zipCode( '#####' ),
		};

		await page
			.locator( '#shipping_first_name' )
			.fill( shippingAddress.first_name );
		await page
			.locator( '#shipping_last_name' )
			.fill( shippingAddress.last_name );
		await page
			.locator( '#shipping_address_1' )
			.fill( shippingAddress.address_1 );
		await page.locator( '#shipping_city' ).fill( shippingAddress.city );
		await page
			.locator( '#shipping_postcode' )
			.fill( shippingAddress.postcode );

		await page.getByText( 'Cash on delivery' ).click();
		await placeOrder( page );
	}
);

test(
	'existing customer can update the billing address and place the order with direct bank transfer',
	{ tag: [ tags.PAYMENTS, tags.SERVICES, tags.HPOS ] },
	async ( { page, product, tax, customer } ) => {
		await page.goto( 'my-account/' );
		await logInFromMyAccount(
			'checkout',
			page,
			customer.email,
			customer.password
		);
		await addProductToCartAndProceedToCheckout( page, product, 1, tax );

		const billingAddress = {
			address_1: faker.location.streetAddress(),
			city: faker.location.city(),
			postcode: faker.location.zipCode( '#####' ),
			phone: faker.phone.number(),
			email: faker.internet.email(),
		};

		await page
			.getByRole( 'textbox', { name: 'Street address' } )
			.fill( billingAddress.address_1 );
		await page
			.getByRole( 'textbox', { name: 'Town / City' } )
			.fill( billingAddress.city );
		await page
			.getByRole( 'textbox', { name: 'ZIP Code' } )
			.fill( billingAddress.postcode );
		await page
			.getByRole( 'textbox', { name: 'Phone' } )
			.fill( billingAddress.phone );
		await page
			.getByRole( 'textbox', { name: 'Email address' } )
			.fill( billingAddress.email );

		await page.getByText( 'Direct bank transfer' ).click();
		await placeOrder( page );
	}
);
