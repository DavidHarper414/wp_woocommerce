/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import RecommendedMethods from './recommended-methods';

/**
 * Steps for WooPayments onboarding
 */
export default [
	{
		key: 'welcome',
		label: __( 'Choose your payment methods', 'woocommerce' ),
		isCompleted: true,
	},
	{
		key: 'connect',
		label: __( 'Connect to WordPress.com', 'woocommerce' ),
		isCompleted: true,
	},
	{
		key: 'ready',
		label: __( 'Ready to test payments', 'woocommerce' ),
		component: RecommendedMethods,
	},
	{
		key: 'activate',
		label: __( 'Activate payments', 'woocommerce' ),
	},
	{
		key: 'verify',
		label: __( 'Submit for verification', 'woocommerce' ),
	},
];
