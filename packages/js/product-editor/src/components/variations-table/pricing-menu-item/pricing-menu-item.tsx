/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { ProductVariation } from '@woocommerce/data';
import { recordEvent } from '@woocommerce/tracks';
import { Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { chevronRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { TRACKS_SOURCE } from '../../../constants';

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

export type PricingMenuItemProps = {
	variation: ProductVariation;
	handlePrompt(
		label?: string,
		parser?: ( value: string ) => Partial< ProductVariation >
	): void;
	onClose(): void;
};

export function PricingMenuItem( {
	variation,
	handlePrompt,
	onClose,
}: PricingMenuItemProps ) {
	return (
		<Dropdown
			position="middle right"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<MenuItem
					onClick={ () => {
						recordEvent( 'product_variations_menu_pricing_click', {
							source: TRACKS_SOURCE,
							variation_id: variation.id,
						} );
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
					<MenuGroup label={ __( 'List price', 'woocommerce' ) }>
						<MenuItem
							onClick={ () => {
								recordEvent(
									'product_variations_menu_pricing_select',
									{
										source: TRACKS_SOURCE,
										action: 'list_price_set',
										variation_id: variation.id,
									}
								);
								handlePrompt( undefined, ( value ) => {
									recordEvent(
										'product_variations_menu_pricing_update',
										{
											source: TRACKS_SOURCE,
											action: 'list_price_set',
											variation_id: variation.id,
										}
									);
									return {
										regular_price: value,
									};
								} );
								onClose();
							} }
						>
							{ __( 'Set list price', 'woocommerce' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								recordEvent(
									'product_variations_menu_pricing_select',
									{
										source: TRACKS_SOURCE,
										action: 'list_price_increase',
										variation_id: variation.id,
									}
								);
								handlePrompt(
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
												variation_id: variation.id,
											}
										);
										return {
											regular_price: addFixedOrPercentage(
												variation.regular_price,
												value
											)?.toFixed( 2 ),
										};
									}
								);
								onClose();
							} }
						>
							{ __( 'Increase list price', 'woocommerce' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								recordEvent(
									'product_variations_menu_pricing_select',
									{
										source: TRACKS_SOURCE,
										action: 'list_price_decrease',
										variation_id: variation.id,
									}
								);
								handlePrompt(
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
												variation_id: variation.id,
											}
										);
										return {
											regular_price: addFixedOrPercentage(
												variation.regular_price,
												value,
												-1
											)?.toFixed( 2 ),
										};
									}
								);
								onClose();
							} }
						>
							{ __( 'Decrease list price', 'woocommerce' ) }
						</MenuItem>
					</MenuGroup>
					<MenuGroup label={ __( 'Sale price', 'woocommerce' ) }>
						<MenuItem
							onClick={ () => {
								recordEvent(
									'product_variations_menu_pricing_select',
									{
										source: TRACKS_SOURCE,
										action: 'sale_price_set',
										variation_id: variation.id,
									}
								);
								handlePrompt( undefined, ( value ) => {
									recordEvent(
										'product_variations_menu_pricing_update',
										{
											source: TRACKS_SOURCE,
											action: 'sale_price_set',
											variation_id: variation.id,
										}
									);
									return {
										sale_price: value,
									};
								} );
								onClose();
							} }
						>
							{ __( 'Set sale price', 'woocommerce' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								recordEvent(
									'product_variations_menu_pricing_select',
									{
										source: TRACKS_SOURCE,
										action: 'sale_price_increase',
										variation_id: variation.id,
									}
								);
								handlePrompt(
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
												variation_id: variation.id,
											}
										);
										return {
											sale_price: addFixedOrPercentage(
												variation.sale_price,
												value
											)?.toFixed( 2 ),
										};
									}
								);
								onClose();
							} }
						>
							{ __( 'Increase sale price', 'woocommerce' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								recordEvent(
									'product_variations_menu_pricing_select',
									{
										source: TRACKS_SOURCE,
										action: 'sale_price_decrease',
										variation_id: variation.id,
									}
								);
								handlePrompt(
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
												variation_id: variation.id,
											}
										);
										return {
											sale_price: addFixedOrPercentage(
												variation.sale_price,
												value,
												-1
											)?.toFixed( 2 ),
										};
									}
								);
								onClose();
							} }
						>
							{ __( 'Decrease sale price', 'woocommerce' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								recordEvent(
									'product_variations_menu_pricing_select',
									{
										source: TRACKS_SOURCE,
										action: 'sale_price_schedule',
										variation_id: variation.id,
									}
								);
								handlePrompt(
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
												variation_id: variation.id,
											}
										);
										return {
											date_on_sale_from_gmt: value,
										};
									}
								);
								handlePrompt(
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
												variation_id: variation.id,
											}
										);
										return {
											date_on_sale_to_gmt: value,
										};
									}
								);
								onClose();
							} }
						>
							{ __( 'Schedule sale', 'woocommerce' ) }
						</MenuItem>
					</MenuGroup>
				</div>
			) }
		/>
	);
}
