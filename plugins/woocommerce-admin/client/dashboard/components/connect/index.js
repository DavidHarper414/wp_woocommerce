/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import PropTypes from 'prop-types';
import { withDispatch } from '@wordpress/data';
import { ONBOARDING_STORE_NAME } from '@woocommerce/data';

export class Connect extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isConnecting: false,
		};

		this.connectJetpack = this.connectJetpack.bind( this );
		props.setIsPending( true );
	}

	componentDidUpdate( prevProps ) {
		const {
			createNotice,
			jetpackAuth: { error, isRequesting },
			onError,
			setIsPending,
		} = this.props;

		if ( prevProps.isRequesting && ! isRequesting ) {
			setIsPending( false );
		}

		if ( error && error !== prevProps.error ) {
			if ( onError ) {
				onError();
			}
			createNotice( 'error', error );
		}
	}

	async connectJetpack() {
		const { jetpackAuth, onConnect } = this.props;

		this.setState(
			{
				isConnecting: true,
			},
			() => {
				if ( onConnect ) {
					onConnect();
				}
				window.location = jetpackAuth.url;
			}
		);
	}

	render() {
		const {
			jetpackAuth: { error, isRequesting },
			onSkip,
			skipText,
			onAbort,
			abortText,
		} = this.props;

		return (
			<Fragment>
				{ error ? (
					<Button
						isPrimary
						onClick={ () => window.location.reload() }
					>
						{ __( 'Retry', 'woocommerce' ) }
					</Button>
				) : (
					<Button
						disabled={ isRequesting }
						isBusy={ this.state.isConnecting }
						isPrimary
						onClick={ this.connectJetpack }
					>
						{ __( 'Connect', 'woocommerce' ) }
					</Button>
				) }
				{ onSkip && (
					<Button onClick={ onSkip }>
						{ skipText || __( 'No thanks', 'woocommerce' ) }
					</Button>
				) }
				{ onAbort && (
					<Button onClick={ onAbort }>
						{ abortText || __( 'Abort', 'woocommerce' ) }
					</Button>
				) }
			</Fragment>
		);
	}
}

Connect.propTypes = {
	/**
	 * Method to create a displayed notice.
	 */
	createNotice: PropTypes.func.isRequired,
	/**
	 * Result of retrieving Jetpack authentication URL from the onboarding data store.
	 *
	 * Fields:
	 * - error: Human-readable error message. Also used to determine if the "Retry" button should be displayed.
	 * - isRequesting: Bool to check if the connection URL is still being requested.
	 * - url: The Jetpack authentication URL.
	 */
	jetpackAuth: PropTypes.exact( {
		url: PropTypes.string,
		error: PropTypes.string,
		isRequesting: PropTypes.bool,
	} ),
	/**
	 * Called before the redirect to Jetpack.
	 */
	onConnect: PropTypes.func,
	/**
	 * Called when the plugin has an error retrieving the jetpackAuthUrl.
	 */
	onError: PropTypes.func,
	/**
	 * Called when the plugin connection is skipped.
	 */
	onSkip: PropTypes.func,
	/**
	 * Redirect URL to encode as a URL param for the connection path.
	 */
	redirectUrl: PropTypes.string,
	/**
	 * Text used for the skip connection button.
	 */
	skipText: PropTypes.string,
	/**
	 * Control the `isPending` logic of the parent containing the Stepper.
	 */
	setIsPending: PropTypes.func,
	/**
	 * Called when the plugin connection is aborted.
	 */
	onAbort: PropTypes.func,
	/**
	 * Text used for the abort connection button.
	 */
	abortText: PropTypes.string,
};

Connect.defaultProps = {
	setIsPending: () => {},
};

export default compose(
	withDispatch( ( dispatch ) => {
		const { createNotice } = dispatch( 'core/notices' );

		return {
			createNotice,
		};
	} )
)( Connect );

export const prefetchJetpackAuthData = ( select, redirectUrl ) => {
	const { getJetpackAuthUrl, isResolving, getOnboardingError } = select(
		ONBOARDING_STORE_NAME
	);

	const queryArgs = {
		redirectUrl: redirectUrl || window.location.href,
		from: 'woocommerce-services',
	};

	return {
		error: getOnboardingError( 'getJetpackAuthUrl' ) || '',
		isRequesting: isResolving( 'getJetpackAuthUrl', [ queryArgs ] ),
		url: getJetpackAuthUrl( queryArgs ).url,
	};
};
