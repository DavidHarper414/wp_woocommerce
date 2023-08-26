/**
 * External dependencies
 */
import {
	Dropdown,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { createElement, Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { chevronRight, moreVertical } from '@wordpress/icons';
import { ProductVariation } from '@woocommerce/data';
import { recordEvent } from '@woocommerce/tracks';

/**
 * Internal dependencies
 */
import { VariationActionsMenuProps } from './types';
import { TRACKS_SOURCE } from '../../../constants';
import { ShippingMenuItem } from '../shipping-menu-item';

function isPercentage( value: string ) {
	return value.endsWith( '%' );
}

function parsePercentage( value: string ) {
	const stringNumber = value.substring( 0, value.length - 1 );
	if ( Number.isNaN( Number( stringNumber ) ) ) {
		return undefined;
	}
	return Number( stringNumber );
}

function addFixedOrPercentage(
	value: string,
	fixedOrPercentage: string,
	increaseOrDecrease: 1 | -1 = 1
) {
	if ( isPercentage( fixedOrPercentage ) ) {
		if ( Number.isNaN( Number( value ) ) ) {
			return 0;
		}
		const percentage = parsePercentage( fixedOrPercentage );
		if ( percentage === undefined ) {
			return Number( value );
		}
		return (
			Number( value ) +
			Number( value ) * ( percentage / 100 ) * increaseOrDecrease
		);
	}
	if ( Number.isNaN( Number( value ) ) ) {
		if ( Number.isNaN( Number( fixedOrPercentage ) ) ) {
			return undefined;
		}
		return Number( fixedOrPercentage );
	}
	return Number( value ) + Number( fixedOrPercentage ) * increaseOrDecrease;
}

export function VariationActionsMenu( {
	variation,
	onChange,
	onDelete,
}: VariationActionsMenuProps ) {
	function handlePrompt(
		propertyName: keyof ProductVariation,
		label: string = __( 'Enter a value', 'woocommerce' ),
		parser: ( value: string ) => unknown = ( value ) => value
	) {
		// eslint-disable-next-line no-alert
		const value = window.prompt( label );
		if ( value === null ) return;

		onChange( {
			[ propertyName ]: parser( value.trim() ),
		} );
	}

	return (
		<DropdownMenu
			icon={ moreVertical }
			label={ __( 'Actions', 'woocommerce' ) }
			toggleProps={ {
				onClick() {
					recordEvent( 'product_variations_menu_view', {
						source: TRACKS_SOURCE,
						variation_id: variation.id,
					} );
				},
			} }
		>
			{ ( { onClose } ) => (
				<>
					<MenuGroup
						label={ sprintf(
							/** Translators: Variation ID */
							__( 'Variation Id: %s', 'woocommerce' ),
							variation.id
						) }
					>
						<MenuItem
							href={ variation.permalink }
							onClick={ () => {
								recordEvent( 'product_variations_preview', {
									source: TRACKS_SOURCE,
									variation_id: variation.id,
								} );
							} }
						>
							{ __( 'Preview', 'woocommerce' ) }
						</MenuItem>
					</MenuGroup>
					<MenuGroup>
						<Dropdown
							position="middle right"
							renderToggle={ ( { isOpen, onToggle } ) => (
								<MenuItem
									onClick={ () => {
										recordEvent(
											'product_variations_menu_pricing_click',
											{
												source: TRACKS_SOURCE,
												variation_id: variation.id,
											}
										);
										onToggle();
									} }
									aria-expanded={ isOpen }
									icon={ chevronRight }
									iconPosition="right"
								>
									{ __( 'Pricing', 'woocommerce' ) }
								</MenuItem>
							) }
							renderContent={ () => (
								<div className="components-dropdown-menu__menu">
									<MenuGroup
										label={ __(
											'List price',
											'woocommerce'
										) }
									>
										<MenuItem
											onClick={ () => {
												recordEvent(
													'product_variations_menu_pricing_select',
													{
														source: TRACKS_SOURCE,
														action: 'list_price_set',
														variation_id:
															variation.id,
													}
												);
												handlePrompt(
													'regular_price',
													undefined,
													( value ) => {
														recordEvent(
															'product_variations_menu_pricing_update',
															{
																source: TRACKS_SOURCE,
																action: 'list_price_set',
																variation_id:
																	variation.id,
															}
														);
														return value;
													}
												);
												onClose();
											} }
										>
											{ __(
												'Set list price',
												'woocommerce'
											) }
										</MenuItem>
										<MenuItem
											onClick={ () => {
												recordEvent(
													'product_variations_menu_pricing_select',
													{
														source: TRACKS_SOURCE,
														action: 'list_price_increase',
														variation_id:
															variation.id,
													}
												);
												handlePrompt(
													'regular_price',
													__(
														'Enter a value (fixed or %)',
														'woocommerce'
													),
													( value ) => {
														recordEvent(
															'product_variations_menu_pricing_update',
															{
																source: TRACKS_SOURCE,
																action: 'list_price_increase',
																variation_id:
																	variation.id,
															}
														);
														return addFixedOrPercentage(
															variation.regular_price,
															value
														)?.toFixed( 2 );
													}
												);
												onClose();
											} }
										>
											{ __(
												'Increase list price',
												'woocommerce'
											) }
										</MenuItem>
										<MenuItem
											onClick={ () => {
												recordEvent(
													'product_variations_menu_pricing_select',
													{
														source: TRACKS_SOURCE,
														action: 'list_price_decrease',
														variation_id:
															variation.id,
													}
												);
												handlePrompt(
													'regular_price',
													__(
														'Enter a value (fixed or %)',
														'woocommerce'
													),
													( value ) => {
														recordEvent(
															'product_variations_menu_pricing_update',
															{
																source: TRACKS_SOURCE,
																action: 'list_price_increase',
																variation_id:
																	variation.id,
															}
														);
														return addFixedOrPercentage(
															variation.regular_price,
															value,
															-1
														)?.toFixed( 2 );
													}
												);
												onClose();
											} }
										>
											{ __(
												'Decrease list price',
												'woocommerce'
											) }
										</MenuItem>
									</MenuGroup>
									<MenuGroup
										label={ __(
											'Sale price',
											'woocommerce'
										) }
									>
										<MenuItem
											onClick={ () => {
												recordEvent(
													'product_variations_menu_pricing_select',
													{
														source: TRACKS_SOURCE,
														action: 'sale_price_set',
														variation_id:
															variation.id,
													}
												);
												handlePrompt(
													'sale_price',
													undefined,
													( value ) => {
														recordEvent(
															'product_variations_menu_pricing_update',
															{
																source: TRACKS_SOURCE,
																action: 'sale_price_set',
																variation_id:
																	variation.id,
															}
														);
														return value;
													}
												);
												onClose();
											} }
										>
											{ __(
												'Set sale price',
												'woocommerce'
											) }
										</MenuItem>
										<MenuItem
											onClick={ () => {
												recordEvent(
													'product_variations_menu_pricing_select',
													{
														source: TRACKS_SOURCE,
														action: 'sale_price_increase',
														variation_id:
															variation.id,
													}
												);
												handlePrompt(
													'sale_price',
													__(
														'Enter a value (fixed or %)',
														'woocommerce'
													),
													( value ) => {
														recordEvent(
															'product_variations_menu_pricing_update',
															{
																source: TRACKS_SOURCE,
																action: 'sale_price_increase',
																variation_id:
																	variation.id,
															}
														);
														return addFixedOrPercentage(
															variation.sale_price,
															value
														)?.toFixed( 2 );
													}
												);
												onClose();
											} }
										>
											{ __(
												'Increase sale price',
												'woocommerce'
											) }
										</MenuItem>
										<MenuItem
											onClick={ () => {
												recordEvent(
													'product_variations_menu_pricing_select',
													{
														source: TRACKS_SOURCE,
														action: 'sale_price_decrease',
														variation_id:
															variation.id,
													}
												);
												handlePrompt(
													'sale_price',
													__(
														'Enter a value (fixed or %)',
														'woocommerce'
													),
													( value ) => {
														recordEvent(
															'product_variations_menu_pricing_update',
															{
																source: TRACKS_SOURCE,
																action: 'sale_price_decrease',
																variation_id:
																	variation.id,
															}
														);
														return addFixedOrPercentage(
															variation.sale_price,
															value,
															-1
														)?.toFixed( 2 );
													}
												);
												onClose();
											} }
										>
											{ __(
												'Decrease sale price',
												'woocommerce'
											) }
										</MenuItem>
										<MenuItem
											onClick={ () => {
												recordEvent(
													'product_variations_menu_pricing_select',
													{
														source: TRACKS_SOURCE,
														action: 'sale_price_schedule',
														variation_id:
															variation.id,
													}
												);
												handlePrompt(
													'date_on_sale_from_gmt',
													__(
														'Sale start date (YYYY-MM-DD format or leave blank)',
														'woocommerce'
													),
													( value ) => {
														recordEvent(
															'product_variations_menu_pricing_update',
															{
																source: TRACKS_SOURCE,
																action: 'sale_price_schedule',
																variation_id:
																	variation.id,
															}
														);
														return value;
													}
												);
												handlePrompt(
													'date_on_sale_to_gmt',
													__(
														'Sale end date (YYYY-MM-DD format or leave blank)',
														'woocommerce'
													),
													( value ) => {
														recordEvent(
															'product_variations_menu_pricing_update',
															{
																source: TRACKS_SOURCE,
																action: 'sale_price_schedule',
																variation_id:
																	variation.id,
															}
														);
														return value;
													}
												);
												onClose();
											} }
										>
											{ __(
												'Schedule sale',
												'woocommerce'
											) }
										</MenuItem>
									</MenuGroup>
								</div>
							) }
						/>

						<ShippingMenuItem
							variation={ variation }
							handlePrompt={ handlePrompt }
							onClose={ onClose }
						/>
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							isDestructive
							variant="link"
							onClick={ () => {
								onDelete( variation.id );
								onClose();
							} }
							className="woocommerce-product-variations__actions--delete"
						>
							{ __( 'Delete', 'woocommerce' ) }
						</MenuItem>
					</MenuGroup>
				</>
			) }
		</DropdownMenu>
	);
}
