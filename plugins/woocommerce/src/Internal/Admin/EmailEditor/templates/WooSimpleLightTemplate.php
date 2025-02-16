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
		// translators: This is a text used in a footer on an email <!--[mailpoet/site-title]--> will be replaced with the site title.
		$footerText = __('You received this email because you shopped on <!--[mailpoet/site-title]-->', 'woocommerce');
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
      src="https://woocommerce.com/wp-content/uploads/2025/01/Logo-Primary.png"
      alt="Your Logo"
      style="width: 130px"
    />
  </figure>
  <!-- /wp:image -->
</div>
<!-- /wp:group -->

<!-- wp:post-content {"lock":{"move":false,"remove":false},"layout":{"type":"default"}} /-->

        <!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20","top":"var:preset|spacing|10","bottom":"var:preset|spacing|10"}}}} -->
        <div
          class="wp-block-group"
          style="
            padding-top: var(--wp--preset--spacing--10);
            padding-right: var(--wp--preset--spacing--20);
            padding-bottom: var(--wp--preset--spacing--10);
            padding-left: var(--wp--preset--spacing--20);
          "
            >
          <!-- wp:paragraph {"align":"center","fontSize":"small","style":{"border":{"top":{"color":"var:preset|color|cyan-bluish-gray","width":"1px","style":"solid"},"right":{},"bottom":{},"left":{}},"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}},"color":{"text":"#787c82"},"elements":{"link":{"color":{"text":"#787c82"}}}}} -->
          <p
            class="has-text-align-center has-text-color has-link-color has-small-font-size"
            style="
              border-top-color: var(--wp--preset--color--cyan-bluish-gray);
              border-top-style: solid;
              border-top-width: 1px;
              color: #787c82;
              padding-top: var(--wp--preset--spacing--20);
              padding-bottom: var(--wp--preset--spacing--20);
            "
              >'. $footerText . '<br />
          </p>
          <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
';
	}
}
