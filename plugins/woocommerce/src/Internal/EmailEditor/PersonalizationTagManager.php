<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\EmailEditor;

use MailPoet\EmailEditor\Engine\PersonalizationTags\Personalization_Tag;
use MailPoet\EmailEditor\Engine\PersonalizationTags\Personalization_Tags_Registry;

defined( 'ABSPATH' ) || exit;

class PersonalizationTagManager {

	public function init(): void {
		add_filter('mailpoet_email_editor_register_personalization_tags', [$this, 'register_personalization_tags']);
	}

	public function register_personalization_tags(Personalization_Tags_Registry $registry) {
		$registry->register(new Personalization_Tag(
			__('Shopper Email', 'woocommerce'),
			'woocommerce/shopper-email',
			__('Shopper', 'woocommerce'),
			function (array $context, array $args = []): string {
				return $context['recipient_email'] ?? '';
			},
		));

		// Site Personalization Tags
		$registry->register(new Personalization_Tag(
			__('Site Title', 'woocommerce'),
			'woocommerce/site-title',
			__('Site', 'woocommerce'),
			function (array $context, array $args = []): string {
				return htmlspecialchars_decode(get_bloginfo('name'));
			},
		));
		$registry->register(new Personalization_Tag(
			__('Homepage URL', 'woocommerce'),
			'woocommerce/site-homepage-url',
			__('Site', 'woocommerce'),
			function (array $context, array $args = []): string {
				return get_bloginfo('url');
			},
		));
		return $registry;
	}
}
