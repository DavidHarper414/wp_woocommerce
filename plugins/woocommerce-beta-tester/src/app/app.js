/**
 * External dependencies
 */
import { TabPanel } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { getQueryArg, addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { default as Tools } from '../tools';
import { default as Options } from '../options';
import { default as Experiments } from '../experiments';
import { default as Features } from '../features';
import { default as RestAPIFilters } from '../rest-api-filters';
import RemoteInboxNotifications from '../remote-inbox-notifications';
import RemoteLogging from '../remote-logging';
import Payments from '../payments';

// Helper function to validate tab name
const isValidTab = ( tabName, availableTabs ) => {
	return availableTabs.some( ( tab ) => tab.name === tabName );
};

const tabs = applyFilters( 'woocommerce_admin_test_helper_tabs', [
	{
		name: 'options',
		title: 'Options',
		content: <Options />,
	},
	{
		name: 'tools',
		title: 'Tools',
		content: <Tools />,
	},
	{
		name: 'experiments',
		title: 'Experiments',
		content: <Experiments />,
	},
	{
		name: 'features',
		title: 'Features',
		content: <Features />,
	},
	{
		name: 'rest-api-filters',
		title: 'REST API FIlters',
		content: <RestAPIFilters />,
	},
	{
		name: 'remote-inbox-notifications',
		title: 'Remote Inbox Notifications',
		content: <RemoteInboxNotifications />,
	},
	{
		name: 'remote-logging',
		title: 'Remote Logging',
		content: <RemoteLogging />,
	},
	{
		name: 'woocommerce-payments',
		title: 'WCPay',
		content: <Payments />,
	},
] );

export function App() {
	// Get tab from URL or default to first tab
	const tabFromUrl = getQueryArg( window.location.search, 'tab' );
	const initialTab = isValidTab( tabFromUrl, tabs )
		? tabFromUrl
		: tabs[ 0 ].name;

	// Handle tab selection
	const handleTabSelect = ( tabName ) => {
		// Update URL with new tab
		const newUrl = addQueryArgs( window.location.href, { tab: tabName } );
		window.history.pushState( {}, '', newUrl );
	};

	return (
		<div className="wrap">
			<h1>WooCommerce Admin Test Helper</h1>
			<TabPanel
				className="woocommerce-admin-test-helper__main-tab-panel"
				activeClass="active-tab"
				tabs={ tabs }
				initialTabName={ initialTab }
				onSelect={ handleTabSelect }
			>
				{ ( tab ) => (
					<>
						{ tab.content }
						{ applyFilters(
							`woocommerce_admin_test_helper_tab_${ tab.name }`,
							[]
						) }
					</>
				) }
			</TabPanel>
		</div>
	);
}
