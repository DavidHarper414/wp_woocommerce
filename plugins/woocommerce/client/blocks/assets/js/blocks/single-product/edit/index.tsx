/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { withProduct } from '@woocommerce/block-hocs';
import BlockErrorBoundary from '@woocommerce/base-components/block-error-boundary';
import EditProductLink from '@woocommerce/editor-components/edit-product-link';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { ProductResponseItem } from '@woocommerce/types';
import ErrorPlaceholder, {
	ErrorObject,
} from '@woocommerce/editor-components/error-placeholder';
import { PRODUCTS_STORE_NAME, Product } from '@woocommerce/data';
import { useSelect } from '@wordpress/data';
import { Icon, info } from '@wordpress/icons';
import {
	Placeholder,
	// @ts-expect-error Using experimental features
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	// @ts-expect-error Using experimental features
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalText as Text,
	Button,
	PanelBody,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import SharedProductControl from './shared-product-control';
import EditorBlockControls from './editor-block-controls';
import LayoutEditor from './layout-editor';
import { BLOCK_ICON } from '../constants';
import metadata from '../block.json';
import { Attributes } from '../types';

interface EditorProps {
	className: string;
	attributes: {
		productId: number;
		isPreview: boolean;
	};
	setAttributes: ( attributes: Attributes ) => void;
	error: string | ErrorObject;
	getProduct: () => void;
	product: ProductResponseItem;
	isLoading: boolean;
	clientId: string;
}

const Editor = ( {
	attributes,
	setAttributes,
	error,
	getProduct,
	product,
	isLoading,
	clientId,
}: EditorProps ) => {
	const { productId, isPreview } = attributes;
	const [ isEditing, setIsEditing ] = useState( ! productId );
	const blockProps = useBlockProps();

	const block = useSelect(
		( select ) => select( 'core/blocks' ).getBlockType( metadata.name ),
		[]
	);

	const productPreview = useSelect( ( select ) => {
		if ( ! isPreview ) {
			return null;
		}
		return select( PRODUCTS_STORE_NAME ).getProducts< Array< Product > >( {
			per_page: 1,
		} );
	} );

	const isInvalidProductId =
		typeof error === 'object' &&
		error?.code === 'woocommerce_rest_product_invalid_id';

	useEffect( () => {
		const productPreviewId = productPreview
			? productPreview[ 0 ]?.id
			: null;

		// If the product is set, do not override it with the preview.
		if ( ! productPreviewId || productId ) {
			return;
		}

		setAttributes( {
			...attributes,
			productId: productPreviewId,
		} );
		setIsEditing( false );
	}, [ attributes, productId, productPreview, setAttributes ] );

	useEffect( () => {
		if ( isInvalidProductId && ! isEditing ) {
			setIsEditing( true );
		}
	}, [ isInvalidProductId ] );

	if ( error && ! isInvalidProductId ) {
		return (
			<ErrorPlaceholder
				className="wc-block-editor-single-product-error"
				error={ error as ErrorObject }
				isLoading={ isLoading }
				onRetry={ getProduct }
			/>
		);
	}

	const infoTitle = isInvalidProductId ? (
		<>
			<Icon
				icon={ info }
				className="wc-block-editor-single-product__info-icon"
			/>
			<Text>
				{ __(
					'Previously selected product is no longer available.',
					'woocommerce'
				) }
			</Text>
		</>
	) : (
		<Text>{ block.description }</Text>
	);

	const onChange = isInvalidProductId
		? () => setIsEditing( false )
		: undefined;

	return (
		<div { ...blockProps }>
			{ /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */ }
			{ /* @ts-ignore */ }
			<BlockErrorBoundary
				header={ __( 'Single Product Block Error', 'woocommerce' ) }
			>
				<EditorBlockControls
					setIsEditing={ setIsEditing }
					isEditing={ isEditing }
				/>
				{ isEditing ? (
					<Placeholder
						icon={ BLOCK_ICON }
						label={ block.title }
						className="wc-block-editor-single-product"
					>
						<HStack alignment="center"> { infoTitle } </HStack>
						<div className="wc-block-editor-single-product__selection">
							<SharedProductControl
								attributes={ attributes }
								setAttributes={ setAttributes }
								onChange={ onChange }
							/>
							{ ! isInvalidProductId && (
								<Button
									variant="secondary"
									onClick={ () => {
										setIsEditing( false );
									} }
								>
									{ __( 'Done', 'woocommerce' ) }
								</Button>
							) }
						</div>
					</Placeholder>
				) : (
					<div>
						<InspectorControls>
							<PanelBody
								title={ __( 'Product', 'woocommerce' ) }
								initialOpen={ false }
							>
								<SharedProductControl
									attributes={ attributes }
									setAttributes={ setAttributes }
								/>
							</PanelBody>
						</InspectorControls>

						<EditProductLink productId={ productId } />
						<LayoutEditor
							clientId={ clientId }
							product={ product }
							isLoading={ isLoading }
						/>
					</div>
				) }
			</BlockErrorBoundary>
		</div>
	);
};

export default withProduct( Editor );
