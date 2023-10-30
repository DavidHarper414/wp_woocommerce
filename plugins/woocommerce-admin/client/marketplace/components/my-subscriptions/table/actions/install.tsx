/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { dispatch, useDispatch, useSelect } from '@wordpress/data';
import { useContext } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SubscriptionsContext } from '../../../../contexts/subscriptions-context';
import { installProduct } from '../../../../utils/functions';
import { Subscription } from '../../types';
import { installingStore } from '../../../../contexts/install-store';

interface InstallProps {
	subscription: Subscription;
}

export default function Install( props: InstallProps ) {
	const { createWarningNotice, createSuccessNotice } =
		useDispatch( 'core/notices' );
	const { loadSubscriptions } = useContext( SubscriptionsContext );

	const loading: boolean = useSelect(
		( select ) => {
			return select( installingStore ).isInstalling(
				props.subscription.product_key
			);
		},
		[ props.subscription.product_key ]
	);

	const startInstall = () => {
		dispatch( installingStore ).startInstalling(
			props.subscription.product_key
		);
	};
	const stopInstall = () => {
		dispatch( installingStore ).stopInstalling(
			props.subscription.product_key
		);
	};

	const install = () => {
		startInstall();
		installProduct( props.subscription )
			.then( () => {
				loadSubscriptions( false ).then( () => {
					createSuccessNotice(
						sprintf(
							// translators: %s is the product name.
							__( '%s successfully installed.', 'woocommerce' ),
							props.subscription.product_name
						),
						{
							icon: <Icon icon="yes" />,
						}
					);
					stopInstall();
				} );
			} )
			.catch( ( error ) => {
				loadSubscriptions( false ).then( () => {
					let errorMessage = sprintf(
						// translators: %s is the product name.
						__( '%s couldn’t be installed.', 'woocommerce' ),
						props.subscription.product_name
					);
					if ( error?.success === false && error?.data.message ) {
						errorMessage += ' ' + error.data.message;
					}
					createWarningNotice( errorMessage, {
						actions: [
							{
								label: __( 'Try again', 'woocommerce' ),
								onClick: install,
							},
						],
					} );
					stopInstall();
				} );
			} );
	};

	function installButtonLabel( installing: boolean ) {
		if ( installing ) {
			return __( 'Installing…', 'woocommerce' );
		}

		return __( 'Install', 'woocommerce' );
	}

	return (
		<Button
			variant="link"
			isBusy={ loading }
			disabled={ loading }
			onClick={ install }
		>
			{ installButtonLabel( loading ) }
		</Button>
	);
}
