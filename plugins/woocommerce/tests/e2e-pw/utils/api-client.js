/**
 * External dependencies
 */
import { HTTPClientFactory } from '@woocommerce/api';

/**
 * Internal dependencies
 */
import { admin } from '../test-data/data';
import playwrightConfig from '../playwright.config';

export default function apiClient() {
	let baseURL = playwrightConfig.use.baseURL;
	if ( ! baseURL.endsWith( '/' ) ) {
		baseURL += '/';
	}
	return HTTPClientFactory.build( baseURL )
		.withBasicAuth( admin.username, admin.password )
		.withIndexPermalinks()
		.create();
}
