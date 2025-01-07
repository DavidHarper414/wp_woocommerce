/**
 * External dependencies
 */
import React from 'react';
import { Slot, Fill } from '@wordpress/components';
import { createElement, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { createOrderedChildren, sortFillsByOrder } from '../../utils';
import { ProductFillLocationType } from '../woo-product-tab-item';

type FillProps = Record< string, unknown > | undefined;

type WooProductSectionItemProps = {
	id: string;
	tabs: ProductFillLocationType[];
	pluginId: string;
};

type WooProductSectionSlotProps = {
	tab: string;
};

const DEFAULT_SECTION_ORDER = 20;

export const WooProductSectionItem: React.FC< WooProductSectionItemProps > & {
	Slot: React.FC<
		React.ComponentProps< typeof Slot > & WooProductSectionSlotProps
	>;
} = ( { children, tabs } ) => {
	return (
		<>
			{ tabs.map( ( { name: tabName, order: sectionOrder } ) => (
				<Fill
					name={ `woocommerce_product_section_${ tabName }` }
					key={ tabName }
				>
					{ ( fillProps: FillProps ) => {
						return createOrderedChildren<
							FillProps & { tabName: string }
						>( children, sectionOrder || DEFAULT_SECTION_ORDER, {
							tabName,
							...fillProps,
						} );
					} }
				</Fill>
			) ) }
		</>
	);
};

WooProductSectionItem.Slot = ( { fillProps, tab } ) => (
	<Slot
		name={ `woocommerce_product_section_${ tab }` }
		fillProps={ fillProps }
	>
		{ ( fills ) => {
			if ( ! sortFillsByOrder ) {
				return null;
			}

			return sortFillsByOrder( fills );
		} }
	</Slot>
);
