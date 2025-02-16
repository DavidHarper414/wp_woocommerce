<?php declare(strict_types = 1);

namespace Automattic\WooCommerce\Internal\Admin\EmailEditor\Templates;

class WooSimpleLightTemplate {

	public function getSlug(): string {
		return 'woosimplelight';
	}

	public function getTitle(): string {
		return __('WooSimpleLight', 'woocommerce');
	}

	public function getDescription(): string {
		return __('WooSimpleLight template', 'woocommerce');
	}

	public function getContent(): string {
		return '<!-- wp:group {"backgroundColor":"white","style":{"spacing":{"padding":{"top":"var:preset|spacing|10","bottom":"var:preset|spacing|10","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}}},"layout":{"type":"constrained"}} -->
<div
  class="wp-block-group has-white-background-color has-background"
  style="
    padding-top: var(--wp--preset--spacing--10);
    padding-right: var(--wp--preset--spacing--20);
    padding-bottom: var(--wp--preset--spacing--10);
    padding-left: var(--wp--preset--spacing--20);
  "
>
  <!-- wp:image {"width":"130px","sizeSlug":"large"} -->
  <figure class="wp-block-image size-large is-resized">
    <img
      src="https://ps.w.org/mailpoet/assets/email-editor/your-logo-placeholder.png"
      alt="Your Logo"
      style="width: 130px"
    />
  </figure>
  <!-- /wp:image -->
</div>
<!-- /wp:group -->

<!-- wp:post-content {"lock":{"move":false,"remove":false},"layout":{"type":"default"}} /-->

<!-- wp:group {"backgroundColor":"white","style":{"spacing":{"padding":{"top":"var:preset|spacing|10","bottom":"var:preset|spacing|10","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}}},"layout":{"type":"constrained"}} -->
<div
  class="wp-block-group has-white-background-color has-background"
  style="
    padding-top: var(--wp--preset--spacing--10);
    padding-right: var(--wp--preset--spacing--20);
    padding-bottom: var(--wp--preset--spacing--10);
    padding-left: var(--wp--preset--spacing--20);
  "
>
  <!-- wp:paragraph {"fontSize":"small"} -->
  <p class="has-small-font-size">
    You received this email because you shopped on [site:title]
  </p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->';
	}
}
