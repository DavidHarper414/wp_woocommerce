/**
 * External dependencies
 */
import classnames from 'classnames';
import { Spinner } from '@woocommerce/components';

/**
 * Internal dependencies
 */
import type { MainContentComponentProps } from '../../xstate';
import { Transitional } from './transitional';
export * as actions from './actions';
export * as services from './services';
export type events = { type: 'GO_BACK_TO_HOME' } | { type: 'COMPLETE_SURVEY' };

export const LaunchYourStoreSuccess = ( props: MainContentComponentProps ) => {
	const goToHome = () => {
		props.sendEventToMainContent( { type: 'GO_BACK_TO_HOME' } );
	};

	const completeSurvey = () => {
		props.sendEventToMainContent( { type: 'COMPLETE_SURVEY' } );
	};

	if ( ! props.context.transitionalScreen.hasLoadedCompleteOption ) {
		return <Spinner></Spinner>;
	}

	return (
		<div
			className={ classnames(
				'launch-store-success-page__container',
				props.className
			) }
		>
			<Transitional
				hasCompleteSurvey={
					props.context.transitionalScreen.hasCompleteSurvey
				}
				isWooExpress={ false }
				goToHome={ goToHome }
				completeSurvey={ completeSurvey }
			></Transitional>
		</div>
	);
};
