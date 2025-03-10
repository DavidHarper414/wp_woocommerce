/**
 * External dependencies
 */
import { Children, isValidElement, ReactElement } from 'react';

/**
 * Internal dependencies
 */
import { StepperProps, StepProps } from '~/settings-payments/onboarding/types';

/**
 * Stepper component that renders only the active step from its children
 */
export default function Stepper( {
	active,
	children,
}: StepperProps ): React.ReactNode {
	// Convert children to array for easier manipulation
	const childrenArray = Children.toArray( children );

	// Find the active step component
	const activeStep = childrenArray.find( ( child ) => {
		if ( isValidElement( child ) ) {
			const element = child as ReactElement< StepProps >;
			return element.props.id === active;
		}
		return false;
	} );

	// Only render the active step
	return (
		<div className="settings-payments-onboarding-modal__stepper">
			{ activeStep }
		</div>
	);
}
