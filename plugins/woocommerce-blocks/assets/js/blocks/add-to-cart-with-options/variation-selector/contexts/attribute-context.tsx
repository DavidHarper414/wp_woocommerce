/**
 * External dependencies
 */
import type { PropsWithChildren } from 'react';
import { createContext, useContext } from '@wordpress/element';
import type { ProductResponseAttributeItem } from '@woocommerce/types';

export type AttributeContextProps = {
	attribute?: ProductResponseAttributeItem | undefined;
};

const AttributeContext = createContext< AttributeContextProps >( {
	attribute: {
		id: 1,
		name: 'Color',
		taxonomy: 'pa_color',
		has_variations: true,
		terms: [
			{
				id: 1,
				name: 'Beige',
				slug: 'beige',
			},
			{
				id: 2,
				name: 'Green',
				slug: 'green',
			},
			{
				id: 3,
				name: 'Red',
				slug: 'red',
			},
		],
	},
} );

export function AttributeProvider( {
	attribute,
	children,
}: PropsWithChildren< AttributeContextProps > ) {
	return (
		<AttributeContext.Provider value={ { attribute } }>
			{ children }
		</AttributeContext.Provider>
	);
}

export function useAttributeContext() {
	return useContext( AttributeContext );
}
