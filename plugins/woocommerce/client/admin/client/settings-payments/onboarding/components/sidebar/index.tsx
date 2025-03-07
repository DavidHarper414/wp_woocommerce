/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { OnboardingSidebarProps } from '~/settings-payments/onboarding/types';
import SidebarItem from './item';

/**
 * Sidebar component for the onboarding modal
 */
export default function OnboardingSidebar( {
	steps,
}: OnboardingSidebarProps ): React.ReactNode {
	const sidebarItems = steps.map( ( step ) => ( {
		key: step.key,
		label: step.label,
		isCompleted: step.isCompleted,
		isActive: step.isActive,
	} ) );

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
				{ sidebarItems.map( ( item ) => (
					<SidebarItem
						key={ item.key }
						label={ item.label }
						isCompleted={ item.isCompleted }
						isActive={ item.isActive }
					/>
				) ) }
			</div>
		</div>
	);
}
