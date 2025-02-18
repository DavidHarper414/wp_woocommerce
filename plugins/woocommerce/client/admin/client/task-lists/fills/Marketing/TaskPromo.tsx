/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { Text } from '@woocommerce/experimental';

/**
 * Internal dependencies
 */
import './TaskPromo.scss';
import { WC_ASSET_URL } from '~/utils/admin-settings';

export type TaskPromoProps = {
	title?: string;
	iconSrc?: string;
	iconAlt?: string;
	text?: string;
	buttonHref?: string;
	buttonText?: string;
};

export const TaskPromo: React.FC< TaskPromoProps > = ( {
	title = '',
	iconSrc = `${ WC_ASSET_URL }images/woo-app-icon.svg`,
	iconAlt = __( 'Woo icon', 'woocommerce' ),
	text = '',
	buttonHref = '',
	buttonText = '',
} ) => {
	return (
		<Card className="woocommerce-task-card woocommerce-task-promo">
			{ title && (
				<CardHeader>
					<Text
						variant="title.small"
						as="h2"
						className="woocommerce-task-card__title"
					>
						{ title }
					</Text>
				</CardHeader>
			) }
			<CardBody>
				<div className="woocommerce-plugin-list__plugin-logo">
					<img src={ iconSrc } alt={ iconAlt } />
				</div>
				<div className="woocommerce-plugin-list__plugin-text">
					<Text>{ text }</Text>
				</div>
				<div className="woocommerce-plugin-list__plugin-action">
					<Button isSecondary href={ buttonHref }>
						{ buttonText }
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};
