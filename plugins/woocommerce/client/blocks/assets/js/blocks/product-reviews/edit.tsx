/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { InnerBlockTemplate } from '@wordpress/blocks';

const TEMPLATE: InnerBlockTemplate[] = [
	[ 'core/comments-title' ],
	[
		'core/comment-template',
		{},
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
								'woocommerce/product-review-author-name',
								{
									fontSize: 'small',
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
							[
								'core/comment-reply-link',
								{
									fontSize: 'small',
								},
							],
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
