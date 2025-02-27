/**
 * External dependencies
 */
import { createSlotFill, ToggleControl } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import { SETTINGS_SLOT_FILL_CONSTANT } from '~/settings/settings-slots';

const { Fill } = createSlotFill( SETTINGS_SLOT_FILL_CONSTANT );

type EmailAutoSyncFillProps = {
	autoSync: boolean;
};

export const EmailAutoSyncFill: React.FC< EmailAutoSyncFillProps > = ( {
	autoSync,
} ) => {
	const [ isAutoSyncEnabled, setIsAutoSyncEnabled ] = useState( autoSync );

	const handleAutoSyncToggle = ( newValue: boolean ) => {
		setIsAutoSyncEnabled( newValue );
		const hiddenInput = document.getElementById(
			'woocommerce_email_auto_sync_with_theme'
		) as HTMLInputElement;
		if ( hiddenInput ) {
			hiddenInput.value = newValue ? 'yes' : 'no';
		}
	};

	return (
		<Fill>
			<div className="wc-settings-email-color-palette-auto-sync">
				<ToggleControl
					label={ __(
						'Auto-sync with theme changes',
						'woocommerce'
					) }
					checked={ isAutoSyncEnabled }
					onChange={ handleAutoSyncToggle }
				/>
			</div>
		</Fill>
	);
};

export const registerSettingsEmailAutoSyncFill = () => {
	const hiddenInput = document.getElementById(
		'woocommerce_email_auto_sync_with_theme'
	) as HTMLInputElement;
	const autoSync = hiddenInput?.value === 'yes';

	registerPlugin( 'woocommerce-admin-settings-email-auto-sync', {
		scope: 'woocommerce-email-auto-sync-settings',
		render: () => <EmailAutoSyncFill autoSync={ autoSync } />,
	} );
};
