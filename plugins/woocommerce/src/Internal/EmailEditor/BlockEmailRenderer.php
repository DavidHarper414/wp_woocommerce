<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\EmailEditor;

use Automattic\WooCommerce\Internal\EmailEditor\Renderer\Blocks\WooContent;
use MailPoet\EmailEditor\Engine\Renderer\ContentRenderer\Blocks_Registry;
use MailPoet\EmailEditor\Engine\Renderer\Renderer as MailPoetRenderer;
use MailPoet\EmailEditor\EmailEditorContainer;

/**
 * Class responsible for rendering block-based emails.
 */
class BlockEmailRenderer {
	const WOO_EMAIL_CONTENT_PLACEHOLDER_BLOCK = 'woo/email-content';
	const WOO_EMAIL_CONTENT_PLACEHOLDER       = '##WOO_CONTENT##';

	/**
	 * Service for rendering block emails
	 *
	 * @var MailPoetRenderer
	 */
	private $renderer;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$editor_container = EmailEditorContainer::container();
		$this->renderer   = $editor_container->get( MailPoetRenderer::class );
	}

	/**
	 * Initialize the renderer.
	 */
	public function register_hooks(): void {
		add_action( 'mailpoet_blocks_renderer_initialized', array( $this, 'register_block_renderers' ) );
	}

	/**
	 * Callback for registering WooCommerce email block renderers.
	 *
	 * @param Blocks_Registry $blocks_registry Block renderer registry.
	 */
	public function register_block_renderers( $blocks_registry ): void {
		$blocks_registry->add_block_renderer( self::WOO_EMAIL_CONTENT_PLACEHOLDER_BLOCK, new WooContent() );
	}

	/**
	 * Maybe render block-based email content.
	 *
	 * @param \WP_Post  $email_post Email post.
	 * @param string    $woo_content WooCommerce email content.
	 * @param \WC_Email $wc_email WooCommerce email.
	 * @return string Modified email content
	 */
	public function render_block_email( \WP_Post $email_post, string $woo_content, \WC_Email $wc_email ): ?string {
		$subject   = $wc_email->get_subject(); // We will get subject from $email_post after we add it to the editor.
		$preheader = ''; // We will get the preheader from $email_post after we add it to the editor.
		try {
			$rendered_email_data = $this->renderer->render( $email_post, $subject, $preheader, 'en' );
			$rendered_email      = str_replace( self::WOO_EMAIL_CONTENT_PLACEHOLDER, $woo_content, $rendered_email_data['html'] );
			return $rendered_email;
		} catch ( \Exception $e ) {
			wc_caught_exception( $e, __METHOD__, array( $email_post, $woo_content, $wc_email ) );
			return null;
		}
	}

	/**
	 * Get the email post for a given WC_Email.
	 * Temporarily using the email ID as the post title for storing the association.
	 *
	 * @param \WC_Email $email WooCommerce email.
	 * @return \WP_Post|null
	 */
	public function get_email_post_by_wc_email( \WC_Email $email ): ?\WP_Post {
		$args = array(
			'post_type'      => Integration::EMAIL_POST_TYPE,
			'title'          => $email->id,
			'post_status'    => 'draft', // Temporarily use draft status we will change it to publish or custom active later.
			'posts_per_page' => 1,
		);

		$posts = get_posts( $args );
		if ( empty( $posts ) ) {
			return null;
		}

		return $posts[0];
	}
}
