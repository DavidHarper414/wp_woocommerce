/**
 * External dependencies
 */
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { OnboardingModalProps } from '~/settings-payments/onboarding/types';

/**
 * Onboarding modal component
 */
export default function OnboardingModal( {
	isOpen,
	setIsOpen,
	children,
}: OnboardingModalProps ): React.ReactNode {
	return (
		<Modal
			className="settings-payments-onboarding-modal"
			__experimentalHideHeader={ true }
			onRequestClose={ () => setIsOpen( false ) }
			isFullScreen={ true }
			shouldCloseOnClickOutside={ false }
		>
			<div className="settings-payments-onboarding-modal__wrapper">
				{ children }
			</div>
		</Modal>
	);
}
