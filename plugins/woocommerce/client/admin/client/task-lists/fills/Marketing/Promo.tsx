/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
} from '@wordpress/components';
import { Text } from '@woocommerce/experimental';

/**
 * Internal dependencies
 */
import './Promo.scss';
import { WC_ASSET_URL } from '~/utils/admin-settings';

export const Promo: React.FC = () => {
	return (
		<Card className="woocommerce-task-card woocommerce-task-promo">
			<CardHeader>
				<Text
					variant="title.small"
					as="h2"
					className="woocommerce-task-card__title"
				>
					{ __( "Boost your store's potential", 'woocommerce' ) }
				</Text>
			</CardHeader>
			<CardBody>
				<div className="woocommerce-plugin-list__plugin-logo">
					<img
						src={ `${ WC_ASSET_URL }images/woo-app-icon.svg` }
						alt={ __( 'Woo icon', 'woocommerce' ) }
					/>
				</div>
				<div className="woocommerce-plugin-list__plugin-text">
					<Text>
						Discover hand-picked extensions to grow your business in
						the official WooCommerce marketplace.
					</Text>
				</div>
				<div className="woocommerce-plugin-list__plugin-action">
					<Button
						isSecondary
						href="https://woocommerce.com/collection/grow-your-business/"
					>
						{ __( 'Start growing', 'woocommerce' ) }
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};
