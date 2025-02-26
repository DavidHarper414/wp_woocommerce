/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import Button from '@woocommerce/base-components/button';
import { useState } from '@wordpress/element';
import isShallowEqual from '@wordpress/is-shallow-equal';
import type { ShippingAddress, FormFields } from '@woocommerce/settings';
import { validationStore, CART_STORE_KEY } from '@woocommerce/block-data';
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
	onUpdate: ( address: ShippingAddress ) => void;
	onCancel: () => void;
	addressFields: Partial< keyof FormFields >[];
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
					select( CART_STORE_KEY ).isCustomerDataUpdating(),
			};
		}
	);
	const { defaultFields } = useCheckoutAddress();
	const formFields = useFormFields(
		addressFields,
		defaultFields,
		'shipping',
		address.country
	);

	const hasRequiredFields = () => {
		const requiredFields = formFields
			.filter( ( field ) => field.required && ! field.hidden )
			.map( ( field ) => field.key );
		return requiredFields.every(
			( field ) => address[ field ] && address[ field ].trim() !== ''
		);
	};

	const validateSubmit = () => {
		showAllValidationErrors();
		return ! hasValidationErrors && hasRequiredFields();
	};

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
				onClick={ ( e ) => {
					e.preventDefault();

					const addressChanged = ! isShallowEqual(
						address,
						initialAddress
					);
					const isAddressValid = validateSubmit();

					if ( isAddressValid ) {
						if ( ! addressChanged ) {
							return onCancel();
						}

						const addressToSubmit = addressFields.reduce(
							( acc, key ) => {
								if ( typeof address[ key ] !== 'undefined' ) {
									acc[ key ] = address[ key ];
								}
								return acc;
							},
							{} as ShippingAddress
						);

						onUpdate( addressToSubmit );
					}
				} }
				type="submit"
			>
				{ __( 'Check delivery options', 'woocommerce' ) }
			</Button>
		</form>
	);
};

export default ShippingCalculatorAddress;
