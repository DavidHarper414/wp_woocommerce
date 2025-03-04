/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import {
	CORE_NAME,
	VARIATION_NAME,
	PLACEHOLDER_TEXT,
	ExtendedBlockEditProps,
} from './constants';

const withProductDescriptionEdit =
	( BlockEdit: React.ComponentType< ExtendedBlockEditProps > ) =>
	( props: ExtendedBlockEditProps ) => {
		const {
			name,
			context,
			attributes,
			__unstableLayoutClassNames: layoutClassNames,
		} = props;

		// If this is not our variation, return the original BlockEdit
		if (
			name !== CORE_NAME ||
			attributes.__woocommerceNamespace !== VARIATION_NAME
		) {
			return <BlockEdit { ...props } />;
		}

		// If we have context, it means we're in a product context, so render the original BlockEdit of core/post-content
		if ( context?.postId && context?.postType ) {
			return <BlockEdit { ...props } />;
		}

		const blockProps = useBlockProps( {
			className: clsx(
				layoutClassNames,
				'wc-block-product-description__placeholder'
			),
		} );

		// Otherwise, render our custom placeholder
		return (
			<div { ...blockProps }>
				<p>{ PLACEHOLDER_TEXT }</p>
			</div>
		);
	};

export default withProductDescriptionEdit;
