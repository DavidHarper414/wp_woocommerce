<?php
namespace Automattic\WooCommerce\Blocks\BlockTypes;

/**
 * ComingSoon class.
 */
class ComingSoon extends AbstractBlock {
	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'coming-soon';

	/**
	 * It is necessary to register and enqueue assets during the render phase because we want to load assets only if the block has the content.
	 */
	protected function register_block_type_assets() {
			parent::register_block_type_assets();
			$this->register_chunk_translations( [ $this->block_name ] );
	}

	/**
	 * Enqueue frontend assets for this block, just in time for rendering.
	 *
	 * @internal This prevents the block script being enqueued on all pages. It is only enqueued as needed. Note that
	 * we intentionally do not pass 'script' to register_block_type.
	 *
	 * @param array    $attributes  Any attributes that currently are available from the block.
	 * @param string   $content    The block content.
	 * @param WP_Block $block    The block object.
	 */
	protected function enqueue_assets( array $attributes, $content, $block ) {
		parent::enqueue_assets( $attributes, $content, $block );

		if ( isset( $attributes['style']['color']['background'] ) ) {
			wp_add_inline_style(
				'wc-blocks-style',
				':root{--woocommerce-coming-soon-color: ' . esc_html( $attributes['style']['color']['background'] ) . '}'
			);
		} else if ( isset( $attributes['color'] ) ) {
			// Deprecated: To support coming soon templates created before WooCommerce 9.8.0
			wp_add_inline_style(
				'wc-blocks-style',
				':root{--woocommerce-coming-soon-color: ' . esc_html( $attributes['color'] ) . '}'
			);
			wp_enqueue_style(
				'woocommerce-coming-soon',
				WC()->plugin_url() . '/assets/css/coming-soon-entire-site-deprecated' . ( is_rtl() ? '-rtl' : '' ) . '.css',
				array(),
			);
		}
	}

	/**
	 * Enqueue assets used for rendering the block in editor context.
	 *
	 * This is needed if a block is not yet within the post content--`render` and `enqueue_assets` may not have ran.
	 */
	public function enqueue_editor_assets() {
		if ( $this->enqueued_assets ) {
			return;
		}
		parent::enqueue_editor_assets();

		if ( ! is_admin() ) {
			return;
		}

		$current_screen = get_current_screen();
		if ( $current_screen instanceof \WP_Screen && 'site-editor' === $current_screen->base ) {
			$post_id = isset( $_REQUEST['postId'] ) ? wc_clean( wp_unslash( $_REQUEST['postId'] ) ) : null; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( $post_id === 'woocommerce/woocommerce//coming-soon' ) {
				$block_template = get_block_template( $post_id );
				if ( $block_template && strpos( $block_template->content, '<!-- wp:woocommerce/coming-soon {"color"') !== false ) {
					wp_enqueue_style(
						'woocommerce-coming-soon',
						WC()->plugin_url() . '/assets/css/coming-soon-entire-site-deprecated' . ( is_rtl() ? '-rtl' : '' ) . '.css',
						array(),
					);
				}
			}
		}
	}

	/**
	 * Get the frontend script handle for this block type.
	 *
	 * @see $this->register_block_type()
	 * @param string $key Data to get, or default to everything.
	 * @return array|string|null
	 */
	protected function get_block_type_script( $key = null ) {
		return null;
	}
}
