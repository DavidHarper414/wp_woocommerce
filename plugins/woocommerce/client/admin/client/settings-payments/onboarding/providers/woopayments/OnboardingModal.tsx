/**
 * External dependencies
 */
import { Modal } from '@wordpress/components';
import React from 'react';

/**
 * Internal dependencies
 */
import '../../style.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import steps from './steps';

/**
 * Props for the WooPaymentsModal component
 */
interface WooPaymentsModalProps {
	isOpen: boolean;
	setIsOpen: ( isOpen: boolean ) => void;
	currentStep?: number;
}

/**
 * Modal component for WooPayments onboarding
 */
export default function WooPaymentsModal( {
	isOpen,
	setIsOpen,
}: WooPaymentsModalProps ): React.ReactNode {
	if ( ! isOpen ) return null;

	// TODO: Use context to get the current step
	const currentStep = 2;

	const StepComponent = steps[ currentStep ]?.component;

	// Mark current step as active
	const stepsPrepared = steps.map( ( step, index ) => ( {
		...step,
		isActive: index === currentStep,
	} ) );

	return (
		<Modal
			className="payments_onboarding_modal"
			__experimentalHideHeader={ true }
			onRequestClose={ () => setIsOpen( false ) }
			isFullScreen={ true }
			shouldCloseOnClickOutside={ false }
		>
			<div className="payments_onboarding_modal__wrapper">
				<Sidebar steps={ stepsPrepared } />
				<div className="payments_onboarding_modal__main_content">
					{ StepComponent && (
						<div>
							{ React.createElement( StepComponent, {
								setIsOpen,
							} ) }
						</div>
					) }
				</div>
			</div>
		</Modal>
	);
}
