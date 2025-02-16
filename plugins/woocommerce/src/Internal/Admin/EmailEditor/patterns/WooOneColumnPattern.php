<?php declare(strict_types = 1);

namespace Automattic\WooCommerce\Internal\Admin\EmailEditor\Patterns;

use MailPoet\EmailEditor\Engine\Patterns\Abstract_Pattern;

class WooOneColumnPattern extends Abstract_Pattern {
	public $name = 'woo-1-column-content';
	public $block_types = [];
	public $template_types = ['email-template']; 	// required
	public $categories = ['email-contents'];  		// optional

	public $namespace = 'woocommerce';		// required

	public function get_content(): string {
		return '
	  <!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20"}}},"layout":{"type":"constrained"}} -->
	  <div class="wp-block-group" style="padding-right:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:heading -->
	  <h2 class="wp-block-heading">' . __('Woo 1 Column content', 'woocommerce') . '</h2>
	  <!-- /wp:heading -->

	  <!-- wp:paragraph -->
	  <p>' . __('A one-column layout is great for simplified and concise content, like announcements or newsletters with brief updates. Drag blocks to add content and customize your styles from the styles panel on the top right.', 'woocommerce') . '</p>
	  <!-- /wp:paragraph -->

	  <!-- wp:image -->
	  <figure class="wp-block-image"><img alt=""/></figure>
	  <!-- /wp:image -->

		<!-- wp:buttons {"layout":{"justifyContent":"center"}} -->
		<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"background":"#873eff"}}} -->
		<div class="wp-block-button"><a class="wp-block-button__link has-background wp-element-button" style="background-color:#873eff">Shop now</a></div>
		<!-- /wp:button --></div>
		<!-- /wp:buttons -->

		<!-- wp:paragraph -->
		<p></p>
		<!-- /wp:paragraph -->
	   </div>
	  <!-- /wp:group -->
	  ';
	}

	public function get_title(): string {
		/* translators: Name of a content pattern used as starting content of an email */
		return __('Woo 1 Column content', 'woocommerce');
	}
}
