/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

export const OnboardingSidebar = () => {
    return (
        <div className="woocommerce-woopayments-onboarding-modal__sidebar">
            <h2>{ __( 'Set up WooPayments', 'woocommerce' ) }</h2>

            <ul className="woocommerce-woopayments-onboarding-modal__sidebar--navigation">
                <li>
                    <a href="#">{ __( 'Choose your payment methods', 'woocommerce' ) }</a>
                </li>
                <li>
                    <a href="#">{ __( 'Connect to WordPress.com', 'woocommerce' ) }</a>
                </li>
                <li>
                    <a href="#">{ __( 'Ready to test payments', 'woocommerce' ) }</a>
                </li>
                <li>
                    <a href="#">{ __( 'Activate payments', 'woocommerce' ) }</a>
                </li>
                <li>
                    <a href="#">{ __( 'Submit for verification', 'woocommerce' ) }</a>
                </li>
            </ul>
        </div>
    );
};
