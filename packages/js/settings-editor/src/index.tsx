/**
 * External dependencies
 */
import { createElement, useContext, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { SnackbarList } from '@wordpress/components';
import { store as noticesStore } from '@wordpress/notices';
import { RouterProvider } from '@automattic/site-admin';

/**
 * Internal dependencies
 */
import { Layout } from './layout';
import { useActiveRoute } from './route';
import { SettingsDataProvider, SettingsDataContext } from './data';
import { isGutenbergVersionAtLeast } from './utils';

const Notices = () => {
	const notices: { id: string; content: string }[] = useSelect(
		( select ) => {
			const { getNotices } = select( noticesStore );
			return getNotices();
		},
		[]
	);

	return <SnackbarList notices={ notices } onRemove={ () => {} } />;
};

const appendSettingsScripts = ( scripts: string[] ) => {
	return scripts.map( ( script ) => {
		const scriptElement = document.createElement( 'script' );
		scriptElement.src = script;
		scriptElement.onerror = () => {
			// eslint-disable-next-line no-console
			console.error( `Failed to load script: ${ script }` );
		};
		document.body.appendChild( scriptElement );
		return scriptElement;
	} );
};

const removeSettingsScripts = ( scripts: HTMLScriptElement[] ) => {
	scripts.forEach( ( script ) => {
		document.body.removeChild( script );
	} );
};

const SettingsApp = () => {
	const { route, settingsPage, tabs, activeSection, activePage } =
		useActiveRoute();
	const { settingsScripts } = useContext( SettingsDataContext );

	useEffect( () => {
		if ( ! activePage ) {
			return;
		}

		const scripts = Array.from(
			new Set( [
				...( settingsScripts._default || [] ),
				...( settingsScripts[ activePage ] || [] ),
			] )
		);

		const scriptsElements = appendSettingsScripts( scripts );

		return () => {
			removeSettingsScripts( scriptsElements );
		};
	}, [ activePage, activeSection ] );

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
		<RouterProvider routes={ [] } pathArg="page">
			<SettingsDataProvider>
				<SettingsApp />
				<Notices />
			</SettingsDataProvider>
		</RouterProvider>
	);
};

export * from './components';
export * from './legacy';
export * from './route';
