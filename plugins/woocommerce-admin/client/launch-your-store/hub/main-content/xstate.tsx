/**
 * External dependencies
 */
import { assign, fromCallback, setup } from 'xstate5';
import React from 'react';
import { getQuery } from '@woocommerce/navigation';

/**
 * Internal dependencies
 */
import { LoadingPage } from './pages/loading';
import { SitePreviewPage } from './pages/site-preview';
import type { LaunchYourStoreComponentProps } from '..';
import {
	createQueryParamsListener,
	updateQueryParams,
	redirectToWooHome,
} from '../common';
import {
	services as transitionalServices,
	events as transitionalEvents,
	actions as transitionalActions,
	LaunchYourStoreSuccess,
} from './pages/launch-store-success';

export type MainContentMachineContext = {
	transitionalScreen: {
		hasLoadedCompleteOption: boolean;
		hasCompleteSurvey: boolean;
	};
};

export type MainContentComponentProps = LaunchYourStoreComponentProps & {
	context: MainContentMachineContext;
};
export type MainContentMachineEvents =
	| { type: 'SHOW_LAUNCH_STORE_SUCCESS' }
	| { type: 'EXTERNAL_URL_UPDATE' }
	| { type: 'SHOW_LOADING' }
	| transitionalEvents;

const contentQueryParamListener = fromCallback( ( { sendBack } ) => {
	return createQueryParamsListener( 'content', sendBack );
} );
export const mainContentMachine = setup( {
	types: {} as {
		context: MainContentMachineContext;
		events: MainContentMachineEvents;
	},
	actions: {
		updateQueryParams: (
			_,
			params: { sidebar?: string; content?: string }
		) => {
			updateQueryParams( params );
		},
		redirectToWooHome,
	},
	guards: {
		hasContentLocation: (
			_,
			{ contentLocation }: { contentLocation: string }
		) => {
			const { content } = getQuery() as { content?: string };
			return !! content && content === contentLocation;
		},
	},
	actors: {
		contentQueryParamListener,
		fetchSurveyCompletedOption:
			transitionalServices.fetchSurveyCompletedOption,
	},
} ).createMachine( {
	id: 'mainContent',
	initial: 'navigate',
	context: {
		transitionalScreen: {
			hasLoadedCompleteOption: false,
			hasCompleteSurvey: false,
		},
	},
	states: {
		navigate: {
			always: [
				{
					guard: {
						type: 'hasContentLocation',
						params: { contentLocation: 'site-preview' },
					},
				},
				{
					guard: {
						type: 'hasContentLocation',
						params: { contentLocation: 'launch-store-success' },
					},
					target: 'launchStoreSuccess',
				},
				{
					target: '#sitePreview',
				},
			],
		},
		sitePreview: {
			id: 'sitePreview',
			meta: {
				component: SitePreviewPage,
			},
		},
		launchStoreSuccess: {
			id: 'launchStoreSuccess',
			invoke: {
				src: 'fetchSurveyCompletedOption',
				onDone: {
					actions: assign(
						transitionalActions.assignHasCompleteSurvey
					),
				},
			},
			entry: [
				{
					type: 'updateQueryParams',
					params: { content: 'launch-store-success' },
				},
			],
			meta: {
				component: LaunchYourStoreSuccess,
			},
			on: {
				COMPLETE_SURVEY: {
					actions: assign( transitionalActions.assignCompleteSurvey ),
				},
				GO_BACK_TO_HOME: {
					actions: 'redirectToWooHome',
				},
			},
		},
		loading: {
			id: 'loading',
			meta: {
				component: LoadingPage,
			},
		},
	},
	on: {
		EXTERNAL_URL_UPDATE: {
			target: '.navigate',
		},
		SHOW_LAUNCH_STORE_SUCCESS: {
			target: '#launchStoreSuccess',
		},
		SHOW_LOADING: {
			target: '#loading',
		},
	},
} );
export const MainContentContainer = ( {
	children,
}: {
	children: React.ReactNode;
} ) => {
	return (
		<div className="launch-your-store-layout__content">{ children }</div>
	);
};
