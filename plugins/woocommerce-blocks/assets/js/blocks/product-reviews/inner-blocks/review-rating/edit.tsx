/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { Disabled } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Renders the `core/comment-content` block on the editor.
 *
 * @param {Object} props                      React props.
 * @param {Object} props.context              Inherited context.
 * @param {string} props.context.commentId    The comment ID.
 *
 * @return {JSX.Element} React element.
 */
export default function Edit( {
	context: { commentId },
}: {
	context: { commentId: string };
} ) {
	const blockProps = useBlockProps();
	const [ content ] = useEntityProp(
		'root',
		'comment',
		'content',
		commentId
	);

	if ( ! commentId || ! content ) {
		return (
			<>
				<div { ...blockProps }>
					<p>{ __( 'Product Review Rating', 'woocommerce' ) }</p>
				</div>
			</>
		);
	}

	return (
		<>
			<div { ...blockProps }>
				<Disabled>
					<RawHTML key="html">{ content.rendered }</RawHTML>
				</Disabled>
			</div>
		</>
	);
}
