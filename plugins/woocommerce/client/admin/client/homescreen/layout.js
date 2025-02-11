/**
 * External dependencies
 */
import {
	Suspense,
	lazy,
	useCallback,
	useLayoutEffect,
	useRef,
} from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
	useUserPreferences,
	NOTES_STORE_NAME,
	ONBOARDING_STORE_NAME,
	OPTIONS_STORE_NAME,
} from '@woocommerce/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ActivityHeader from '~/activity-panel/activity-header';
import Promotions from '~/marketplace/components/promotions/promotions';
import { ActivityPanel } from './activity-panel';
import { Column } from './column';
import InboxPanel from '../inbox-panel';
import StatsOverview from './stats-overview';
import { StoreManagementLinks } from '../store-management-links';
import { TasksPlaceholder, ProgressTitle } from '../task-lists';
import { MobileAppModal } from './mobile-app-modal';
import './style.scss';
import '../dashboard/style.scss';
import { getAdminSetting } from '~/utils/admin-settings';
import { WooHomescreenHeaderBanner } from './header-banner-slot';
import { WooHomescreenWCPayFeature } from './wcpay-feature-slot';
import {
	isTaskListVisible,
	isTaskListCompletedOrHidden,
} from '~/hooks/use-tasklists-state';

const TaskLists = lazy( () =>
	import( /* webpackChunkName: "tasks" */ '../task-lists' ).then(
		( module ) => ( {
			default: module.TaskLists,
		} )
	)
);

export const hasTwoColumnLayout = (
	userPrefLayout,
	defaultHomescreenLayout,
	isSetupTaskListCompleteOrHidden
) => {
	const hasTwoColumnContent =
		isSetupTaskListCompleteOrHidden || window.wcAdminFeatures.analytics;

	return (
		( userPrefLayout || defaultHomescreenLayout ) === 'two_columns' &&
		hasTwoColumnContent
	);
};

export const Layout = ( {
	defaultHomescreenLayout,
	query,
	hasTaskList,
	showingProgressHeader,
	isLoadingTaskLists,
} ) => {
	const userPrefs = useUserPreferences();

	const isSetupTaskListCompleteOrHidden =
		isTaskListCompletedOrHidden( 'setup' );
	const isTaskScreen =
		hasTaskList && Object.keys( query ).length > 0 && !! query.task;
	const isDashboardShown = ! isTaskScreen; // ?&task=<x> query param is used to show tasks instead of the homescreen
	const twoColumns = hasTwoColumnLayout(
		userPrefs.homepage_layout,
		defaultHomescreenLayout,
		isSetupTaskListCompleteOrHidden
	);

	const isWideViewport = useRef( true );
	const maybeToggleColumns = useCallback( () => {
		isWideViewport.current = window.innerWidth >= 782;
	}, [] );

	useLayoutEffect( () => {
		maybeToggleColumns();
		window.addEventListener( 'resize', maybeToggleColumns );

		return () => {
			window.removeEventListener( 'resize', maybeToggleColumns );
		};
	}, [ maybeToggleColumns ] );

	const shouldStickColumns = isWideViewport.current && twoColumns;
	const shouldShowMobileAppModal = query.mobileAppModal ?? false;

	const renderTaskList = () => {
		return (
			<Suspense fallback={ <TasksPlaceholder query={ query } /> }>
				{ isTaskListVisible( 'setup' ) && isDashboardShown && (
					<>
						<ProgressTitle taskListId="setup" />
					</>
				) }
				<TaskLists query={ query } />
			</Suspense>
		);
	};

	const renderColumns = () => {
		return (
			<>
				<Column shouldStick={ shouldStickColumns }>
					{ ! isLoadingTaskLists && ! showingProgressHeader && (
						<ActivityHeader
							className="your-store-today"
							title={ __( 'Your store today', 'woocommerce' ) }
							subtitle={ __(
								'To-dos, tips, and insights for your business',
								'woocommerce'
							) }
						/>
					) }
					{ isSetupTaskListCompleteOrHidden && (
						<WooHomescreenWCPayFeature />
					) }
					{ ! isTaskListVisible( 'setup' ) && <ActivityPanel /> }
					{ hasTaskList && renderTaskList() }
					<Promotions format="promo-card" />
					<InboxPanel />
				</Column>
				<Column shouldStick={ shouldStickColumns }>
					{ window.wcAdminFeatures.analytics && <StatsOverview /> }
					{ isSetupTaskListCompleteOrHidden && (
						<StoreManagementLinks />
					) }
				</Column>
			</>
		);
	};

	return (
		<>
			{ isDashboardShown && (
				<WooHomescreenHeaderBanner
					className={ clsx( 'woocommerce-homescreen', {
						'woocommerce-homescreen-column': ! twoColumns,
					} ) }
				/>
			) }
			<div
				className={ clsx( 'woocommerce-homescreen', {
					'two-columns': twoColumns,
				} ) }
			>
				{ isDashboardShown ? renderColumns() : renderTaskList() }
				{ shouldShowMobileAppModal && <MobileAppModal /> }
			</div>
		</>
	);
};

Layout.propTypes = {
	/**
	 * If the task list has been completed.
	 */
	taskListComplete: PropTypes.bool,
	/**
	 * If any task list is visible.
	 */
	hasTaskList: PropTypes.bool,
	/**
	 * Page query, used to determine the current task if any.
	 */
	query: PropTypes.object.isRequired,
	/**
	 * If the welcome modal should display
	 */
	shouldShowWelcomeModal: PropTypes.bool,
	/**
	 * If the welcome from Calypso modal should display.
	 */
	shouldShowWelcomeFromCalypsoModal: PropTypes.bool,
};

export default compose(
	withSelect( ( select ) => {
		const { isNotesRequesting } = select( NOTES_STORE_NAME );
		const { getOption } = select( OPTIONS_STORE_NAME );
		const defaultHomescreenLayout =
			getOption( 'woocommerce_default_homepage_layout' ) ||
			'single_column';

		const {
			getTaskLists,
			hasFinishedResolution: taskListFinishResolution,
		} = select( ONBOARDING_STORE_NAME );

		const visibleTaskListIds = getAdminSetting( 'visibleTaskListIds', [] );
		const hasTaskList = visibleTaskListIds.length > 0;

		// Only fetch task lists if there are any visible task lists to avoid unnecessary API calls
		let isLoadingTaskLists = false;
		let taskLists = [];
		if ( hasTaskList ) {
			isLoadingTaskLists = ! taskListFinishResolution( 'getTaskLists' );
			taskLists = getTaskLists();
		}

		return {
			defaultHomescreenLayout,
			isBatchUpdating: isNotesRequesting( 'batchUpdateNotes' ),
			isLoadingTaskLists,
			hasTaskList,
			showingProgressHeader: !! taskLists.find(
				( list ) => list.isVisible && list.displayProgressHeader
			),
		};
	} )
)( Layout );
