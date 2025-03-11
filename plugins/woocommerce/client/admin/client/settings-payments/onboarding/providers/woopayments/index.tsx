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
import Stepper from '../../components/stepper';
import Step from '../../components/step';
import { WooPaymentsModalProps } from '~/settings-payments/onboarding/types';
import OnboardingContext from '~/settings-payments/onboarding/data';
import RecommendedMethods from './steps/recommended-methods';

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
			<OnboardingContext>
				<Sidebar />
				<Stepper>
					<Step
						id="recommended"
						label="Choose your payment methods"
						path="/onboarding/welcome"
					>
						<RecommendedMethods />
					</Step>
					<Step
						id="jetpack"
						label="Connect to WordPress.com"
						path="/onboarding/jetpack"
					>
						Test 2
					</Step>
				</Stepper>
			</OnboardingContext>
		</Modal>
	);
}
