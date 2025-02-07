/**
 * External dependencies
 */
import {
	KeyedFormField,
	FormFields,
	AdditionalValues,
	BillingAddress,
	ShippingAddress,
} from '@woocommerce/settings';
import {
	useSchemaParser,
	DocumentObject,
	usePrevious,
} from '@woocommerce/base-hooks';
import type { JSONSchemaType, ErrorObject } from 'ajv';
import { __, sprintf, getLocaleData } from '@wordpress/i18n';
import { useRef } from '@wordpress/element';
import fastDeepEqual from 'fast-deep-equal/es6';
import { isPostcode } from '@woocommerce/blocks-checkout';
import { isEmail } from '@wordpress/url';

const getFieldLabelCasing = ( fieldLabel: string ): string => {
	const localeData = getLocaleData();
	const shouldKeepOriginalCase = [ 'de', 'de_AT', 'de_CH' ].includes(
		localeData?.[ '' ]?.lang ?? 'en'
	);

	return shouldKeepOriginalCase ? fieldLabel : fieldLabel.toLowerCase();
};

/**
 * Get the key of the field from the instance path.
 *
 * @param instancePath The instance path of the error.
 * @return string The key of the field.
 */
const getFieldKey = (
	instancePath: ErrorObject[ 'instancePath' ]
): keyof FormFields => {
	return instancePath
		.split( '/' )
		.pop()
		?.replace( '~1', '/' ) as keyof FormFields;
};

const getErrorsMap = (
	errors: ErrorObject[],
	formFields: KeyedFormField[]
): Record< KeyedFormField[ 'key' ], string > => {
	return errors.reduce( ( acc, error ) => {
		const fieldKey = getFieldKey( error.instancePath );
		const formField = formFields.find(
			( field ) => field.key === fieldKey
		);
		if ( ! formField ) {
			return acc;
		}

		const fieldLabel = getFieldLabelCasing( formField.label );
		const defaultMessage = sprintf(
			// translators: %s is the label of the field.
			__( '%s is invalid', 'woocommerce' ),
			fieldLabel
		);
		if ( fieldKey ) {
			switch ( error.keyword ) {
				case 'errorMessage':
					acc[ fieldKey ] = error.message ?? defaultMessage;
					break;
				case 'pattern':
					acc[ fieldKey ] = sprintf(
						// translators: %1$s is the label of the field, %2$s is the pattern.
						__( '%1$s must match the pattern %2$s', 'woocommerce' ),
						fieldLabel,
						error.params.pattern
					);
					break;
				default:
					acc[ fieldKey ] = defaultMessage;
					break;
			}
		}

		return acc;
	}, {} as Record< keyof FormFields, string > );
};

const EMPTY_OBJECT = {} as Record< keyof FormFields, string >;
/**
 * Combines address fields, including fields from the locale, and sorts them by index.
 */
export const useFormValidation = (
	formFields: KeyedFormField[],
	// Form type, can be billing, shipping, contact, additional-information, or calculator.
	formType:
		| 'billing'
		| 'shipping'
		| 'contact'
		| 'additional-information'
		| 'calculator'
): {
	errors: Record< keyof FormFields, string >;
	previousErrors: Record< keyof FormFields, string > | undefined;
} => {
	const { parser, data } = useSchemaParser( formType );
	const currentResults =
		useRef< Record< keyof FormFields, string > >( EMPTY_OBJECT );
	const previousErrors = usePrevious( currentResults.current );

	if ( ! data ) {
		return {
			errors: currentResults.current,
			previousErrors,
		};
	}

	let values = {} as BillingAddress | ShippingAddress | AdditionalValues;
	switch ( formType ) {
		case 'billing':
		case 'shipping':
			values = data.customer
				.address as DocumentObject< 'billing' >[ 'customer' ][ 'address' ];
			break;
		case 'contact':
		case 'additional-information':
			values = data.checkout.additional_fields;
			break;
		default:
			values = {} as Record< keyof FormFields, string >;
			break;
	}

	const partialSchema = formFields.reduce( ( acc, field ) => {
		if (
			! field.hidden &&
			typeof field.rules?.validation === 'object' &&
			! Array.isArray( field.rules.validation ) &&
			( field.required || values[ field.key as keyof typeof values ] )
		) {
			acc[ field.key ] = field.rules.validation;
		}
		return acc;
	}, {} as Record< keyof FormFields, JSONSchemaType< DocumentObject< typeof formType > > > );

	let schemaErrorsMap = EMPTY_OBJECT;

	if ( Object.keys( partialSchema ).length > 0 && parser ) {
		const schema = {
			type: 'object',
			properties: {},
		};
		switch ( formType ) {
			case 'shipping':
				schema.properties = {
					customer: {
						type: 'object',
						properties: {
							shipping_address: {
								type: 'object',
								properties: partialSchema,
							},
						},
					},
				};
				break;
			case 'billing':
				schema.properties = {
					customer: {
						type: 'object',
						properties: {
							billing_address: {
								type: 'object',
								properties: partialSchema,
							},
						},
					},
				};
				break;
			default:
				schema.properties = {
					checkout: {
						type: 'object',
						properties: {
							additional_fields: {
								type: 'object',
								properties: partialSchema,
							},
						},
					},
				};
				break;
		}
		const validate = parser.compile( schema );
		const result = validate( data );

		// console.log( 'extra errors:', customValidation );
		if ( ! result && validate.errors ) {
			schemaErrorsMap = getErrorsMap( validate.errors, formFields );
		} else {
			schemaErrorsMap = EMPTY_OBJECT;
		}
	}

	const customValidation =
		values &&
		formFields
			.map( ( field ) => {
				if ( schemaErrorsMap[ field.key ] ) {
					return [ field.key, schemaErrorsMap[ field.key ] ];
				}

				// Pass validation if the field is not required and is empty.
				if (
					! field.required &&
					! values[ field.key as keyof typeof values ]
				) {
					return null;
				}

				if (
					field.key === 'postcode' &&
					'country' in values &&
					! isPostcode( {
						postcode: values.postcode,
						country: values.country,
					} )
				) {
					return [
						field.key,
						__( 'Please enter a valid postcode', 'woocommerce' ),
					];
				}

				if (
					field.key === 'email' &&
					'email' in values &&
					! isEmail( values.email )
				) {
					return [
						field.key,
						__(
							'Please enter a valid email address',
							'woocommerce'
						),
					];
				}

				return null;
			} )
			.filter( Boolean );

	if (
		! fastDeepEqual(
			currentResults.current,
			Object.fromEntries(
				customValidation as [ keyof FormFields, string ][]
			)
		)
	) {
		currentResults.current = Object.fromEntries(
			customValidation as [ keyof FormFields, string ][]
		) as Record< keyof FormFields, string >;
	}

	return {
		errors: currentResults.current,
		previousErrors,
	};
};
