/**
 * External dependencies
 */
import React, { createContext, useContext, useState } from 'react';

/**
 * Internal dependencies
 */
import { StepperProps } from '~/settings-payments/onboarding/types';
import Stepper from '../components/stepper';

interface UseContextValueParams {
	steps: Record< string, React.ReactElement >;
	initialStep?: string;
}
const useContextValue = ( {
	steps,
	initialStep,
}: UseContextValueParams ) => {
	const keys = Object.keys( steps );
	const [ currentStep, setCurrentStep ] = useState(
		initialStep ?? keys[ 0 ]
	);

	const progress = ( keys.indexOf( currentStep ) + 1 ) / keys.length;

	return {
		steps,
		currentStep,
		progress,
	};
};

type ContextValue = ReturnType< typeof useContextValue >;

const StepperContext = createContext< ContextValue | null >( null );

export const useOnboardingContext = (): ContextValue => {
	const context = useContext( StepperContext );
	if ( ! context ) {
		throw new Error( 'useOnboardingContext() must be used within <OnboardingContext>' );
	}
	return context;
};

const childrenToSteps = ( children: StepperProps[ 'children' ] ) => {
	let stepperChildren: React.ReactNode | undefined;

    React.Children.forEach( children, ( child ) => {
        if ( React.isValidElement( child ) && child.type === Stepper ) {
            stepperChildren = child.props.children; // Get the direct children of <Stepper>
        }
    });

    if ( ! stepperChildren ) return {}; // If no <Stepper> found, return empty object

	return stepperChildren.reduce(
		( acc: Record< string, Object >, child, index ) => {
			if ( React.isValidElement( child ) ) {
				acc[ child.props.name ?? index ] = {
					id: child.props.id,
					label: child.props.label,
					content: child,
				}
			}
			return acc;
		},
		{}
	);
};

export default function OnboardingContext( {
	children,
	...rest
}: StepperProps ): React.ReactNode {
	const steps = childrenToSteps( children );

	const value = useContextValue( {
		steps,
		...rest,
	} );

	return (
		<StepperContext.Provider value={ value }>
			{ children }
		</StepperContext.Provider>
	);
};
