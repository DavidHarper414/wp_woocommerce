/**
 * External dependencies
 */
import { useLayoutEffect, useRef, useCallback } from '@wordpress/element';
import clsx from 'clsx';
import { decodeEntities } from '@wordpress/html-entities';
import {
	WC_HEADER_SLOT_NAME,
	WC_HEADER_PAGE_TITLE_SLOT_NAME,
	WooHeaderNavigationItem,
	WooHeaderItem,
	WooHeaderPageTitle,
} from '@woocommerce/admin-layout';
import { Text, useSlot } from '@woocommerce/experimental';

/**
 * Internal dependencies
 */
import './style.scss';
import useIsScrolled from '../hooks/useIsScrolled';
import { TasksReminderBar } from '../task-lists/reminder-bar';
import { isTaskListActive } from '~/hooks/use-tasklists-state';

export const getPageTitle = ( sections: string[] ) => {
	let pageTitle;
	const pagesWithTabs = [
		'admin.php?page=wc-settings',
		'admin.php?page=wc-reports',
		'admin.php?page=wc-status',
	];

	if (
		sections.length > 2 &&
		Array.isArray( sections[ 1 ] ) &&
		pagesWithTabs.includes( sections[ 1 ][ 0 ] )
	) {
		pageTitle = sections[ 1 ][ 1 ];
	} else {
		pageTitle = sections[ sections.length - 1 ];
	}
	return pageTitle;
};

export const EmbedHeader = ( {
	sections,
	query,
}: {
	sections: string[];
	query: Record< string, string >;
} ) => {
	const isEmbedded = true;

	const headerElement = useRef< HTMLDivElement >( null );
	const { isScrolled } = useIsScrolled();
	const debounceTimer = useRef< NodeJS.Timeout | null >( null );
	const pageTitleSlot = useSlot( WC_HEADER_PAGE_TITLE_SLOT_NAME );
	const hasPageTitleFills = Boolean( pageTitleSlot?.fills?.length );
	const headerItemSlot = useSlot( WC_HEADER_SLOT_NAME );

	const updateBodyMargin = useCallback( () => {
		if ( debounceTimer.current ) {
			clearTimeout( debounceTimer.current );
		}

		debounceTimer.current = setTimeout( function () {
			const wpBody =
				document.querySelector< HTMLDivElement >( '#wpbody' );

			if ( ! wpBody || ! headerElement.current ) {
				return;
			}

			wpBody.style.marginTop = `${ headerElement.current.clientHeight }px`;
		}, 200 );
	}, [ headerElement ] );

	useLayoutEffect( () => {
		updateBodyMargin();
		window.addEventListener( 'resize', updateBodyMargin );
		return () => {
			window.removeEventListener( 'resize', updateBodyMargin );
			const wpBody =
				document.querySelector< HTMLDivElement >( '#wpbody' );

			if ( ! wpBody ) {
				return;
			}

			wpBody.style.marginTop = '';
		};
	}, [ headerItemSlot?.fills, updateBodyMargin ] );

	const isReactifyPaymentsSettingsScreen = Boolean(
		window.wcAdminFeatures?.[ 'reactify-classic-payments-settings' ] &&
			query?.page === 'wc-settings' &&
			query?.tab === 'checkout'
	);

	const showReminderBar = Boolean(
		isTaskListActive( 'setup' ) && ! isReactifyPaymentsSettingsScreen
	);

	return (
		<div
			className={ clsx( 'woocommerce-layout__header', {
				'is-scrolled': isScrolled,
			} ) }
			ref={ headerElement }
		>
			{ showReminderBar && (
				<TasksReminderBar
					updateBodyMargin={ updateBodyMargin }
					taskListId="setup"
				/>
			) }
			<div className="woocommerce-layout__header-wrapper">
				<WooHeaderNavigationItem.Slot
					fillProps={ { isEmbedded, query } }
				/>

				<Text
					className="woocommerce-layout__header-heading woocommerce-layout__header-left-align"
					as="h1"
				>
					{ decodeEntities(
						hasPageTitleFills ? (
							<WooHeaderPageTitle.Slot
								fillProps={ { isEmbedded, query } }
							/>
						) : (
							getPageTitle( sections )
						)
					) }
				</Text>

				<WooHeaderItem.Slot fillProps={ { isEmbedded, query } } />
			</div>
		</div>
	);
};
