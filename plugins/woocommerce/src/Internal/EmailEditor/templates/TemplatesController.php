<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\EmailEditor\Templates;

use MailPoet\EmailEditor\Engine\Templates\Template;
use MailPoet\EmailEditor\Engine\Templates\Templates_Registry;
use Automattic\WooCommerce\Internal\EmailEditor\Integration;

defined( 'ABSPATH' ) || exit;

class TemplatesController {

	private string $templatePrefix = 'wooemail';


	public function init(): void {
		add_filter('mailpoet_email_editor_register_templates', [$this, 'register_templates']);
	}

	public function register_templates(Templates_Registry $templatesRegistry) {
		$templates = [];
		 $templates[] = new WooMailTemplate();

		foreach ($templates as $template) {
			$theTemplate = new Template(
				$this->templatePrefix,
				$template->get_slug(),
				$template->get_title(),
				$template->get_description(),
				$template->get_content(),
				[Integration::EMAIL_POST_TYPE]
			);
			$templatesRegistry->register($theTemplate);
		}

		return $templatesRegistry;
	}
}

