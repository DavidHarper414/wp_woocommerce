/**
 * External dependencies
 */
import { Button, ButtonGroup, Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Subscription } from '../my-subscriptions/types';
import { WOO_CONNECT_PLUGIN_DOWNLOAD_URL } from '../constants';
import { getAdminSetting } from '../../../utils/admin-settings';

interface ConnectProps {
	subscription: Subscription;
	onClose: () => void;
}

export default function InstallWooConnectModal( props: ConnectProps ) {
	const wccomSettings = getAdminSetting( 'wccomHelper', {} );
	return (
		<Modal
			title={ __( 'Install Woo Update Manager', 'woocommerce' ) }
			onRequestClose={ props.onClose }
			focusOnMount={ true }
			className="woocommerce-marketplace__header-account-modal"
			style={ { borderRadius: 4 } }
			overlayClassName="woocommerce-marketplace__header-account-modal-overlay"
		>
			<p className="woocommerce-marketplace__header-account-modal-text">
				{ sprintf(
					// translators: %s is the product version number (e.g. 1.0.2).
					__(
						'Version %s is available. To enable this update you need to install the Woo Update Manager plugin. You can also download and install it manually in your stores.',
						'woocommerce'
					),
					props.subscription.version
				) }
			</p>
			<ButtonGroup className="woocommerce-marketplace__header-account-modal-button-group">
				<Button
					href={ WOO_CONNECT_PLUGIN_DOWNLOAD_URL }
					variant="secondary"
				>
					{ __( 'Download', 'woocommerce' ) }
				</Button>
				<Button
					href={ wccomSettings?.wooConnectInstallUrl }
					variant="primary"
				>
					{ __( 'Install', 'woocommerce' ) }
				</Button>
			</ButtonGroup>
		</Modal>
	);
}
