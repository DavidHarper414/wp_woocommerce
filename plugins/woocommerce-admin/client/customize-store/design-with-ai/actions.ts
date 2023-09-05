/**
 * External dependencies
 */
import { assign } from 'xstate';

/**
 * Internal dependencies
 */
import {
	designWithAiStateMachineContext,
	designWithAiStateMachineEvents,
	completionAPIResponse,
} from './types';
import {
	businessInfoDescriptionCompleteEvent,
	lookAndFeelCompleteEvent,
	toneOfVoiceCompleteEvent,
} from './pages';

const assignBusinessInfoDescription = assign<
	designWithAiStateMachineContext,
	designWithAiStateMachineEvents
>( {
	businessInfoDescription: ( context, event: unknown ) => {
		return {
			descriptionText: ( event as businessInfoDescriptionCompleteEvent )
				.payload,
		};
	},
} );

const assignLookAndFeel = assign<
	designWithAiStateMachineContext,
	designWithAiStateMachineEvents
>( {
	lookAndFeel: ( context, event: unknown ) => {
		return {
			choice: ( event as lookAndFeelCompleteEvent ).payload,
		};
	},
} );

const assignToneOfVoice = assign<
	designWithAiStateMachineContext,
	designWithAiStateMachineEvents
>( {
	toneOfVoice: ( context, event: unknown ) => {
		return {
			choice: ( event as toneOfVoiceCompleteEvent ).payload,
		};
	},
} );

const assignLookAndTone = assign<
	designWithAiStateMachineContext,
	designWithAiStateMachineEvents
>( {
	lookAndFeel: ( context, event: unknown ) => {
		return {
			choice: ( event as { data: completionAPIResponse } ).data.look,
		};
	},
	toneOfVoice: ( context, event: unknown ) => {
		return {
			choice: ( event as { data: completionAPIResponse } ).data.tone,
		};
	},
} );

const logAIAPIRequestError = () => {
	// log AI API request error
	// eslint-disable-next-line no-console
	console.log( 'API Request error' );
};

export const actions = {
	assignBusinessInfoDescription,
	assignLookAndFeel,
	assignToneOfVoice,
	assignLookAndTone,
	logAIAPIRequestError,
};
