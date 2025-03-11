/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useOnboardingContext } from '~/settings-payments/onboarding/data';
import SidebarItem from './item';

/**
 * Sidebar component for the onboarding modal
 */
export default function OnboardingSidebar(): React.ReactNode {
	const { steps } = useOnboardingContext();

	return (
		<div className="settings-payments-onboarding-modal__sidebar">
			<div className="settings-payments-onboarding-modal__sidebar--header">
				<h2 className="settings-payments-onboarding-modal__sidebar--header-title">
					{ __( 'Set up WooPayments', 'woocommerce' ) }
				</h2>
				<div className="settings-payments-onboarding-modal__sidebar--header-steps">
					{ __( 'Step 3 of 5', 'woocommerce' ) }
				</div>
			</div>
			<div className="settings-payments-onboarding-modal__sidebar--list">
				{ Object.entries( steps ).map( ( [ key, step ] ) => (
					<SidebarItem
						key={ step.id }
						label={ step.label }
						isCompleted={ false }
						isActive={ false }
					/>
				) ) }
			</div>
		</div>
	);
}
