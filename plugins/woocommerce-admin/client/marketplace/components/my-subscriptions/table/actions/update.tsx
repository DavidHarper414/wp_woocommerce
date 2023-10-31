/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { useContext, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SubscriptionsContext } from '../../../../contexts/subscriptions-context';
import { Subscription } from '../../types';
import ConnectModal from './connect-modal';
import RenewModal from './renew-modal';
import SubscribeModal from './subscribe-modal';
import {
	addNotice,
	removeNotice,
	updateProduct,
} from '../../../../utils/functions';
import { NoticeStatus } from '../../../../contexts/types';

interface UpdateProps {
	subscription: Subscription;
}

export default function Update( props: UpdateProps ) {
	const [ showModal, setShowModal ] = useState( false );
	const [ isUpdating, setIsUpdating ] = useState( false );
	const { loadSubscriptions } = useContext( SubscriptionsContext );

	const canUpdate =
		props.subscription.active &&
		props.subscription.local &&
		props.subscription.local.slug &&
		props.subscription.local.path;

	function update() {
		if ( ! canUpdate ) {
			setShowModal( true );
			return;
		}
		removeNotice( props.subscription.product_key );
		if ( ! window.wp.updates ) {
			addNotice(
				props.subscription.product_key,
				sprintf(
					// translators: %s is the product name.
					__( '%s couldn’t be updated.', 'woocommerce' ),
					props.subscription.product_name
				),
				NoticeStatus.Error,
				{
					actions: [
						{
							label: __(
								'Reload page and try again',
								'woocommerce'
							),
							onClick: () => {
								window.location.reload();
							},
						},
					],
				}
			);
			return;
		}

		setIsUpdating( true );

		updateProduct( props.subscription )
			.then( () => {
				loadSubscriptions( false ).then( () => {
					addNotice(
						props.subscription.product_key,
						sprintf(
							// translators: %s is the product name.
							__( '%s updated successfully.', 'woocommerce' ),
							props.subscription.product_name
						),
						NoticeStatus.Success,
						{
							icon: <Icon icon="yes" />,
						}
					);
					setIsUpdating( false );
				} );
			} )
			.catch( () => {
				addNotice(
					props.subscription.product_key,
					sprintf(
						// translators: %s is the product name.
						__( '%s couldn’t be updated.', 'woocommerce' ),
						props.subscription.product_name
					),
					NoticeStatus.Error,
					{
						actions: [
							{
								label: __( 'Try again', 'woocommerce' ),
								onClick: update,
							},
						],
					}
				);
				setIsUpdating( false );
			} );
	}

	const modal = () => {
		if ( ! showModal ) {
			return null;
		}

		if ( props.subscription.product_key === '' ) {
			return (
				<SubscribeModal
					onClose={ () => setShowModal( false ) }
					subscription={ props.subscription }
				/>
			);
		} else if ( props.subscription.expired ) {
			return (
				<RenewModal
					subscription={ props.subscription }
					onClose={ () => setShowModal( false ) }
				/>
			);
		} else if ( ! props.subscription.active ) {
			return (
				<ConnectModal
					subscription={ props.subscription }
					onClose={ () => setShowModal( false ) }
				/>
			);
		}

		return null;
	};

	return (
		<>
			{ modal() }
			<Button
				variant="link"
				className="woocommerce-marketplace__my-subscriptions-update"
				onClick={ update }
				isBusy={ isUpdating }
				disabled={ isUpdating }
				label={ sprintf(
					// translators: %s is the product version.
					__( 'Update to %s', 'woocommerce' ),
					props.subscription.version
				) }
				showTooltip={ true }
				tooltipPosition="top center"
			>
				{ isUpdating
					? __( 'Updating', 'woocommerce' )
					: __( 'Update', 'woocommerce' ) }
			</Button>
		</>
	);
}
