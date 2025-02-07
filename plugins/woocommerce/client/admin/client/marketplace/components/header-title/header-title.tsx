/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

export default function HeaderTitle() {
	return (
		<div className="woocommerce-marketplace__header-title-container">
			<h1 className="woocommerce-marketplace__header-title">
				{ __( 'Official WooCommerce Marketplace', 'woocommerce' ) }
			</h1>
			<p className="woocommerce-marketplace__header-subtitle">
				{ __(
					'Everything you need to grow your store.',
					'woocommerce'
				) }
			</p>
		</div>
	);
}
