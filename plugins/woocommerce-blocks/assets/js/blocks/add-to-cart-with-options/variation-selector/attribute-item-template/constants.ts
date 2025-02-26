/**
 * External dependencies
 */
import type { TemplateArray } from '@wordpress/blocks';

export const ATTRIBUTE_ITEM_TEMPLATE: TemplateArray = [
	[
		'woocommerce/add-to-cart-with-options-variation-selector-item',
		{},
		[
			[
				'core/group',
				{
					layout: {
						type: 'flex',
						orientation: 'vertical',
						flexWrap: 'nowrap',
					},
					style: {
						spacing: {
							blockGap: '0.5rem',
							margin: {
								top: '1rem',
								bottom: '1rem',
							},
						},
					},
				},
				[
					[
						'woocommerce/add-to-cart-with-options-variation-selector-attribute-name',
						{
							fontSize: 'medium',
							textColor: 'accent-4',
						},
					],
					[
						'woocommerce/add-to-cart-with-options-variation-selector-attribute-options',
					],
				],
			],
		],
	],
];
