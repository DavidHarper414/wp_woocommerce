/**
 * External dependencies
 */
import { UseSelectStateChangeOptions, UseSelectProps } from 'downshift';
import { RefObject } from 'react';

export interface Item {
	key: string;
	name?: string;
	className?: string;
	style?: React.CSSProperties;
}

export interface ControlProps< ItemType > {
	name?: string;
	className?: string;
	label: string;
	describedBy?: string;
	options: ItemType[];
	value: ItemType;
	placeholder?: string;
	onChange: ( value: string ) => void;
	children?: ( item: ItemType ) => JSX.Element;
}

export interface UseSelectStateChangeOptionsProps< ItemType >
	extends UseSelectStateChangeOptions< ItemType > {
	props: {
		items: ItemType[];
		refs: {
			searchRef: RefObject< HTMLInputElement >;
		};
	};
}

export interface ExtendedUseSelectProps< ItemType >
	extends UseSelectProps< ItemType > {
	refs: {
		searchRef: RefObject< HTMLInputElement >;
	};
}
