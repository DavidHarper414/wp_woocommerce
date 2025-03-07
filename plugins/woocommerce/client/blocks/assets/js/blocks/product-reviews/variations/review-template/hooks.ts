/**
 * External dependencies
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';

// This is limited by WP REST API
const MAX_COMMENTS_PER_PAGE = 100;

/**
 * Return the index of the default page, depending on whether `defaultPage` is
 * `newest` or `oldest`. In the first case, the only way to know the page's
 * index is by using the `X-WP-TotalPages` header, which forces to make an
 * additional request.
 *
 * @param {Object} props             Hook props.
 * @param {string} props.defaultPage Page shown by default (newest/oldest).
 * @param {number} props.postId      ID of the post that contains the comments.
 * @param {number} props.perPage     The number of comments included per page.
 * @param {Object} props.queryArgs   Other query args.
 *
 * @return {number} Index of the default comments page.
 */
const useDefaultPageIndex = ( {
	defaultPage,
	postId,
	perPage,
	queryArgs,
}: {
	defaultPage: string;
	postId: number;
	perPage: number;
	queryArgs: Record< string, unknown >;
} ) => {
	// Store the default page indices.
	const [ defaultPages, setDefaultPages ] = useState<
		Record< string, number >
	>( {} );
	const key = `${ postId }_${ perPage }`;
	const page = defaultPages[ key ] || 0;

	useEffect( () => {
		// Do nothing if the page is already known or not the newest page.
		if ( page || defaultPage !== 'newest' ) {
			return;
		}
		// We need to fetch comments to know the index. Use HEAD and limit
		// fields just to ID, to make this call as light as possible.
		apiFetch( {
			path: addQueryArgs( '/wc/v3/products/reviews', {
				...queryArgs,
				post: postId,
				per_page: perPage,
				_fields: 'id',
			} ),
			method: 'HEAD',
			parse: false,
		} ).then( ( res ) => {
			// @ts-expect-error headers is not available on the response object
			const pages = parseInt( res.headers.get( 'X-WP-TotalPages' ), 10 );
			setDefaultPages( {
				...defaultPages,
				[ key ]: pages <= 1 ? 1 : pages, // If there are 0 pages, it means that there are no comments, but there is no 0th page.
			} );
		} );
	}, [ defaultPage, postId, perPage, setDefaultPages ] );

	// The oldest one is always the first one.
	return defaultPage === 'newest' ? page : 1;
};

/**
 * Return an object with the query args needed to fetch the default page of
 * comments.
 *
 * @param {Object} props        Hook props.
 * @param {number} props.postId ID of the post that contains the comments.
 *                              discussion settings.
 *
 * @return {Object} Query args to retrieve the comments.
 */
export const useReviewQueryArgs = ( {
	postId,
}: {
	postId: number | undefined;
} ) => {
	// Initialize the query args that are not going to change.
	const queryArgs = {
		status: 'approved' as const,
		order: 'asc' as const,
		context: 'view' as const,
		parent: 0,
	};

	// Get the Discussion settings that may be needed to query the comments.
	const {
		pageComments,
		commentsPerPage,
		defaultCommentsPage: defaultPage,
	} = useSelect( ( select ) => {
		// @ts-expect-error getSettings is not exported from @wordpress/block-editor
		const { getSettings } = select( blockEditorStore );
		const { __experimentalDiscussionSettings } = getSettings();
		return __experimentalDiscussionSettings;
	}, [] );

	// WP REST API doesn't allow fetching more than max items limit set per single page of data.
	// As for the editor performance is more important than completeness of data and fetching only the
	// max allowed for single page should be enough for the purpose of design and laying out the page.
	// Fetching over the limit would return an error here but would work with backend query.
	const perPage = pageComments
		? Math.min( commentsPerPage, MAX_COMMENTS_PER_PAGE )
		: MAX_COMMENTS_PER_PAGE;

	// Get the number of the default page.
	const page = useDefaultPageIndex( {
		defaultPage,
		postId: postId || -1,
		perPage,
		queryArgs,
	} );

	// Merge, memoize and return all query arguments, unless the default page's
	// number is not known yet.
	return useMemo( () => {
		return page
			? {
					...queryArgs,
					product: postId ? [ postId ] : [],
					per_page: perPage,
					page,
			  }
			: null;
	}, [ postId, perPage, page ] );
};
