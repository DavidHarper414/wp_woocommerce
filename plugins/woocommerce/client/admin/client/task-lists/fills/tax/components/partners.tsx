/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { Children } from '@wordpress/element';
import clsx from 'clsx';
import interpolateComponents from '@automattic/interpolate-components';
import { Link } from '@woocommerce/components';
import { getAdminLink } from '@woocommerce/settings';
import { Text } from '@woocommerce/experimental';
import { recordEvent } from '@woocommerce/tracks';

/**
 * Internal dependencies
 */
import { TaxChildProps } from '../utils';
import './partners.scss';

export const Partners = ( {
	children,
	isPending,
	onManual,
	onDisable,
}: TaxChildProps ) => {
	const classes = clsx(
		'woocommerce-task-card',
		'woocommerce-tax-partners',
		`woocommerce-tax-partners__partners-count-${ Children.count(
			children
		) }`
	);
	return (
		<>
			<Card className={ classes }>
				<CardHeader>
					{ __( 'Choose a tax partner', 'woocommerce' ) }
				</CardHeader>
				<CardBody>
					<div className="woocommerce-tax-partners__partners">
						{ children }
					</div>
					<ul className="woocommerce-tax-partners__other-actions">
						<li>
							<Button
								isTertiary
								disabled={ isPending }
								isBusy={ isPending }
								onClick={ () => {
									onManual();
								} }
							>
								{ __( 'Set up taxes manually', 'woocommerce' ) }
							</Button>
						</li>
						<li>
							<Button
								isTertiary
								disabled={ isPending }
								isBusy={ isPending }
								onClick={ () => {
									onDisable();
								} }
							>
								{ __(
									'I don’t charge sales tax',
									'woocommerce'
								) }
							</Button>
						</li>
					</ul>
				</CardBody>
			</Card>
			<Text
				as="div"
				className="woocommerce-task-dashboard__container woocommerce-task-marketplace-link"
			>
				{ interpolateComponents( {
					mixedString: __(
						'Visit the {{sbLink}}Official WooCommerce Marketplace{{/sbLink}} to enhance your products with additional marketing solutions.',
						'woocommerce'
					),
					components: {
						sbLink: (
							<Link
								onClick={ () => {
									recordEvent(
										'tasklist_marketing_visit_marketplace_click'
									);
									window.location.href = getAdminLink(
										'admin.php?page=wc-admin&tab=extensions&path=/extensions&category=operations'
									);
									return false;
								} }
								href=""
								type="wc-admin"
							/>
						),
					},
				} ) }
			</Text>
		</>
	);
};
