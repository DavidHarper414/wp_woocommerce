/**
 * External dependencies
 */
import React from 'react';
import {
	Card,
	CardBody,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	unstable_HistoryRouter as HistoryRouter,
	Route,
	Routes,
} from 'react-router-dom';
import { getHistory } from '@woocommerce/navigation';

/**
 * Internal dependencies
 */
import './modal.scss';
import { OnboardingSidebar } from './sidebar';

interface OnboardingModalProps {
	/**
	 * Indicates if the modal is currently open.
	 */
	isOpen: boolean;
	/**
	 * Callback function to handle modal closure.
	 */
	onClose: () => void;
}

export const OnboardingModal = ( {
	isOpen,
	onClose,
}: OnboardingModalProps ) => {
	return (
		<>
			{ isOpen && (
				<Modal
					title=""
					className="woocommerce-woopayments-onboarding-modal"
					onRequestClose={ onClose }
				>
					<div className="woocommerce-woopayments-onboarding-modal__wrapper">
						<OnboardingSidebar />
						<Card className={ 'woocommerce-woopayments-onboarding-modal__content' }>
							<HistoryRouter history={ getHistory() }>
								<Routes>
									<Route path="/" element={ <>Initial</> } />
									<Route
										path="/payment-methods"
										element={ <>Payment Methods</> }
									/>
								</Routes>
							</HistoryRouter>
						</Card>
					</div>
				</Modal>
			) }
		</>
	);
};
