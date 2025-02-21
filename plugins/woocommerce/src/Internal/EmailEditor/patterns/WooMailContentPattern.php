<?php declare(strict_types = 1);

namespace Automattic\WooCommerce\Internal\EmailEditor\Patterns;

use MailPoet\EmailEditor\Engine\Patterns\Abstract_Pattern;

class WooMailContentPattern extends Abstract_Pattern {
	public $name = 'woo-mail-content-pattern';
	public $block_types = [];
	public $template_types = ['email-template']; 	// required
	public $categories = ['email-contents'];  		// optional

	public $namespace = 'woocommerce';		// required

	public function get_content(): string {
		return '<!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-right:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:heading -->
<h2 class="wp-block-heading">Woo Email Content</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Here comes content composed of supported core blocks and Woo transactional email block(s).</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"background":"#873eff"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-background wp-element-button" style="background-color:#873eff">Shop now</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->';
	}

	public function get_title(): string {
		/* translators: Name of a content pattern used as starting content of an email */
		return __('Woo Mail Content Pattern', 'woocommerce');
	}
}
