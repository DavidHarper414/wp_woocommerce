/**
 * External dependencies
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { getHistory, getNewPath } from '@woocommerce/navigation';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import '../../style.scss';
import Modal from '../../components/modal';
import {
	StepContent,
	WooPaymentsModalProps,
} from '~/settings-payments/onboarding/types';

// Step components
const WelcomeStep = ( { onFinish }: { onFinish?: () => void } ) => {
	return (
		<div>
			Welcome Step Content
			<button onClick={ onFinish }>
				{ __( 'Continue to Jetpack Setup', 'woocommerce' ) }
			</button>
		</div>
	);
};
const JetpackStep = ( { onFinish }: { onFinish?: () => void } ) => {
	return (
		<div>
			Jetpack Step Content
			<button onClick={ onFinish }>
				{ __( 'Continue to Other Step', 'woocommerce' ) }
			</button>
		</div>
	);
};
const OtherStep = ( { onFinish }: { onFinish?: () => void } ) => {
	return (
		<div>
			Other Step Content
			<button onClick={ onFinish }>
				{ __( 'Finish', 'woocommerce' ) }
			</button>
		</div>
	);
};

// Define step configuration with labels and order
const WooPaymentsSteps = [
	{
		key: 'welcome',
		path: '/onboarding/welcome',
		label: __( 'Welcome', 'woocommerce' ),
		order: 1,
		content: WelcomeStep,
	},
	{
		key: 'jetpack',
		path: '/onboarding/jetpack',
		label: __( 'Connect Jetpack', 'woocommerce' ),
		order: 2,
		content: JetpackStep,
	},
	{
		key: 'other',
		path: '/onboarding/other',
		label: __( 'Final Step', 'woocommerce' ),
		order: 3,
		content: OtherStep,
	},
];

/**
 * Modal component for WooPayments onboarding
 */
export default function WooPaymentsModal( {
	isOpen,
	setIsOpen,
}: WooPaymentsModalProps ): React.ReactNode {
	const location = useLocation();
	const history = getHistory();

	// Open modal when on an onboarding route
	React.useEffect( () => {
		if ( location.pathname.startsWith( '/onboarding' ) && ! isOpen ) {
			setIsOpen( true );
		}
	}, [ location, isOpen, setIsOpen ] );

	// Handle modal close by navigating away from onboarding routes
	const handleClose = () => {
		const newPath = getNewPath( {}, '/wp-admin/admin.php', {
			page: 'wc-settings',
			tab: 'checkout',
		} );
		history.push( newPath );
		setIsOpen( false );
	};

	if ( ! isOpen ) return null;

	return (
		<Modal
			isOpen={ isOpen }
			setIsOpen={ handleClose }
			steps={ WooPaymentsSteps as StepContent[] }
			topLevelPath="/onboarding"
		/>
	);
}
