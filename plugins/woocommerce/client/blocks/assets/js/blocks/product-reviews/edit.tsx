/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { InnerBlockTemplate } from '@wordpress/blocks';

const TEMPLATE: InnerBlockTemplate[] = [
	[ 'core/comments-title' ],
	[
		'core/comment-template',
		{
			__woocommerceNamespace: 'woocommerce/product-review-template',
		},
		[
			[
				'core/columns',
				{},
				[
					[
						'core/column',
						{ width: '40px' },
						[
							[
								'core/avatar',
								{
									size: 40,
									style: {
										border: { radius: '20px' },
									},
								},
							],
						],
					],
					[
						'core/column',
						{},
						[
							[
								'core/comment-author-name',
								{
									fontSize: 'small',
									__woocommerceNamespace:
										'woocommerce/product-review-author-name',
								},
							],
							[
								'core/group',
								{
									layout: { type: 'flex' },
									style: {
										spacing: {
											margin: {
												top: '0px',
												bottom: '0px',
											},
										},
									},
								},
								[
									[
										'core/comment-date',
										{
											fontSize: 'small',
										},
									],
									[
										'core/comment-edit-link',
										{
											fontSize: 'small',
										},
									],
								],
							],
							[ 'core/comment-content' ],
						],
					],
					[
						'core/column',
						{ width: '80px' },
						[ [ 'woocommerce/product-review-rating' ] ],
					],
				],
			],
		],
	],
	[ 'core/comments-pagination' ],
	[ 'woocommerce/product-review-form' ],
];

const Edit = () => {
	return <InnerBlocks template={ TEMPLATE } />;
};

export default Edit;
