/**
 * External dependencies
 */
import { useCallback } from '@wordpress/element';
import type {
	ValidationData,
	ValidationContextError,
} from '@woocommerce/types';
import { useDispatch, useSelect } from '@wordpress/data';
import { validationStore } from '@woocommerce/block-data';

/**
 * Custom hook for setting for adding errors to the validation system.
 */
export const useValidation = (): ValidationData => {
	const { clearValidationError, hideValidationError, setValidationErrors } =
		useDispatch( validationStore );

	const prefix = 'extensions-errors';

	const { hasValidationErrors, getValidationError } = useSelect(
		( mapSelect ) => {
			const store = mapSelect( validationStore );
			return {
				hasValidationErrors: store.hasValidationErrors(),
				getValidationError: ( validationErrorId: string ) =>
					store.getValidationError(
						`${ prefix }-${ validationErrorId }`
					),
			};
		}
	);

	return {
		hasValidationErrors,
		getValidationError,
		clearValidationError: useCallback(
			( validationErrorId: string ) =>
				clearValidationError( `${ prefix }-${ validationErrorId }` ),
			[ clearValidationError ]
		),
		hideValidationError: useCallback(
			( validationErrorId: string ) =>
				hideValidationError( `${ prefix }-${ validationErrorId }` ),
			[ hideValidationError ]
		),
		setValidationErrors: useCallback(
			( errorsObject: Record< string, ValidationContextError > ) =>
				setValidationErrors(
					Object.fromEntries(
						Object.entries( errorsObject ).map(
							( [ validationErrorId, error ] ) => [
								`${ prefix }-${ validationErrorId }`,
								error,
							]
						)
					)
				),
			[ setValidationErrors ]
		),
	};
};
