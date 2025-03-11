/**
 * External dependencies
 */
import React, { createContext, useContext, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getHistory, getNewPath } from '@woocommerce/navigation';

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
}: UseContextValueParams ) => {
	const keys = Object.keys( steps );
	const location = useLocation();
	const history = getHistory();

	// Get current step from pathname
	const getCurrentStep = (): number => {
		const path = location.pathname;
		// Find the step that matches the current path

		return Object.entries(steps).find(([key, step]) => step.path === path)?.[0];
	};

	const nextStep = () => {
		const index = getCurrentStep();
		const nextPath = steps[ Number( index ) + 1 ].path;

		const newPath = getNewPath( { path: nextPath }, nextPath, {
			page: 'wc-settings',
			tab: 'checkout',
		} );
		history.push( newPath );
	};

	return {
		steps,
		currentStep: getCurrentStep,
		nextStep,
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
				acc[ index ] = {
					id: child.props.id,
					label: child.props.label,
					path: child.props.path,
					isCompleted: false,
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
