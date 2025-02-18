/**
 * External dependencies
 */
import { createElement, createContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getAdminLink } from '@woocommerce/settings';
import { dispatch, useSelect } from '@wordpress/data';
import { SnackbarList } from '@wordpress/components';
import { store as noticesStore } from '@wordpress/notices';
/* eslint-disable @woocommerce/dependency-group */
// @ts-ignore No types for this exist yet.
import { privateApis as routerPrivateApis } from '@wordpress/router';
// @ts-ignore No types for this exist yet.
import { unlock } from '@wordpress/edit-site/build-module/lock-unlock';
// @ts-ignore No types for this exist yet.
import { store as editSiteStore } from '@wordpress/edit-site/build-module/store';
/* eslint-enable @woocommerce/dependency-group */

/**
 * Internal dependencies
 */
import { isGutenbergVersionAtLeast } from './utils';
import { Layout } from './layout';
import { useActiveRoute } from './route';

const { RouterProvider } = unlock( routerPrivateApis );

// Set the back button to go to the WooCommerce home page.
dispatch( editSiteStore ).updateSettings( {
	__experimentalDashboardLink: getAdminLink( 'admin.php?page=wc-admin' ),
} );

const initialData = window.wcSettings?.admin?.settingsData;
const SettingsDataContext = createContext< {
	settingsData: SettingsData;
	setSettingsData: ( settingsData: SettingsData ) => void;
} >( { settingsData: initialData, setSettingsData: () => {} } );

const SettingsDataProvider = ( {
	children,
}: {
	children: React.ReactNode;
} ) => {
	const [ settingsData, setSettingsData ] = useState( initialData );

	return (
		<SettingsDataContext.Provider
			value={ { settingsData, setSettingsData } }
		>
			{ children }
		</SettingsDataContext.Provider>
	);
};

const Notices = () => {
	const notices = useSelect( ( select ) => {
		const { getNotices } = select( noticesStore );
		return getNotices();
	}, [] );

	return <SnackbarList notices={ notices || [] } onRemove={ () => {} } />;
};

const SettingsApp = () => {
	const { route, settingsPage, tabs, activeSection } = useActiveRoute();

	return (
		<Layout
			route={ route }
			settingsPage={ settingsPage }
			tabs={ tabs }
			activeSection={ activeSection }
		/>
	);
};

export const SettingsEditor = () => {
	const isRequiredGutenbergVersion = isGutenbergVersionAtLeast( 19.0 );

	if ( ! isRequiredGutenbergVersion ) {
		return (
			//  Temporary during development.
			<div style={ { margin: 'auto' } }>
				{ __(
					'Please enable Gutenberg version 19.0 or higher for this feature',
					'woocommerce'
				) }
			</div>
		);
	}

	return (
		<SettingsDataProvider>
			<SettingsApp />
			<Notices />
		</SettingsDataProvider>
	);
};

export * from './components';
export * from './legacy';
export * from './route';
export { RouterProvider, SettingsDataContext };
