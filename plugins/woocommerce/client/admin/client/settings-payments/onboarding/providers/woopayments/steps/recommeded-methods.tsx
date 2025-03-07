/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { WC_ASSET_URL } from '~/utils/admin-settings';

/**
 * RecommendedMethods component for WooPayments onboarding
 */
export default function RecommendedMethods(): React.ReactNode {
	return (
		<div>
			<div className="woopayments_modal_step__header">
				<img
					src={ `${ WC_ASSET_URL }images/woo-logo.svg` }
					alt="Woo Logo"
					className="woopayments_modal_step__header__logo"
				/>
				<Button
					className="woopayments-close-button"
					onClick={ () => {} }
				>
					<Icon icon={ close } />
				</Button>
			</div>
			<div className="woopayments-welcome-step">
				<h1 className="welcome-title">
					{ __( 'Get paid with WooPayments', 'woocommerce' ) }
				</h1>
				<p className="welcome-description">
					{ __(
						'Accept credit cards and other popular payment methods simply and securely.',
						'woocommerce'
					) }
				</p>
				<div className="features-grid">
					<div className="feature-item">
						<span className="feature-icon">✓</span>
						<span className="feature-text">
							{ __(
								'Built and supported by WooCommerce',
								'woocommerce'
							) }
						</span>
					</div>
					<div className="feature-item">
						<span className="feature-icon">✓</span>
						<span className="feature-text">
							{ __( 'Pay as you go pricing', 'woocommerce' ) }
						</span>
					</div>
					<div className="feature-item">
						<span className="feature-icon">✓</span>
						<span className="feature-text">
							{ __(
								'Manage payments, refunds, and deposits in your dashboard',
								'woocommerce'
							) }
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
