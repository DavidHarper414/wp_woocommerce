/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import Button from '@woocommerce/base-components/button';
import { useState, useCallback } from '@wordpress/element';
import isShallowEqual from '@wordpress/is-shallow-equal';
import type { ShippingAddress, AddressForm } from '@woocommerce/settings';
import { validationStore, cartStore } from '@woocommerce/block-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useFocusReturn } from '@woocommerce/base-utils';
import { useCheckoutAddress } from '@woocommerce/base-context';

/**
 * Internal dependencies
 */
import './style.scss';
import { Form } from '../form';
import { useFormFields } from '../form/use-form-fields';

interface ShippingCalculatorAddressProps {
	address: ShippingAddress;
	onUpdate: ( address: Partial< ShippingAddress > ) => void;
	onCancel: () => void;
	addressFields: Partial< keyof AddressForm >[];
}
const ShippingCalculatorAddress = ( {
	address: initialAddress,
	onUpdate,
	onCancel,
	addressFields,
}: ShippingCalculatorAddressProps ): JSX.Element => {
	const [ address, setAddress ] = useState( initialAddress );
	const { showAllValidationErrors } = useDispatch( validationStore );
	const focusReturnRef = useFocusReturn();
	const { hasValidationErrors, isCustomerDataUpdating } = useSelect(
		( select ) => {
			return {
				hasValidationErrors:
					select( validationStore ).hasValidationErrors(),
				isCustomerDataUpdating:
					select( cartStore ).isCustomerDataUpdating(),
			};
		},
		[]
	);
	const { defaultFields } = useCheckoutAddress();
	const formFields = useFormFields(
		addressFields,
		defaultFields,
		'shipping',
		address.country
	);

	const hasRequiredFields = useCallback( () => {
		for ( const field of formFields ) {
			if ( field.required && ! field.hidden ) {
				const value = address[ field.key ];

				if ( typeof value === 'string' ) {
					if ( value.trim() === '' ) {
						return false;
					}
					continue;
				}

				// TODO: Handle boolean fields if needed
				// Currently, any non-string value fails validation
				return false;
			}
		}
		return true;
	}, [ formFields, address ] );

	const validateSubmit = useCallback( () => {
		showAllValidationErrors();
		return ! hasValidationErrors && hasRequiredFields();
	}, [ showAllValidationErrors, hasValidationErrors, hasRequiredFields ] );

	const handleClick = useCallback(
		( e: React.MouseEvent< HTMLButtonElement > ) => {
			e.preventDefault();

			const addressChanged = ! isShallowEqual( address, initialAddress );
			const isAddressValid = validateSubmit();

			if ( isAddressValid ) {
				if ( ! addressChanged ) {
					return onCancel();
				}

				const addressToSubmit = addressFields.reduce<
					Partial< ShippingAddress >
				>( ( acc, key ) => {
					if ( typeof address[ key ] !== 'undefined' ) {
						// This type incompatibility is due to additional fields being able to contain a boolean
						// value. We should clean up these types in the future.
						acc[ key ] = address[ key ];
					}
					return acc;
				}, {} );

				onUpdate( addressToSubmit );
			}
		},
		[
			validateSubmit,
			address,
			initialAddress,
			addressFields,
			onCancel,
			onUpdate,
		]
	);

	return (
		<form
			className="wc-block-components-shipping-calculator-address"
			ref={ focusReturnRef }
		>
			<Form
				fields={ addressFields }
				onChange={ setAddress }
				values={ address }
			/>
			<Button
				className="wc-block-components-shipping-calculator-address__button"
				disabled={ isCustomerDataUpdating }
				variant="outlined"
				onClick={ handleClick }
				type="submit"
			>
				{ __( 'Check delivery options', 'woocommerce' ) }
			</Button>
		</form>
	);
};

export default ShippingCalculatorAddress;
