/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	RadioControl,
	TextControl,
} from '@wordpress/components';
import ExternalLinkCard from '@woocommerce/editor-components/external-link-card';
import { __ } from '@wordpress/i18n';
import type { BlockAttributes } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { PAYMENT_STORE_KEY } from '@woocommerce/block-data';
import { ADMIN_URL } from '@woocommerce/settings';
import { PlainPaymentMethods } from '@woocommerce/types';

export const BlockSettings = ( {
	attributes,
	setAttributes,
}: {
	attributes: BlockAttributes;
	setAttributes: ( attrs: BlockAttributes ) => void;
} ) => {
	const { hasDarkControls } = attributes;
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Style', 'woocommerce' ) }>
				<ToggleControl
					label={ __( 'Dark mode inputs', 'woocommerce' ) }
					help={ __(
						'Inputs styled specifically for use on dark background colors.',
						'woocommerce'
					) }
					checked={ hasDarkControls }
					onChange={ () =>
						setAttributes( {
							hasDarkControls: ! hasDarkControls,
						} )
					}
				/>
			</PanelBody>
		</InspectorControls>
	);
};

const ExpressPaymentButtonStyleControls = ( {
	attributes,
	setAttributes,
}: {
	attributes: BlockAttributes;
	setAttributes: ( attrs: BlockAttributes ) => void;
} ) => {
	const { buttonHeight, buttonBorderRadius } = attributes;
	return (
		<>
			<RadioControl
				label={ __( 'Button size', 'woocommerce' ) }
				selected={ buttonHeight }
				options={ [
					{ label: 'Small (40px)', value: '40' },
					{ label: 'Medium (48px)', value: '48' },
					{ label: 'Large (55px)', value: '55' },
				] }
				onChange={ ( newValue: string ) =>
					setAttributes( { buttonHeight: newValue } )
				}
			/>
			<div className="border-radius-control-container">
				<TextControl
					label={ __( 'Button border radius', 'woocommerce' ) }
					value={ buttonBorderRadius }
					onChange={ ( newValue: string ) =>
						setAttributes( {
							buttonBorderRadius: newValue,
						} )
					}
				/>
				<span className="border-radius-control-px">px</span>
			</div>
		</>
	);
};

const ExpressPaymentToggle = ( {
	attributes,
	setAttributes,
}: {
	attributes: BlockAttributes;
	setAttributes: ( attrs: BlockAttributes ) => void;
} ) => {
	if ( attributes.showButtonStyles ) {
		return (
			<ExpressPaymentButtonStyleControls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
	}
	return null;
};

const getMissingStyleSupport = ( supportsStyle: string[] ) => {
	const supportedStyles = [ 'borderRadius', 'height' ];

	if ( ! Array.isArray( supportsStyle ) ) {
		return supportedStyles;
	}

	return supportedStyles.filter( ( s ) => ! supportsStyle.includes( s ) );
};

export const ExpressPaymentMethods = () => {
	const availableExpressMethods =
		select( PAYMENT_STORE_KEY ).getAvailableExpressPaymentMethods();

	if ( Object.entries( availableExpressMethods ).length < 1 ) {
		return (
			<p className="wc-block-checkout__controls-text">
				{ __(
					'You currently have no express payment integrations active.',
					'woocommerce'
				) }
			</p>
		);
	}

	return (
		<>
			<p className="wc-block-checkout__controls-text">
				{ __(
					'You currently have the following express payment integrations active.',
					'woocommerce'
				) }
			</p>
			{ Object.values( availableExpressMethods ).map( ( values ) => {
				const missingStyleSupport = getMissingStyleSupport(
					values?.supportsStyle
				);
				const warning =
					missingStyleSupport.length > 0
						? 'This button does not support controls for: ' +
						  missingStyleSupport.join( ', ' ).trim()
						: '';
				return (
					<ExternalLinkCard
						key={ values.name }
						href={ `${ ADMIN_URL }admin.php?page=wc-settings&tab=checkout&section=${ encodeURIComponent(
							values.gatewayId
						) }` }
						title={ values.title }
						description={ values.description }
						warning={ warning }
					/>
				);
			} ) }
		</>
	);
};

export const ExpressPaymentControls = ( {
	attributes,
	setAttributes,
}: {
	attributes: BlockAttributes;
	setAttributes: ( attrs: BlockAttributes ) => void;
} ) => {
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Button Settings', 'woocommerce' ) }>
				<ToggleControl
					label={ __( 'Apply uniform styles', 'woocommerce' ) }
					checked={ attributes.showButtonStyles }
					onChange={ () =>
						setAttributes( {
							showButtonStyles: ! attributes.showButtonStyles,
						} )
					}
					help={ __(
						'Overrides styles set by gateways to ensure all express payment buttons have a consistent appearance.',
						'woocommerce'
					) }
				/>
				<ExpressPaymentToggle
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</PanelBody>
			<PanelBody title={ __( 'Express Payment Methods', 'woocommerce' ) }>
				<ExpressPaymentMethods />
			</PanelBody>
		</InspectorControls>
	);
};
