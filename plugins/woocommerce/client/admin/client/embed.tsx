/**
 * Internal dependencies
 */
import './stylesheets/_embed.scss';
import { renderCustomerEffortScore } from './shared';
import { getAdminSetting } from '~/utils/admin-settings';
import { renderEmbeddedLayout } from './embedded-body-layout';

const embeddedRoot = document.getElementById( 'woocommerce-embedded-root' );

if ( embeddedRoot ) {
	const settingsGroup = 'wc_admin';
	const hydrateUser = getAdminSetting( 'currentUserData' );

	renderEmbeddedLayout( embeddedRoot, hydrateUser, settingsGroup );
	renderCustomerEffortScore( embeddedRoot );
}
