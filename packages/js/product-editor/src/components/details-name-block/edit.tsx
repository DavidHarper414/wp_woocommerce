/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	createElement,
	Fragment,
	createInterpolateElement,
	useState,
} from '@wordpress/element';

import { useBlockProps } from '@wordpress/block-editor';
import { cleanForSlug } from '@wordpress/url';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	PRODUCTS_STORE_NAME,
	WCDataSelector,
	Product,
} from '@woocommerce/data';
import {
	Button,
	BaseControl,
	// @ts-expect-error `__experimentalInputControl` does exist.
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types for this exist yet.
// eslint-disable-next-line @woocommerce/dependency-group
import { useEntityProp, useEntityId } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { AUTO_DRAFT_NAME } from '../../utils';
import { EditProductLinkModal } from '../edit-product-link-modal';

import { useValidation } from '../../hooks/use-validation';

export function Edit() {
	const blockProps = useBlockProps();

	const { editEntityRecord, saveEntityRecord } = useDispatch( 'core' );

	const [ showProductLinkEditModal, setShowProductLinkEditModal ] =
		useState( false );

	const productId = useEntityId( 'postType', 'product' );
	const product: Product = useSelect( ( select ) =>
		select( 'core' ).getEditedEntityRecord(
			'postType',
			'product',
			productId
		)
	);

	const [ sku, setSku ] = useEntityProp( 'postType', 'product', 'sku' );
	const [ name, setName ] = useEntityProp< string >(
		'postType',
		'product',
		'name'
	);

	const { permalinkPrefix, permalinkSuffix } = useSelect(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		( select: WCDataSelector ) => {
			const { getPermalinkParts } = select( PRODUCTS_STORE_NAME );
			if ( productId ) {
				const parts = getPermalinkParts( productId );
				return {
					permalinkPrefix: parts?.prefix,
					permalinkSuffix: parts?.suffix,
				};
			}
			return {};
		}
	);

	const nameIsValid = useValidation(
		'product/name',
		() => Boolean( name ) && name !== AUTO_DRAFT_NAME
	);

	const setSkuIfEmpty = () => {
		if ( sku || ! nameIsValid ) {
			return;
		}
		setSku( cleanForSlug( name ) );
	};

	return (
		<>
			<div { ...blockProps }>
				<BaseControl
					id={ 'product_name' }
					label={ createInterpolateElement(
						__( 'Name <required />', 'woocommerce' ),
						{
							required: (
								<span className="woocommerce-product-form__required-input">
									{ __( '*', 'woocommerce' ) }
								</span>
							),
						}
					) }
				>
					<InputControl
						name={ 'woocommerce-product-name' }
						placeholder={ __(
							'e.g. 12 oz Coffee Mug',
							'woocommerce'
						) }
						onChange={ setName }
						value={ name || '' }
						onBlur={ setSkuIfEmpty }
					/>
				</BaseControl>
				{ productId &&
					nameIsValid &&
					[ 'publish', 'draft' ].includes( product.status ) &&
					permalinkPrefix && (
						<span className="woocommerce-product-form__secondary-text product-details-section__product-link">
							{ __( 'Product link', 'woocommerce' ) }
							:&nbsp;
							<a
								href={ product.permalink }
								target="_blank"
								rel="noreferrer"
							>
								{ permalinkPrefix }
								{ product.slug || cleanForSlug( name ) }
								{ permalinkSuffix }
							</a>
							<Button
								variant="link"
								onClick={ () =>
									setShowProductLinkEditModal( true )
								}
							>
								{ __( 'Edit', 'woocommerce' ) }
							</Button>
						</span>
					) }
				{ showProductLinkEditModal && (
					<EditProductLinkModal
						permalinkPrefix={ permalinkPrefix || '' }
						permalinkSuffix={ permalinkSuffix || '' }
						product={ product }
						onCancel={ () => setShowProductLinkEditModal( false ) }
						onSaved={ () => setShowProductLinkEditModal( false ) }
						saveHandler={ async ( updatedSlug ) => {
							const { slug, permalink }: Product =
								await saveEntityRecord( 'postType', 'product', {
									id: product.id,
									slug: updatedSlug,
								} );

							if ( slug && permalink ) {
								editEntityRecord(
									'postType',
									'product',
									product.id,
									{
										slug,
										permalink,
									}
								);

								return {
									slug,
									permalink,
								};
							}
						} }
					/>
				) }
			</div>
		</>
	);
}
