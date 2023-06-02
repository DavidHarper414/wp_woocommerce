/**
 * External dependencies
 */
import { recordEvent } from '@woocommerce/tracks';

export const recordTracksFactory = < T = Record< string, string | number > >(
	feature: string,
	propertiesCallback: () => Record< string, string | number >
) => {
	return ( name: string, properties?: T ) =>
		recordEvent( `woo_ai_product_${ feature }_${ name }`, {
			...propertiesCallback(),
			...properties,
		} );
};
