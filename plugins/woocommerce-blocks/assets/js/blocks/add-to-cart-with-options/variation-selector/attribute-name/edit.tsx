/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { type BlockEditProps } from '@wordpress/blocks';
import {
	__experimentalUseColorProps as useColorProps,
	getTypographyClassesAndStyles as useTypographyProps,
	__experimentalGetSpacingClassesAndStyles as useSpacingProps,
	useSettings,
} from '@wordpress/block-editor';
import { useAttributeDataContext } from '@woocommerce/shared-context';

/**
 * Internal dependencies
 */
import clsx from 'clsx';

interface Attributes {
	className?: string;
}

export default function AttributeNameEdit(
	props: BlockEditProps< Attributes >
) {
	const { attributes } = props;
	const { className } = attributes;

	const colorProps = useColorProps( attributes );

	const [ fluidTypographySettings, layout ] = useSettings(
		'typography.fluid',
		'layout'
	);
	const typographyProps = useTypographyProps( attributes, {
		typography: {
			fluid: fluidTypographySettings,
		},
		layout: {
			wideSize: layout?.wideSize,
		},
	} );

	const spacingProps = useSpacingProps( attributes );

	const blockProps = useBlockProps( {
		className: clsx(
			className,
			colorProps.className,
			typographyProps.className,
			spacingProps.className
		),
		style: {
			...colorProps.stye,
			...typographyProps.style,
			...spacingProps.style,
		},
	} );

	const { attribute } = useAttributeDataContext();

	if ( ! attribute ) return;

	return <label { ...blockProps }>{ attribute.name }</label>;
}
