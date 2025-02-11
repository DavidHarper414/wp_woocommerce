/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import {
	ONBOARDING_STORE_NAME,
	getVisibleTasks,
	TaskListType,
} from '@woocommerce/data';
/**
 * Internal dependencies
 */
import { getAdminSetting } from '~/utils/admin-settings';

function getThingsToDoNextCount( extendedTaskList: TaskListType ) {
	if (
		! extendedTaskList ||
		! extendedTaskList.tasks.length ||
		extendedTaskList.isHidden
	) {
		return 0;
	}
	return extendedTaskList.tasks.filter(
		( task ) => task.canView && ! task.isComplete && ! task.isDismissed
	).length;
}

/**
 * Get default state values when task lists are not visible
 *
 * @return {Object} Default state values
 */
const getDefaultState = () => ( {
	requestingTaskListOptions: false,
	setupTaskListHidden: true,
	setupTaskListComplete: null,
	setupTasksCount: null,
	setupTasksCompleteCount: null,
	thingsToDoNextCount: null,
} );

// TODO: replace this with the actual selectors when @woocommerce/data types are updated.
type Selectors = {
	getTaskList: ( taskListId: string ) => TaskListType;
	hasFinishedResolution: ( action: string ) => boolean;
};

/**
 * Get setup task list related states
 *
 * @param {Object} selectors Store selectors
 * @return {Object} Setup task list states
 */
const getSetupTaskListState = ( selectors: Selectors ) => {
	const { getTaskList, hasFinishedResolution } = selectors;
	const setupList = getTaskList( 'setup' );
	const setupVisibleTasks = getVisibleTasks( setupList?.tasks || [] );

	return {
		setupTaskListHidden: setupList ? setupList.isHidden : true,
		setupTasksCount: setupVisibleTasks.length,
		setupTasksCompleteCount: setupVisibleTasks.filter(
			( task ) => task.isComplete
		).length,
		setupTaskListComplete: setupList?.isComplete,
		requestingTaskListOptions: ! hasFinishedResolution( 'getTaskLists' ),
	};
};

/**
 * Get extended task list states
 *
 * @param {Object} selectors Store selectors
 * @return {Object} Extended task list states
 */
const getExtendedTaskListState = ( selectors: Selectors ) => {
	const { getTaskList, hasFinishedResolution } = selectors;
	const extendedTaskList = getTaskList( 'extended' );

	return {
		thingsToDoNextCount: getThingsToDoNextCount( extendedTaskList ),
		requestingTaskListOptions: ! hasFinishedResolution( 'getTaskLists' ),
	};
};

/**
 * Hook to get task list states
 *
 * This will only return the state for the task list that is currently visible.
 *
 * @param {Object}  options                  The options object
 * @param {boolean} options.setupTasklist    Whether to include the setup task list in the state
 * @param {boolean} options.extendedTaskList Whether to include the extended task list in the state
 *
 * @return {Object} Task list related states
 */
export const useTaskListsState = (
	{ setupTasklist, extendedTaskList } = {
		setupTasklist: true,
		extendedTaskList: true,
	}
) => {
	const visibleTaskListIds = getAdminSetting( 'visibleTaskListIds', [] );
	const isSetupTaskListVisible =
		setupTasklist && visibleTaskListIds.includes( 'setup' );
	const isExtendedTaskListVisible =
		extendedTaskList && visibleTaskListIds.includes( 'extended' );

	return useSelect(
		( select ) => {
			// If no task lists are visible, return default state
			if ( ! isSetupTaskListVisible && ! isExtendedTaskListVisible ) {
				return getDefaultState();
			}

			const selectors = select( ONBOARDING_STORE_NAME );

			// If setup task list is not visible, return extended-only state
			if ( ! isSetupTaskListVisible ) {
				return {
					...getDefaultState(),
					...getExtendedTaskListState( selectors ),
				};
			}

			// If extended task list is not visible, return setup-only state
			if ( ! isExtendedTaskListVisible ) {
				return {
					...getDefaultState(),
					...getSetupTaskListState( selectors ),
				};
			}

			// Return full state with both setup and extended task lists
			return {
				...getDefaultState(),
				...getSetupTaskListState( selectors ),
				...getExtendedTaskListState( selectors ),
			};
		},
		[ isSetupTaskListVisible, isExtendedTaskListVisible ]
	);
};
