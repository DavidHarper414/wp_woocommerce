/**
 * External dependencies
 */
import { Modal } from '@wordpress/components';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { getHistory, getNewPath } from '@woocommerce/navigation';
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import '../../style.scss';
import Sidebar from '../../components/sidebar';
import Stepper from '../../components/stepper';
import Step from '../../components/step';
import {
	OnboardingModalProps,
	StepContent,
} from '~/settings-payments/onboarding/types';

/**
 * The inner content of the modal with its own routing
 */
function ModalContent( {
	steps,
}: {
	steps: StepContent[];
	topLevelPath: string;
} ) {
	const location = useLocation();
	const history = getHistory();

	// Get current step from pathname
	const getCurrentStep = (): string => {
		const path = location.pathname;
		// Find the step that matches the current path
		return (
			steps.find( ( s ) => path.endsWith( s.path ) )?.key ||
			steps[ 0 ].key
		);
	};

	const navigateToStep = ( step: string ) => {
		const stepPath = steps.find( ( s ) => s.key === step )?.path;
		if ( ! stepPath ) return;

		const newPath = getNewPath( { path: stepPath }, stepPath, {
			page: 'wc-settings',
			tab: 'checkout',
		} );
		history.push( newPath );
	};

	const sidebarSteps = steps
		.map( ( { key, label, order } ) => ( {
			key,
			label,
			isActive: key === getCurrentStep(),
			isCompleted:
				order <
				( steps.find( ( s ) => s.key === getCurrentStep() )?.order ||
					0 ),
		} ) )
		.sort(
			( a, b ) =>
				( steps.find( ( s ) => s.key === a.key )?.order || 0 ) -
				( steps.find( ( s ) => s.key === b.key )?.order || 0 )
		);

	return (
		<>
			<Sidebar steps={ sidebarSteps } />
			<div className="settings-payments-onboarding-modal__content">
				<Stepper active={ getCurrentStep() }>
					{ steps.map( ( { key, content, order } ) => {
						return (
							<Step
								id={ key }
								key={ key }
								onFinish={ () =>
									navigateToStep(
										steps.find(
											( s ) => s.order === order + 1
										)?.key as string
									)
								}
							>
								{ content }
							</Step>
						);
					} ) }
				</Stepper>
			</div>
		</>
	);
}

/**
 * Onboarding modal component
 */
export default function OnboardingModal( {
	isOpen,
	setIsOpen,
	steps,
	topLevelPath,
	children,
}: OnboardingModalProps ): React.ReactNode {
	const history = getHistory();

	// Force navigation to topLevelPath when modal opens
	useEffect( () => {
		if ( isOpen ) {
			const newPath = getNewPath(
				{ path: steps[ 0 ].path },
				steps[ 0 ].path,
				{
					page: 'wc-settings',
					tab: 'checkout',
				}
			);
			history.push( newPath );
		}
	}, [ isOpen, steps, history ] );

	return (
		<Modal
			className="settings-payments-onboarding-modal"
			__experimentalHideHeader={ true }
			onRequestClose={ () => setIsOpen( false ) }
			isFullScreen={ true }
			shouldCloseOnClickOutside={ false }
		>
			<div className="settings-payments-onboarding-modal__wrapper">
				<Routes>
					{ /* If no step is defined, redirect to first step */ }
					<Route
						path={ `${ topLevelPath }` }
						element={ <Navigate to={ steps[ 0 ].path } replace /> }
					/>
					{ /* Handle all onboarding routes */ }
					<Route
						path={ `${ topLevelPath }/*` }
						element={
							<ModalContent
								steps={ steps }
								topLevelPath={ topLevelPath }
							/>
						}
					/>
				</Routes>
				{ children }
			</div>
		</Modal>
	);
}
