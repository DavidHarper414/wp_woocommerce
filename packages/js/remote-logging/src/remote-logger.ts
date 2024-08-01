/**
 * External dependencies
 */
import debugFactory from 'debug';
import { getSetting } from '@woocommerce/settings';
import TraceKit from 'tracekit';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { mergeLogData } from './utils';
import { LogData, ErrorData, RemoteLoggerConfig } from './types';

const debug = debugFactory( 'wc:remote-logging' );
const warnLog = ( message: string ) => {
	// eslint-disable-next-line no-console
	console.warn( 'RemoteLogger: ' + message );
};
const errorLog = ( message: string, ...args: unknown[] ) => {
	// eslint-disable-next-line no-console
	console.error( 'RemoteLogger: ' + message, ...args );
};

export const REMOTE_LOGGING_SHOULD_SEND_ERROR_FILTER =
	'woocommerce_remote_logging_should_send_error';
export const REMOTE_LOGGING_ERROR_DATA_FILTER =
	'woocommerce_remote_logging_error_data';

export const REMOTE_LOGGING_LOG_ENDPOINT_FILTER =
	'woocommerce_remote_logging_log_endpoint';
export const REMOTE_LOGGING_JS_ERROR_ENDPOINT_FILTER =
	'woocommerce_remote_logging_js_error_endpoint';

const REMOTE_LOGGING_LAST_ERROR_SENT_KEY =
	'wc_remote_logging_last_error_sent_time';

const DEFAULT_LOG_DATA: LogData = {
	message: '',
	feature: 'woocommerce_core',
	host: window.location.hostname,
	tags: [ 'woocommerce', 'js' ],
	properties: {
		wp_version: getSetting( 'wpVersion' ),
		wc_version: getSetting( 'wcVersion' ),
	},
};
export class RemoteLogger {
	private config: RemoteLoggerConfig;
	private lastErrorSentTime = 0;

	public constructor( config: RemoteLoggerConfig ) {
		this.config = config;
		this.lastErrorSentTime = parseInt(
			localStorage.getItem( REMOTE_LOGGING_LAST_ERROR_SENT_KEY ) || '0',
			10
		);
	}

	/**
	 * Logs a message to Logstash.
	 *
	 * @param severity  - The severity of the log.
	 * @param message   - The message to log.
	 * @param extraData - Optional additional data to include in the log.
	 */
	public async log(
		severity: Exclude< LogData[ 'severity' ], undefined >,
		message: string,
		extraData?: Partial< Exclude< LogData, 'message' | 'severity' > >
	) {
		if ( ! message ) {
			debug( 'Empty message' );
			return;
		}

		const logData: LogData = mergeLogData( DEFAULT_LOG_DATA, {
			message,
			severity,
			...extraData,
		} );

		await this.sendLog( logData );
	}

	/**
	 * Initializes error event listeners for catching unhandled errors and unhandled rejections.
	 */
	public initializeErrorHandlers(): void {
		window.addEventListener( 'error', ( event ) => {
			debug( 'Caught error event:', event );
			this.handleError( event.error ).catch( ( error ) => {
				debug( 'Failed to handle error:', error );
			} );
		} );

		window.addEventListener( 'unhandledrejection', async ( event ) => {
			debug( 'Caught unhandled rejection:', event );

			try {
				const error =
					typeof event.reason === 'string'
						? new Error( event.reason )
						: event.reason;
				await this.handleError( error );
			} catch ( error ) {
				debug( 'Failed to handle unhandled rejection:', error );
			}
		} );
	}

	/**
	 * Sends a log entry to the remote API.
	 *
	 * @param logData - The log data to be sent.
	 */
	private async sendLog( logData: LogData ): Promise< void > {
		const body = new window.FormData();
		body.append( 'params', JSON.stringify( logData ) );

		try {
			debug( 'Sending log to API:', logData );

			/**
			 * Filters the Log API endpoint URL.
			 *
			 * @param {string} endpoint The default Log API endpoint URL.
			 */
			const endpoint = applyFilters(
				REMOTE_LOGGING_LOG_ENDPOINT_FILTER,
				'https://public-api.wordpress.com/rest/v1.1/logstash'
			) as string;

			await window.fetch( endpoint, {
				method: 'POST',
				body,
			} );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to send log to API:', error );
		}
	}

	/**
	 * Handles an error and prepares it for sending to the remote API.
	 *
	 * @param error - The error to handle.
	 */
	private async handleError( error: Error ) {
		const currentTime = Date.now();

		if (
			currentTime - this.lastErrorSentTime <
			this.config.errorRateLimitMs
		) {
			debug( 'Rate limit reached. Skipping send error', error );
			return;
		}

		const trace = TraceKit.computeStackTrace( error );
		if ( ! this.shouldSendError( error, trace.stack ) ) {
			debug( 'Skipping error:', error );
			return;
		}

		const errorData: ErrorData = {
			...mergeLogData( DEFAULT_LOG_DATA, {
				message: error.message,
				severity: 'critical',
				tags: [ 'js-unhandled-error' ],
			} ),
			trace: this.getFormattedStackFrame( trace ),
		};
		/**
		 * This filter allows to modify the error data before sending it to the remote API.
		 *
		 * @filter woocommerce_remote_logging_error_data
		 * @param {ErrorData} errorData The error data to be sent.
		 */
		const filteredErrorData = applyFilters(
			REMOTE_LOGGING_ERROR_DATA_FILTER,
			errorData
		) as ErrorData;

		try {
			await this.sendError( filteredErrorData );
		} catch ( _error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to send error:', _error );
		}
	}

