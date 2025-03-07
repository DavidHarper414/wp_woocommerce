/**
 * External dependencies
 */
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { WC_ASSET_URL } from '~/utils/admin-settings';
import { SidebarItemProps } from '~/settings-payments/onboarding/types';

/**
 * Sidebar navigation item component
 */
export default function SidebarItem( {
	label,
	isCompleted,
	isActive,
}: SidebarItemProps ): React.ReactNode {
	return (
		<div
			className={
				clsx(
					'settings-payments-onboarding-modal__sidebar--list-item', 
					{
						'is-active': isActive,
						'is-completed': isCompleted,
					} 
				) 
			}
		>
			<span className="settings-payments-onboarding-modal__sidebar--list-item-icon">
				{ isCompleted ? (
					<img
						src={ WC_ASSET_URL + 'images/icons/complete.svg' }
						alt={ __( 'Published', 'woocommerce' ) }
					/>
				) : (
					<img
						src={ WC_ASSET_URL + 'images/icons/pending.svg' }
						alt={ __( 'Pending', 'woocommerce' ) }
					/>
				) }
			</span>
			<span className="settings-payments-onboarding-modal__sidebar--list-item-label">
				{ label }
			</span>
		</div>
	);
}
