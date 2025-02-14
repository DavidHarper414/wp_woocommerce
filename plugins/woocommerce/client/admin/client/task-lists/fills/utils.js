/**
 * Returns true if the merchant has indicated that they have another online shop while filling out the OBW
 */
export const isImportProduct = ( business_choice ) => {
	return (
		window?.wcAdminFeatures?.[ 'import-products-task' ] &&
		business_choice &&
		business_choice === 'im_already_selling'
	);
};
