/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../../style.scss';
import Sidebar from '../../components/sidebar';
import Modal from '../../components/modal';
import RecommendedMethods from './steps/recommended-methods';
import { WooPaymentsModalProps } from '~/settings-payments/onboarding/types';

/**
 * Modal component for WooPayments onboarding
 */
export default function WooPaymentsModal( {
	isOpen,
	setIsOpen,
}: WooPaymentsModalProps ): React.ReactNode {
	if ( ! isOpen ) return null;

	return (
		<Modal
			isOpen={ isOpen }
			setIsOpen={ setIsOpen }
		>
			<Sidebar steps={ [] } />
			<div className="settings-payments-onboarding-modal__content">
				<RecommendedMethods />
			</div>
		</Modal>
	);
}
