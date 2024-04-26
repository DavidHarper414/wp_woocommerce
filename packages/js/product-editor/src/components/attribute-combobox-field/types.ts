/**
 * External dependencies
 */
import type { ProductAttribute } from '@woocommerce/data';

/*
 * Define the attributes combobox control item type,
 * which is a combination of the product attribute and
 * additional properties.
 */
export type AttributesComboboxControlItem = ProductAttribute & {
	isDisabled?: boolean;
};

export type AttributesComboboxControlComponent = {
	label?: string;
	help?: JSX.Element | string | null;
	isLoading: boolean;
	placeholder?: string;
	disabled?: boolean;
	instanceNumber?: number;

	current?: AttributesComboboxControlItem;
	items: AttributesComboboxControlItem[];

	disabledAttributeMessage?: string;
	createNewAttributesAsGlobal?: boolean;

	onChange: ( value?: AttributesComboboxControlItem ) => void;
};

export type ComboboxControlOption = {
	label: string;
	value: string;
	state?: 'draft' | 'creating' | 'justCreated';
	disabled?: boolean;
};
