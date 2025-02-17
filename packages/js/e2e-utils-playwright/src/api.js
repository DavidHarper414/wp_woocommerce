/**
 * External dependencies
 */
import { HTTPClientFactory } from '@woocommerce/api';

export default function apiClient( url, username, password ) {
	return HTTPClientFactory.build( url )
		.withBasicAuth( username, password )
		.create();
}
