/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { type BlockEditProps } from '@wordpress/blocks';
import {
	Disabled,
	PanelBody,
	SelectControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { useAttributeContext } from '../contexts/attribute-context';

interface Attributes {
	className?: string;
	style?: 'pills' | 'dropdown';
}

function Pills( { options }: { options: SelectControl.Option[] } ) {
	return (
		<ul className="wp-block-woocommerce-add-to-cart-with-options-variation-selector-attribute-options__pills">
			{ options.map( ( option, index ) => (
				<li
					key={ option.value }
					className={ clsx(
						'wp-block-woocommerce-add-to-cart-with-options-variation-selector-attribute-options__pill',
						{
							'wp-block-woocommerce-add-to-cart-with-options-variation-selector-attribute-options__pill--selected':
								index === 0,
							'wp-block-woocommerce-add-to-cart-with-options-variation-selector-attribute-options__pill--disabled':
								option.disabled,
						}
					) }
				>
					{ option.label }
				</li>
			) ) }
		</ul>
	);
}

export default function AttributeOptionsEdit(
	props: BlockEditProps< Attributes >
) {
	const { attributes, setAttributes } = props;
	const { className, style } = attributes;

	const blockProps = useBlockProps( {
		className,
	} );

	const { attribute } = useAttributeContext();

	if ( ! attribute ) return;

	const options = attribute.terms.map( ( term, index ) => ( {
		value: term.slug,
		label: term.name,
		disabled: index > 1 && index === attribute.terms.length - 1,
	} ) );

	return (
		<div { ...blockProps } role="list">
			<InspectorControls>
				<PanelBody title={ __( 'Style', 'woocommerce' ) }>
					<ToggleGroupControl
						value={ style }
						onChange={ ( option: 'pills' | 'dropdown' ) => {
							setAttributes( { style: option } );
						} }
						isBlock
						hideLabelFromVision
						size="__unstable-large"
					>
						<ToggleGroupControlOption
							value="pills"
							label={ __( 'Pills', 'woocommerce' ) }
						/>
						<ToggleGroupControlOption
							value="dropdown"
							label={ __( 'Dropdown', 'woocommerce' ) }
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			{ style === 'pills' ? (
				<Pills options={ options } />
			) : (
				<Disabled>
					<SelectControl
						options={ options }
						hideLabelFromVision
						__nextHasNoMarginBottom
					/>
				</Disabled>
			) }
		</div>
	);
}
