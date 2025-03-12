/**
 * External dependencies
 */
import { useState, memo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { BlockInstance } from '@wordpress/blocks';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { reviewsStore, ProductReview } from '@woocommerce/data';
import {
	// @ts-expect-error BlockContextProvider is not exported from @wordpress/block-editor
	BlockContextProvider,
	useBlockProps,
	// @ts-expect-error BlockContextProvider is not exported from @wordpress/block-editor
	useInnerBlocksProps,
	store as blockEditorStore,
	// @ts-expect-error __experimentalUseBlockPreview is not exported from @wordpress/block-editor
	__experimentalUseBlockPreview as useBlockPreview,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { CORE_NAME, VARIATION_NAME, ExtendedBlockEditProps } from './constants';
import { useReviewQueryArgs } from './hooks';

const TEMPLATE = [
	[ 'core/avatar' ],
	[ 'woocommerce/product-review-author' ],
	[ 'core/comment-date' ],
	[ 'core/comment-content' ],
	[ 'core/comment-edit-link' ],
];

/**
 * Function that returns a comment structure that will be rendered with default placehoders.
 *
 * Each comment has a `commentId` property that is always a negative number in
 * case of the placeholders. This is to ensure that the comment does not
 * conflict with the actual (real) comments.
 *
 * @param {Object}  settings                       Discussion Settings.
 * @param {number}  [settings.perPage]             - Comments per page setting or block attribute.
 * @param {boolean} [settings.pageComments]        - Enable break comments into pages setting.
 * @param {boolean} [settings.threadComments]      - Enable threaded (nested) comments setting.
 * @param {number}  [settings.threadCommentsDepth] - Level deep of threaded comments.
 *
 * @typedef {{id: null, children: EmptyComment[]}} EmptyComment
 * @return {EmptyComment[]}                 		Inner blocks of the Comment Template
 */
const getCommentsPlaceholder = () => {
	// Add the first comment and its children
	const placeholderComments = [ { id: -1 }, { id: -2 }, { id: -3 } ];

	// In case that the value is set but larger than 3 we truncate it to 3.
	return placeholderComments;
};

const CommentTemplatePreview = ( {
	blocks,
	reviewId,
	setActiveCommentId,
	isHidden,
}: {
	blocks: BlockInstance[];
	reviewId: number;
	setActiveCommentId: ( id: number ) => void;
	isHidden: boolean;
} ) => {
	const blockPreviewProps = useBlockPreview( {
		blocks,
	} );

	const handleOnClick = () => {
		setActiveCommentId( reviewId );
	};

	// We have to hide the preview block if the `comment` props points to
	// the currently active block!

	// Or, to put it differently, every preview block is visible unless it is the
	// currently active block - in this case we render its inner blocks.
	const style = {
		display: isHidden ? 'none' : undefined,
	};

	return (
		<div
			{ ...blockPreviewProps }
			tabIndex={ 0 }
			role="button"
			style={ style }
			// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
			onClick={ handleOnClick }
			onKeyPress={ handleOnClick }
		/>
	);
};

const MemoizedCommentTemplatePreview = memo( CommentTemplatePreview );

/**
 * Component which renders the inner blocks of the Comment Template.
 *
 * @param {Object} props                      Component props.
 * @param {Object} [props.review]            - A comment object.
 * @param {Array}  [props.activeCommentId]    - The ID of the comment that is currently active.
 * @param {Array}  [props.setActiveCommentId] - The setter for activeCommentId.
 * @param {Array}  [props.firstCommentId]     - ID of the first comment in the array.
 * @param {Array}  [props.blocks]             - Array of blocks returned from
 *                                            getBlocks() in parent .
 * @return {Element}                 		Inner blocks of the Comment Template
 */
function CommentTemplateInnerBlocks( {
	review,
	activeCommentId,
	setActiveCommentId,
	firstCommentId,
	blocks,
}: {
	review: Partial< ProductReview >;
	activeCommentId: number;
	setActiveCommentId: ( id: number ) => void;
	firstCommentId: number;
	blocks: BlockInstance[];
} ) {
	const { children, ...innerBlocksProps } = useInnerBlocksProps(
		{},
		{ template: TEMPLATE }
	);

	return (
		<li { ...innerBlocksProps }>
			{ review.id === ( activeCommentId || firstCommentId )
				? children
				: null }

			{ /* To avoid flicker when switching active block contexts, a preview
			 is ALWAYS rendered and the preview for the active block is hidden.
			 This ensures that when switching the active block, the component is not
			 mounted again but rather it only toggles the `isHidden` prop.
			 The same strategy is used for preventing the flicker in the Post Template
			 block. */ }
			<MemoizedCommentTemplatePreview
				blocks={ blocks }
				reviewId={ review.id || 0 }
				setActiveCommentId={ setActiveCommentId }
				isHidden={ review.id === ( activeCommentId || firstCommentId ) }
			/>
		</li>
	);
}

/**
 * Component that renders a list of (nested) comments. It is called recursively.
 *
 * @param {Object} props                      Component props.
 * @param {Array}  [props.reviews]           - Array of comment objects.
 * @param {Array}  [props.blockProps]         - Props from parent's `useBlockProps()`.
 * @param {Array}  [props.activeCommentId]    - The ID of the comment that is currently active.
 * @param {Array}  [props.setActiveCommentId] - The setter for activeCommentId.
 * @param {Array}  [props.blocks]             - Array of blocks returned from getBlocks() in parent.
 * @param {Object} [props.firstCommentId]     - The ID of the first comment in the array of
 *                                            comment objects.
 * @return {Element}                 		List of comments.
 */
const ReviewsList = ( {
	reviews,
	blockProps,
	activeCommentId,
	setActiveCommentId,
	blocks,
	firstCommentId,
}: {
	reviews: Partial< ProductReview >[];
	blockProps: Record< string, unknown >;
	activeCommentId: number;
	setActiveCommentId: ( id: number ) => void;
	blocks: BlockInstance[];
	firstCommentId: number;
} ) => (
	<ol { ...blockProps }>
		{ reviews &&
			reviews.map( ( { id, ...review }, index ) => (
				<BlockContextProvider
					key={ id || index }
					value={ {
						// If the commentId is negative it means that this comment is a
						// "placeholder" and that the block is most likely being used in the
						// site editor. In this case, we have to set the commentId to `null`
						// because otherwise the (non-existent) comment with a negative ID
						// would be requested from the REST API.
						commentId: id && id < 0 ? null : id,
					} }
				>
					<CommentTemplateInnerBlocks
						review={ { id: id || 0, ...review } }
						activeCommentId={ activeCommentId }
						setActiveCommentId={ setActiveCommentId }
						blocks={ blocks }
						firstCommentId={ firstCommentId }
					/>
				</BlockContextProvider>
			) ) }
	</ol>
);

function ReviewTemplateEdit( {
	clientId,
	context: { postId },
}: ExtendedBlockEditProps ) {
	const blockProps = useBlockProps();

	const [ activeCommentId, setActiveCommentId ] = useState( 0 );

	const reviewQuery = useReviewQueryArgs( {
		postId,
	} );

	const { topLevelComments, blocks } = useSelect(
		( select ) => {
			const { getReviews } = select( reviewsStore );
			// @ts-expect-error getBlocks is not exported from @wordpress/block-editor
			const { getBlocks } = select( blockEditorStore );
			return {
				// Request only top-level comments. Replies are embedded.
				topLevelComments:
					reviewQuery && postId !== undefined
						? getReviews( reviewQuery )
						: null,
				blocks: getBlocks( clientId ),
			};
		},
		[ clientId, reviewQuery ]
	);

	// Generate a tree structure of comment IDs.
	let commentTree: Partial< ProductReview >[] | null = topLevelComments;

	if ( ! topLevelComments && postId !== undefined ) {
		return (
			<p { ...blockProps }>
				<Spinner />
			</p>
		);
	}

	if ( ! postId ) {
		commentTree = getCommentsPlaceholder();
	}

	if ( ! commentTree || ! commentTree.length ) {
		return (
			<p { ...blockProps }>
				{ __( 'No reviews found.', 'woocommerce' ) }
			</p>
		);
	}

	return (
		<ReviewsList
			reviews={ commentTree }
			blockProps={ blockProps }
			blocks={ blocks }
			activeCommentId={ activeCommentId || 0 }
			setActiveCommentId={ setActiveCommentId }
			firstCommentId={ commentTree[ 0 ]?.id || 0 }
		/>
	);
}

const withProductReviewAuthorEdit =
	( BlockEdit: React.ComponentType< ExtendedBlockEditProps > ) =>
	( props: ExtendedBlockEditProps ) => {
		const { name, attributes } = props;

		// If this is not our variation, return the original BlockEdit
		if (
			name !== CORE_NAME ||
			attributes.__woocommerceNamespace !== VARIATION_NAME
		) {
			return <BlockEdit { ...props } />;
		}

		return <ReviewTemplateEdit { ...props } />;
	};
export default withProductReviewAuthorEdit;
