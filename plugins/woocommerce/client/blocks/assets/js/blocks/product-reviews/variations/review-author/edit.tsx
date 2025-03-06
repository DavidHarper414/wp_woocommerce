/**
 * External dependencies
 */
import {
	AlignmentControl,
	BlockControls,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { CORE_NAME, VARIATION_NAME, ExtendedBlockEditProps } from './constants';

const withProductReviewAuthorEdit =
	( BlockEdit: React.ComponentType< ExtendedBlockEditProps > ) =>
	( props: ExtendedBlockEditProps ) => {
		const {
			name,
			context,
			attributes,
			setAttributes,
			// __unstableLayoutClassNames: layoutClassNames,
		} = props;

		let displayName = useSelect(
			( select ) => {
				const { getEntityRecord } = select( coreStore );

				const comment:
					| {
							author_name: string;
							author: string;
					  }
					| undefined = getEntityRecord(
					'root',
					'comment',
					context?.commentId
				);
				const authorName = comment?.author_name; // eslint-disable-line camelcase

				if ( comment && ! authorName ) {
					const user: { name: string } | undefined = getEntityRecord(
						'root',
						'user',
						comment.author
					);
					return user?.name ?? __( 'Anonymous', 'woocommerce' );
				}
				return authorName ?? '';
			},
			[ context?.commentId ]
		);

		// If this is not our variation, return the original BlockEdit
		if (
			name !== CORE_NAME ||
			attributes.__woocommerceNamespace !== VARIATION_NAME
		) {
			return <BlockEdit { ...props } />;
		}

		const blockProps = useBlockProps( {
			className: clsx( {
				[ `has-text-align-${ attributes.textAlign }` ]:
					attributes.textAlign,
			} ),
		} );

		const blockControls = (
			<BlockControls group="block">
				<AlignmentControl
					value={ attributes.textAlign }
					onChange={ ( newAlign: string ) =>
						setAttributes( { textAlign: newAlign } )
					}
				/>
			</BlockControls>
		);

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'woocommerce' ) }>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Link to authors URL', 'woocommerce' ) }
						onChange={ () =>
							setAttributes( { isLink: ! attributes.isLink } )
						}
						checked={ attributes.isLink }
					/>
					{ attributes.isLink && (
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Open in new tab', 'woocommerce' ) }
							onChange={ ( value ) =>
								setAttributes( {
									linkTarget: value ? '_blank' : '_self',
								} )
							}
							checked={ attributes.linkTarget === '_blank' }
						/>
					) }
				</PanelBody>
			</InspectorControls>
		);

		if ( ! context?.commentId || ! displayName ) {
			displayName = _x(
				'Product Review Author',
				'block title',
				'woocommerce'
			);
		}

		const displayAuthor = attributes.isLink ? (
			<a
				href="#comment-author-pseudo-link"
				onClick={ ( event ) => event.preventDefault() }
			>
				{ displayName }
			</a>
		) : (
			displayName
		);
		return (
			<>
				{ inspectorControls }
				{ blockControls }
				<div { ...blockProps }>{ displayAuthor }</div>
			</>
		);
	};

export default withProductReviewAuthorEdit;
