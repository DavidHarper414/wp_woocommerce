/**
 * External dependencies
 */
import { Product } from '@woocommerce/data';
import { Button, Icon } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { createElement, Fragment } from '@wordpress/element';
import { MouseEvent, ReactNode } from 'react';
import { useShortcut } from '@wordpress/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import { useValidations } from '../../../../contexts/validation-context';
import { WPError } from '../../../../hooks/use-error-handler';
import { SaveDraftButtonProps } from '../../save-draft-button';
import { recordProductEvent } from '../../../../utils/record-product-event';
import { formatProductError } from '../../../../utils/format-product-error';

export function useSaveDraft( {
	productStatus,
	productType = 'product',
	disabled,
	onClick,
	onSaveSuccess,
	onSaveError,
	...props
}: SaveDraftButtonProps & {
	onSaveSuccess?( product: Product ): void;
	onSaveError?( error: WPError ): void;
} ): React.ComponentProps< typeof Button > {
	const [ productId ] = useEntityProp< number >(
		'postType',
		productType,
		'id'
	);

	const { hasEdits, isDisabled } = useSelect(
		( select ) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const { hasEditsForEntityRecord, isSavingEntityRecord } = select(
				'core'
			) as {
				hasEditsForEntityRecord: (
					kind: string,
					name: string,
					recordId: number
				) => boolean;
				isSavingEntityRecord: (
					kind: string,
					name: string,
					recordId: number
				) => boolean;
			};
			const isSaving = isSavingEntityRecord(
				'postType',
				productType,
				productId
			);

			return {
				isDisabled: isSaving,
				hasEdits: hasEditsForEntityRecord(
					'postType',
					productType,
					productId
				),
			};
		},
		[ productId ]
	);

	const { isValidating, validate } = useValidations< Product >();

	const ariaDisabled =
		disabled ||
		isDisabled ||
		( productStatus !== 'publish' && ! hasEdits ) ||
		isValidating;

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { editEntityRecord, saveEditedEntityRecord } = useDispatch( 'core' );

	const productStatusMap: {
		[ key in Product[ 'status' ] ]?: string;
	} = {
		publish: 'product_switch_draft',
		draft: 'product_save_draft',
	};

	async function saveDraft() {
		try {
			await validate( { status: 'draft' } );

			await editEntityRecord( 'postType', productType, productId, {
				status: 'draft',
			} );
			const publishedProduct = await saveEditedEntityRecord(
				'postType',
				productType,
				productId,
				{
					throwOnError: true,
				}
			);

			const eventName = productStatusMap[ productStatus ];
			if ( eventName ) {
				recordProductEvent( eventName, publishedProduct );
			}

			if ( onSaveSuccess ) {
				onSaveSuccess( publishedProduct );
			}
		} catch ( error ) {
			if ( onSaveError ) {
				onSaveError(
					formatProductError(
						error as WPError,
						productStatus
					) as WPError
				);
			}
		}
	}

	async function handleClick( event: MouseEvent< HTMLButtonElement > ) {
		if ( ariaDisabled ) {
			return event.preventDefault();
		}

		if ( onClick ) {
			onClick( event );
		}
		await saveDraft();
	}

	let children: ReactNode;
	if ( productStatus === 'publish' ) {
		children = __( 'Switch to draft', 'woocommerce' );
	} else if ( hasEdits || productStatus === 'auto-draft' ) {
		children = __( 'Save draft', 'woocommerce' );
	} else {
		children = (
			<>
				<Icon icon={ check } />
				{ __( 'Saved', 'woocommerce' ) }
			</>
		);
	}

	useShortcut( 'core/editor/save', ( event ) => {
		event.preventDefault();
		if (
			! ariaDisabled &&
			( productStatus === 'draft' || productStatus === 'auto-draft' )
		) {
			saveDraft();
		}
	} );

	return {
		children,
		...props,
		'aria-disabled': ariaDisabled,
		variant: 'tertiary',
		onClick: handleClick,
	};
}
