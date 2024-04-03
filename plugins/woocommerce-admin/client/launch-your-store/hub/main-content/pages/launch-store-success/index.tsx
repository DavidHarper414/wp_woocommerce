/**
 * External dependencies
 */
import classnames from 'classnames';
import { Spinner } from '@woocommerce/components';
import { resolveSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { MainContentComponentProps } from '../../xstate';
import { Congrats } from './Congrats';
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

	// Temporary spinner until data load is moved to loading screen or somewhere else.
	if ( ! props.context.congratsScreen.hasLoadedCongratsData ) {
		return (
			<div className="spinner-container">
				<Spinner></Spinner>
			</div>
		);
	}

	return (
		<div
			className={ classnames(
				'launch-store-success-page__container',
				props.className
			) }
		>
			<Congrats
				hasCompleteSurvey={
					props.context.congratsScreen.hasCompleteSurvey
				}
				isWooExpress={ false }
				goToHome={ goToHome }
				completeSurvey={ completeSurvey }
			></Congrats>
		</div>
	);
};
