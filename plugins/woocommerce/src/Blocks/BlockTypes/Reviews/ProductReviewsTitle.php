<?php
namespace Automattic\WooCommerce\Blocks\BlockTypes\Reviews;

use Automattic\WooCommerce\Blocks\BlockTypes\AbstractBlock;

/**
 * ProductReviewsTitle class.
 */
class ProductReviewsTitle extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'product-reviews-title';

	/**
	 * Get the frontend style handle for this block type.
	 *
	 * @return string[]|null
	 */
	protected function get_block_type_style() {
		return null;
	}

	/**
	 * Render the block.
	 *
	 * @param array $attributes Block attributes.
	 * @return string Rendered block content.
	 */
	protected function render( $attributes, $content, $block ) {
		if ( post_password_required() ) {
			return;
		}
	
		$align_class_name    = empty( $attributes['textAlign'] ) ? '' : "has-text-align-{$attributes['textAlign']}";
		$show_post_title     = ! empty( $attributes['showPostTitle'] ) && $attributes['showPostTitle'];
		$show_comments_count = ! empty( $attributes['showCommentsCount'] ) && $attributes['showCommentsCount'];
		$wrapper_attributes  = get_block_wrapper_attributes( array( 'class' => $align_class_name ) );
		$comments_count      = get_comments_number();
		/* translators: %s: Post title. */
		$post_title = sprintf( __( '&#8220;%s&#8221;' ), get_the_title() );
		$tag_name   = 'h2';
		if ( isset( $attributes['level'] ) ) {
			$tag_name = 'h' . $attributes['level'];
		}
	
		if ( '0' === $comments_count ) {
			return;
		}
	
		if ( $show_comments_count ) {
			if ( $show_post_title ) {
				if ( '1' === $comments_count ) {
					/* translators: %s: Post title. */
					$comments_title = sprintf( __( 'One review to %s' ), $post_title );
				} else {
					$comments_title = sprintf(
						/* translators: 1: Number of comments, 2: Post title. */
						_n(
							'%1$s review to %2$s',
							'%1$s reviews to %2$s',
							$comments_count
						),
						number_format_i18n( $comments_count ),
						$post_title
					);
				}
			} elseif ( '1' === $comments_count ) {
				$comments_title = __( 'One review' );
			} else {
				$comments_title = sprintf(
					/* translators: %s: Number of comments. */
					_n( '%s review', '%s reviews', $comments_count ),
					number_format_i18n( $comments_count )
				);
			}
		} elseif ( $show_post_title ) {
			if ( '1' === $comments_count ) {
				/* translators: %s: Post title. */
				$comments_title = sprintf( __( 'Review to %s' ), $post_title );
			} else {
				/* translators: %s: Post title. */
				$comments_title = sprintf( __( 'Reviews to %s' ), $post_title );
			}
		} elseif ( '1' === $comments_count ) {
			$comments_title = __( 'Review' );
		} else {
			$comments_title = __( 'Reviews' );
		}
	
		return sprintf(
			'<%1$s id="reviews" %2$s>%3$s</%1$s>',
			$tag_name,
			$wrapper_attributes,
			$comments_title
		);
	}
}
