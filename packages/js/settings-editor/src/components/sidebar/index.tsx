/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
/* eslint-disable @woocommerce/dependency-group */
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import * as IconPackage from '@wordpress/icons';
import {
	SidebarNavigationScreen,
	SidebarNavigationItem,
} from '@automattic/site-admin';
/* eslint-enable @woocommerce/dependency-group */

const { Icon, ...icons } = IconPackage;

const SidebarNavigationScreenContent = ( {
	activePage,
	pages,
}: {
	activePage: string;
	pages: SettingsPages;
} ) => {
	return (
		<ItemGroup>
			{ Object.keys( pages ).map( ( slug ) => {
				const { label, icon } = pages[ slug ];
				return (
					<SidebarNavigationItem
						icon={
							icons[ icon as keyof typeof icons ] ||
							icons.settings
						}
						aria-current={ activePage === slug }
						uid={ slug }
						key={ slug }
						to={ addQueryArgs( 'wc-settings', { tab: slug } ) }
					>
						{ label }
					</SidebarNavigationItem>
				);
			} ) }
		</ItemGroup>
	);
};

export const Sidebar = ( {
	activePage,
	pages,
	pageTitle,
}: {
	activePage: string;
	pages: SettingsPages;
	pageTitle: string;
} ) => {
	return (
		<SidebarNavigationScreen
			title={ pageTitle }
			isRoot
			content={
				<SidebarNavigationScreenContent
					activePage={ activePage }
					pages={ pages }
				/>
			}
		/>
	);
};