	/**
	 * Sends an error to the remote API.
	 *
	 * @param error - The error data to be sent.
	 */
	private async sendError( error: ErrorData ) {
		const body = new window.FormData();
		body.append( 'error', JSON.stringify( error ) );

		try {
			debug( 'Sending error to API:', error );

			/**
			 * Filters the JS error endpoint URL.
			 *
			 * @param {string} endpoint The default JS error endpoint URL.
			 */
			const endpoint = applyFilters(
				REMOTE_LOGGING_JS_ERROR_ENDPOINT_FILTER,
				'https://public-api.wordpress.com/rest/v1.1/js-error'
			) as string;

			await window.fetch( endpoint, {
				method: 'POST',
				body,
			} );
		} catch ( _error: unknown ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to send error to API:', _error );
		} finally {
			this.lastErrorSentTime = Date.now();
			localStorage.setItem(
				REMOTE_LOGGING_LAST_ERROR_SENT_KEY,
				this.lastErrorSentTime.toString()
			);
		}
	}

	/**
	 * Limits the stack trace to 10 frames and formats it.
	 *
	 * @param stackTrace - The stack trace to format.
	 * @return The formatted stack trace.
	 */
	private getFormattedStackFrame( stackTrace: TraceKit.StackTrace ) {
		const trace = stackTrace.stack
			.slice( 0, 10 )
			.map( this.getFormattedFrame )
			.join( '\n\n' );

		// Set hard limit of 8192 characters for the stack trace so it does not use too much user bandwith and also our computation.
		return trace.length > 8192 ? trace.substring( 0, 8192 ) : trace;
	}

	/**
	 * Formats a single stack frame.
	 *
	 * @param frame - The stack frame to format.
	 * @param index - The index of the frame in the stack.
	 * @return The formatted stack frame.
	 */
	private getFormattedFrame( frame: TraceKit.StackFrame, index: number ) {
		// Format the function name
		const funcName =
			frame.func !== '?' ? frame.func.replace( /"/g, '' ) : 'anonymous';

		// Format the URL
		const url = frame.url.replace( /"/g, '' );

		// Format the context. Limit to 256 characters.
		const context = frame.context
			? frame.context
					.map( ( line ) =>
						line.replace( /^"|"$/g, '' ).replace( /\\"/g, '"' )
					)
					.filter( ( line ) => line.trim() !== '' )
					.join( '\n    ' )
					.substring( 0, 256 )
			: '';

		// Construct the formatted string
		return (
			`#${ index + 1 } at ${ funcName } (${ url }:${ frame.line }:${
				frame.column
			})` + ( context ? `\n${ context }` : '' )
		);
	}

	/**
	 * Determines whether an error should be sent to the remote API.
	 *
	 * @param error       - The error to check.
	 * @param stackFrames - The stack frames of the error.
	 * @return Whether the error should be sent.
	 */
	private shouldSendError(
		error: Error,
		stackFrames: TraceKit.StackFrame[]
	) {
		const containsWooCommerceFrame = stackFrames.some(
			( frame ) =>
				frame.url && frame.url.includes( '/woocommerce/assets/' )
		);

		/**
		 * This filter allows to control whether an error should be sent to the remote API.
		 *
		 * @filter woocommerce_remote_logging_should_send_error
		 * @param {boolean}               shouldSendError Whether the error should be sent.
		 * @param {Error}                 error           The error object.
		 * @param {TraceKit.StackFrame[]} stackFrames     The stack frames of the error.
		 *
		 */
		return applyFilters(
			REMOTE_LOGGING_SHOULD_SEND_ERROR_FILTER,
			containsWooCommerceFrame,
			error,
			stackFrames
		) as boolean;
	}
}

let logger: RemoteLogger | null = null;

/**
 * Initializes the remote logging and error handlers.
 * This function should be called once at the start of the application.
 *
 * @param config - Configuration object for the RemoteLogger.
 *
 */
export function init( config: RemoteLoggerConfig ): void {
	if ( ! window.wcTracks || ! window.wcTracks.isEnabled ) {
		debug( 'Tracks is not enabled.' );
		return;
	}

	if ( logger ) {
		warnLog( 'RemoteLogger is already initialized.' );
		return;
	}

	try {
		logger = new RemoteLogger( config );
		logger.initializeErrorHandlers();
	} catch ( error ) {
		errorLog( 'Failed to initialize RemoteLogger:', error );
	}
}

/**
 * Logs a message or error, respecting rate limiting.
 *
 * This function is inefficient because the data goes over the REST API, so use sparingly.
 *
 * @param severity  - The severity of the log.
 * @param message   - The message to log.
 * @param extraData - Optional additional data to include in the log.
 */
export async function log(
	severity: Exclude< LogData[ 'severity' ], undefined >,
	message: string,
	extraData?: Partial< Exclude< LogData, 'message' | 'severity' > >
) {
	if ( ! window.wcTracks || ! window.wcTracks.isEnabled ) {
		debug( 'Tracks is not enabled.' );
		return;
	}

	if ( ! logger ) {
		warnLog( 'RemoteLogger is not initialized. Call init() first.' );
		return;
	}

	try {
		await logger.log( severity, message, extraData );
	} catch ( error ) {
		errorLog( 'Failed to send log:', error );
	}
}
