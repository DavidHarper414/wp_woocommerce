/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { onboardingStore, TaskListType } from '@woocommerce/data';

export const useActiveSetupTasklist = () => {
	const { activeSetuplist } = useSelect( ( select ) => {
		const taskLists: TaskListType[] =
			select( onboardingStore ).getTaskLists();

		const visibleSetupList = taskLists.filter(
			( list ) => list.id === 'setup' && list.isVisible
		);

		return {
			activeSetuplist: visibleSetupList.length
				? visibleSetupList[ 0 ].id
				: null,
		};
	}, [] );

	return activeSetuplist;
};
