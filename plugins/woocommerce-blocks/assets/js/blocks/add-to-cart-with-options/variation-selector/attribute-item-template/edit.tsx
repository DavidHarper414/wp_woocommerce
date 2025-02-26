/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
	__experimentalUseBlockPreview as useBlockPreview,
} from '@wordpress/block-editor';
import { BlockInstance, type BlockEditProps } from '@wordpress/blocks';
import { useProductDataContext } from '@woocommerce/shared-context';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { AttributeProvider } from '../contexts/attribute-context';

interface Attributes {
	className?: string;
}

type AttributeItemProps = {
	blocks: BlockInstance[];
	isSelected: boolean;
	onSelect(): void;
};

function AttributeItem( { blocks, isSelected, onSelect }: AttributeItemProps ) {
	const blockPreviewProps = useBlockPreview( {
		blocks,
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{ role: 'listitem' },
		{ templateLock: 'insert' }
	);

	return (
		<>
			{ isSelected ? <div { ...innerBlocksProps } /> : <></> }

			<div
				role="listitem"
				style={ { display: isSelected ? 'none' : undefined } }
			>
				<div
					{ ...blockPreviewProps }
					role="button"
					tabIndex={ 0 }
					onClick={ onSelect }
					onKeyDown={ onSelect }
				/>
			</div>
		</>
	);
}

export default function AttributeItemTemplateEdit(
	props: BlockEditProps< Attributes >
) {
	const { clientId } = props;
	const { className } = props.attributes;

	const blockProps = useBlockProps( {
		className,
	} );

	const { product } = useProductDataContext();

	const { blocks } = useSelect(
		( select ) => {
			const { getBlocks } = select( blockEditorStore );
			return { blocks: getBlocks( clientId ) };
		},
		[ clientId ]
	);

	const [ selectedAttributeItem, setSelectedAttributeItem ] =
		useState< number >();

	return (
		<div { ...blockProps } role="list">
			{ product.attributes.map( ( attribute ) => (
				<AttributeProvider key={ attribute.id } attribute={ attribute }>
					<AttributeItem
						blocks={ blocks }
						isSelected={
							( selectedAttributeItem ||
								product.attributes[ 0 ]?.id ) === attribute.id
						}
						onSelect={ () =>
							setSelectedAttributeItem( attribute.id )
						}
					/>
				</AttributeProvider>
			) ) }
		</div>
	);
}
