/**
 * External dependencies
 */
import clsx from 'clsx';
import type { BlockEditProps } from '@wordpress/blocks';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEntityProp } from '@wordpress/core-data';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { resolveSelect } from '@wordpress/data';
import { reviewsStore } from '@woocommerce/data';
import {
	// @ts-expect-error AlignmentControl is not exported from @wordpress/block-editor
	AlignmentControl,
	BlockControls,
	useBlockProps,
	InspectorControls,
	// @ts-expect-error HeadingLevelDropdown is not exported from @wordpress/block-editor
	HeadingLevelDropdown,
} from '@wordpress/block-editor';

type ReviewsTitleProps = BlockEditProps< {
	textAlign: string;
	showPostTitle: boolean;
	showCommentsCount: boolean;
	level: number;
	levelOptions: { label: string; value: number }[];
} > & {
	context: { postId: string; postType: string };
};

export default function Edit( {
	attributes: {
		textAlign,
		showPostTitle,
		showCommentsCount,
		level,
		levelOptions,
	},
	setAttributes,
	context: { postType, postId },
}: ReviewsTitleProps ) {
	const TagName = 'h' + level;
	const [ commentsCount, setCommentsCount ] = useState< number >( 3 );
	const [ rawTitle ] = useEntityProp( 'postType', postType, 'title', postId );
	const isSiteEditor = typeof postId === 'undefined';
	const blockProps = useBlockProps( {
		className: clsx( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
		} ),
	} );

	useEffect( () => {
		if ( isSiteEditor ) {
			setCommentsCount( 3 );
			return;
		}
		resolveSelect( reviewsStore )
			.getReviewsTotalCount( {
				product: [ Number( postId ) ],
			} )
			.then( ( totalCount: number ) => {
				setCommentsCount( totalCount );
			} )
			.catch( () => {
				setCommentsCount( 0 );
			} );
	}, [ postId, isSiteEditor ] );

	const blockControls = (
		// @ts-expect-error BlockControls is not typed.
		<BlockControls group="block">
			<AlignmentControl
				value={ textAlign }
				onChange={ ( newAlign: string ) =>
					setAttributes( { textAlign: newAlign } )
				}
			/>
			<HeadingLevelDropdown
				value={ level }
				options={ levelOptions }
				onChange={ ( newLevel: number ) =>
					setAttributes( { level: newLevel } )
				}
			/>
		</BlockControls>
	);

	const inspectorControls = (
		<InspectorControls>
			<PanelBody title={ __( 'Settings', 'woocommerce' ) }>
				<ToggleControl
					// @ts-expect-error ToggleControl is not typed.
					__nextHasNoMarginBottom
					label={ __( 'Show product title', 'woocommerce' ) }
					checked={ showPostTitle }
					onChange={ ( value ) =>
						setAttributes( { showPostTitle: value } )
					}
				/>
				<ToggleControl
					// @ts-expect-error ToggleControl is not typed.
					__nextHasNoMarginBottom
					label={ __( 'Show reviews count', 'woocommerce' ) }
					checked={ showCommentsCount }
					onChange={ ( value ) =>
						setAttributes( { showCommentsCount: value } )
					}
				/>
			</PanelBody>
		</InspectorControls>
	);

	const postTitle = isSiteEditor
		? __( '“Product Title”', 'woocommerce' )
		: `"${ rawTitle }"`;

	let placeholder;
	if ( showCommentsCount && commentsCount !== undefined ) {
		if ( showPostTitle ) {
			if ( commentsCount === 1 ) {
				placeholder = sprintf(
					/* translators: %s: Post title. */
					__( 'One review to %s', 'woocommerce' ),
					postTitle
				);
			} else {
				placeholder = sprintf(
					/* translators: 1: Number of comments, 2: Post title. */
					_n(
						'%1$s review to %2$s',
						'%1$s reviews to %2$s',
						commentsCount,
						'woocommerce'
					),
					commentsCount,
					postTitle
				);
			}
		} else if ( commentsCount === 1 ) {
			placeholder = __( 'One review', 'woocommerce' );
		} else {
			placeholder = sprintf(
				/* translators: %s: Number of reviews. */
				_n( '%s review', '%s reviews', commentsCount, 'woocommerce' ),
				commentsCount
			);
		}
	} else if ( showPostTitle ) {
		if ( commentsCount === 1 ) {
			placeholder = sprintf(
				/* translators: %s: Post title. */
				__( 'Review to %s', 'woocommerce' ),
				postTitle
			);
		} else {
			placeholder = sprintf(
				/* translators: %s: Post title. */
				__( 'Reviews to %s', 'woocommerce' ),
				postTitle
			);
		}
	} else if ( commentsCount === 1 ) {
		placeholder = __( 'Review', 'woocommerce' );
	} else {
		placeholder = __( 'Reviews', 'woocommerce' );
	}

	return (
		<>
			{ blockControls }
			{ inspectorControls }
			<TagName { ...blockProps }>{ placeholder }</TagName>
		</>
	);
}
