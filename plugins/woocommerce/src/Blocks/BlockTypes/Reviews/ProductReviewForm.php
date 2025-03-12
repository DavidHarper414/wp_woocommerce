<?php
namespace Automattic\WooCommerce\Blocks\BlockTypes\Reviews;

use Automattic\WooCommerce\Blocks\BlockTypes\AbstractBlock;

/**
 * ProductReviewForm class.
 */
class ProductReviewForm extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'product-review-form';

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
		if ( ! isset( $block->context['postId'] ) ) {
			return '';
		}

		if ( post_password_required( $block->context['postId'] ) ) {
			return;
		}

		$classes = array( 'comment-respond' );
		if ( isset( $attributes['textAlign'] ) ) {
			$classes[] = 'has-text-align-' . $attributes['textAlign'];
		}
		if ( isset( $attributes['style']['elements']['link']['color']['text'] ) ) {
			$classes[] = 'has-link-color';
		}
		$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );

		$commenter    = wp_get_current_commenter();
		$comment_form = array(
			/* translators: %s is product title */
			'title_reply'         => have_comments() ? esc_html__( 'Add a review', 'woocommerce' ) : sprintf( esc_html__( 'Be the first to review &ldquo;%s&rdquo;', 'woocommerce' ), get_the_title() ),
			/* translators: %s is product title */
			'title_reply_to'      => esc_html__( 'Leave a Reply to %s', 'woocommerce' ),
			'title_reply_before'  => '<span id="reply-title" class="comment-reply-title" role="heading" aria-level="3">',
			'title_reply_after'   => '</span>',
			'comment_notes_after' => '',
			'label_submit'        => esc_html__( 'Submit', 'woocommerce' ),
			'logged_in_as'        => '',
			'comment_field'       => '',
		);

		if ( wc_review_ratings_enabled() ) {
			$comment_form['comment_field'] = '<div class="comment-form-rating"><label for="rating" id="comment-form-rating-label">' . 
				esc_html__( 'Your rating', 'woocommerce' ) . 
				( wc_review_ratings_required() ? '&nbsp;<span class="required">*</span>' : '' ) . 
			 '</label><select name="rating" id="rating" required>
					<option value="">' . esc_html__( 'Rate&hellip;', 'woocommerce' ) . '</option>
					<option value="5">' . esc_html__( 'Perfect', 'woocommerce' ) . '</option>
					<option value="4">' . esc_html__( 'Good', 'woocommerce' ) . '</option>
					<option value="3">' . esc_html__( 'Average', 'woocommerce' ) . '</option>
					<option value="2">' . esc_html__( 'Not that bad', 'woocommerce' ) . '</option>
					<option value="1">' . esc_html__( 'Very poor', 'woocommerce' ) . '</option>
				</select></div>';
		}

		$comment_form['comment_field'] .= '<p class="comment-form-comment"><label for="comment">' . esc_html__( 'Your review', 'woocommerce' ) . '&nbsp;<span class="required">*</span></label><textarea id="comment" name="comment" cols="45" rows="8" required></textarea></p>';

		add_filter( 'comment_form_defaults', 'post_comments_form_block_form_defaults' );

		ob_start();
		comment_form( apply_filters( 'woocommerce_product_review_comment_form_args', $comment_form ), $block->context['postId'] );
		$form = ob_get_clean();

		remove_filter( 'comment_form_defaults', 'post_comments_form_block_form_defaults' );

		$form = str_replace( 'class="comment-respond"', $wrapper_attributes, $form );

		wp_enqueue_script( 'comment-reply' );

		return $form;
	}
}
