/**
 * External dependencies
 */
import { createRoot } from '@wordpress/element';
import { SettingsEditor } from '@woocommerce/settings-editor';

/**
 * Internal dependencies
 */
import { possiblyRenderSettingsSlots } from './settings-slots';
import { registerTaxSettingsConflictErrorFill } from './conflict-error-slotfill';
import { registerPaymentsSettingsBannerFill } from '../payments/payments-settings-banner-slotfill';
import { registerSiteVisibilitySlotFill } from '../launch-your-store';
import './settings.scss';

const node = document.getElementById( 'wc-settings-page' );

registerTaxSettingsConflictErrorFill();
registerPaymentsSettingsBannerFill();
registerSiteVisibilitySlotFill();

createRoot( node ).render(
	<SettingsEditor renderSlots={ possiblyRenderSettingsSlots } />
);
