/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SidebarItem from './SidebarItem';

/**
 * Props for the OnboardingSidebar component
 */
interface OnboardingSidebarProps {
	steps: {
		key: string;
		label: string;
		isCompleted?: boolean;
		isActive?: boolean;
		content?: React.ReactNode;
	}[];
}

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
		<div className="payment_onboarding_modal__sidebar">
			<div className="payment_onboarding_modal__sidebar_header">
				<h2 className="payment_onboarding_modal__sidebar_title">
					{ __( 'Set up WooPayments', 'woocommerce' ) }
				</h2>
				<div className="payment_onboarding_modal__sidebar_steps_badge">
					{ __( 'Step 3 of 5', 'woocommerce' ) }
				</div>
			</div>
			<div className="payment_onboarding_modal__sidebar_navigation">
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
