/**
 * External dependencies
 */
import type { PropsWithChildren } from 'react';
import { createContext, useContext } from '@wordpress/element';
import type { ProductResponseAttributeItem } from '@woocommerce/types';

interface AttributeDataContextProviderProps {
	attribute: ProductResponseAttributeItem | null;
	hasContext: boolean;
}

const AttributeDataContext = createContext< AttributeDataContextProviderProps >(
	{
		hasContext: false,
		attribute: null,
	}
);

export const AttributeDataContextProvider = ( {
	children,
	attribute,
}: PropsWithChildren< AttributeDataContextProviderProps > ) => {
	const contextValue = {
		hasContext: true,
		attribute,
	};

	return (
		<AttributeDataContext.Provider value={ contextValue }>
			{ children }
		</AttributeDataContext.Provider>
	);
};

export function useAttributeDataContext() {
	return useContext( AttributeDataContext );
}
