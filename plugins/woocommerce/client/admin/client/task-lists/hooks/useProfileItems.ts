/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { ONBOARDING_STORE_NAME } from '@woocommerce/data';

export const useProfileItems = () => {
	const { profileItems } = useSelect( ( select ) => {
		const { getProfileItems } = select( ONBOARDING_STORE_NAME );
		return {
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
			profileItems: getProfileItems(),
		};
	}, [] );
	return profileItems;
};
