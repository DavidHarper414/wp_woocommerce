/**
 * External dependencies
 */
import { WooFooterItem } from '@woocommerce/admin-layout';
import { __ } from '@wordpress/i18n';
import { check, commentContent, shield } from '@wordpress/icons';
import { createInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './footer.scss';
import IconWithText from '../icon-with-text/icon-with-text';
import WooIcon from '../../assets/images/woo-icon.svg';
import { MARKETPLACE_URL } from '../constants';

const refundPolicyTitle = createInterpolateElement(
	__( '30 day <a>money back guarantee</a>', 'woocommerce' ),
	{
		// eslint-disable-next-line jsx-a11y/anchor-has-content
		a: <a href={ MARKETPLACE_URL + '/refund-policy/' } />,
	}
);

const supportTitle = createInterpolateElement(
	__( '<a>Get help</a> when you need it', 'woocommerce' ),
	{
		// eslint-disable-next-line jsx-a11y/anchor-has-content
		a: <a href={ MARKETPLACE_URL + '/docs/' } />,
	}
);

const paymentTitle = createInterpolateElement(
	__( '<a>Products</a> you can trust', 'woocommerce' ),
	{
		// eslint-disable-next-line jsx-a11y/anchor-has-content
		a: <a href={ MARKETPLACE_URL + '/products/' } />,
	}
);

function FooterContent(): JSX.Element {
	return (
		<div className="woocommerce-marketplace__footer">
			<h2 className="woocommerce-marketplace__footer-title">
				{ __(
					'Hundreds of vetted products and services. Unlimited potential.',
					'woocommerce'
				) }
			</h2>
			<div className="woocommerce-marketplace__footer-columns">
				<IconWithText
					icon={ check }
					title={ refundPolicyTitle }
					description={ __(
						"If you change your mind within 30 days of your purchase, we'll give you a full refund — hassle-free.",
						'woocommerce'
					) }
				/>
				<IconWithText
					icon={ commentContent }
					title={ supportTitle }
					description={ __(
						'With detailed documentation and a global support team, help is always available if you need it.',
						'woocommerce'
					) }
				/>
				<IconWithText
					icon={ shield }
					title={ paymentTitle }
					description={ __(
						'Everything in the Marketplace has been built by our own team or by our trusted partners, so you can be sure of its quality.',
						'woocommerce'
					) }
				/>
			</div>
			<div className="woocommerce-marketplace__footer-logo">
				<img src={ WooIcon } alt="Woo Logo" aria-hidden="true" />
				<span>{ __( 'Woo Marketplace', 'woocommerce' ) }</span>
			</div>
		</div>
	);
}

export default function Footer(): JSX.Element {
	return (
		<WooFooterItem>
			<FooterContent />
		</WooFooterItem>
	);
}
