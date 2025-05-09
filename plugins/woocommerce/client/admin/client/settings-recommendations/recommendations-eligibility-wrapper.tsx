/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useUser, optionsStore } from '@woocommerce/data';

const SHOW_MARKETPLACE_SUGGESTION_OPTION =
	'woocommerce_show_marketplace_suggestions';

const RecommendationsEligibilityWrapper = ( {
	children,
}: {
	children: React.ReactNode;
} ) => {
	const { currentUserCan } = useUser();

	const isMarketplaceSuggestionsEnabled = useSelect( ( select ) => {
		const { getOption, hasFinishedResolution } = select( optionsStore );

		const hasFinishedResolving = hasFinishedResolution( 'getOption', [
			SHOW_MARKETPLACE_SUGGESTION_OPTION,
		] );
		const canShowMarketplaceSuggestions =
			getOption( SHOW_MARKETPLACE_SUGGESTION_OPTION ) !== 'no';

		return hasFinishedResolving && canShowMarketplaceSuggestions;
	}, [] );

	if ( ! currentUserCan( 'install_plugins' ) ) {
		return null;
	}

	if ( ! isMarketplaceSuggestionsEnabled ) {
		return null;
	}

	return <>{ children }</>;
};

export default RecommendationsEligibilityWrapper;
