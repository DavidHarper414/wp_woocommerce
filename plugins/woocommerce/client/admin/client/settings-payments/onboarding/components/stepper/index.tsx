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
	// Filter and find the active step from children
	const activeStep = Children.toArray( children ).find( ( child ) => {
		if ( isValidElement( child ) ) {
			const element = child as ReactElement< StepProps >;
			return element.props.id === active;
		}
		return false;
	} );

	return (
		<div className="settings-payments-onboarding-modal__stepper">
			{ activeStep }
		</div>
	);
}
