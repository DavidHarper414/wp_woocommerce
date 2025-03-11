/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { useOnboardingContext } from '~/settings-payments/onboarding/data';

/**
 * Stepper component that renders only the active step from its children
 */
export default function Stepper( { children } ): React.ReactNode {
	const { steps, currentStep } = useOnboardingContext();

	const CurrentStep = steps[ currentStep ].content;

	// Only render the active step
	return (
		<div className="settings-payments-onboarding-modal__stepper">
			{ CurrentStep }
		</div>
	);
}