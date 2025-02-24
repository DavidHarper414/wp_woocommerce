/**
 * External dependencies
 */
import { createRoot } from '@wordpress/element';
import {
	withCurrentUserHydration,
	withSettingsHydration,
} from '@woocommerce/data';

/**
 * Internal dependencies
 */
import './stylesheets/_app.scss';
import { renderCustomerEffortScore } from './shared';
import { getAdminSetting } from '~/utils/admin-settings';
import { AppLayout } from './layout/app';
import './xstate.js';
import { deriveWpAdminBackgroundColours } from './utils/derive-wp-admin-background-colours';

import { ErrorBoundary } from './error-boundary';

const appRoot = document.getElementById( 'root' );

if ( appRoot ) {
	deriveWpAdminBackgroundColours();

	const settingsGroup = 'wc_admin';
	let HydratedPageLayout = withSettingsHydration(
		settingsGroup,
		window.wcSettings.admin
	)( AppLayout );

	const preloadSettings = window.wcSettings.admin
		? window.wcSettings.admin.preloadSettings
		: false;
	const hydrateSettings = preloadSettings && preloadSettings.general;

	if ( hydrateSettings ) {
		HydratedPageLayout = withSettingsHydration( 'general', {
			general: preloadSettings.general,
		} )( HydratedPageLayout );
	}

	const hydrateUser = getAdminSetting( 'currentUserData' );

	if ( hydrateUser ) {
		HydratedPageLayout =
			withCurrentUserHydration( hydrateUser )( HydratedPageLayout );
	}

	createRoot( appRoot ).render(
		<ErrorBoundary>
			<HydratedPageLayout />
		</ErrorBoundary>
	);

	renderCustomerEffortScore( appRoot );
}
