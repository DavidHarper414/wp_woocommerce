<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\Admin\EmailEditor\Templates;

use MailPoet\EmailEditor\Engine\Templates\Template;
use MailPoet\EmailEditor\Engine\Templates\Templates_Registry;
use Automattic\WooCommerce\Internal\Admin\EmailEditor\Integration;

defined( 'ABSPATH' ) || exit;

class TemplatesController {

	private string $templatePrefix = 'wooemail';


	public function initialize() {
		add_filter('mailpoet_email_editor_register_templates', [$this, 'registerTemplates']);
	}

	public function registerTemplates(Templates_Registry $templatesRegistry) {
		$templates = [];
		 $templates[] = new WooSimpleLightTemplate();

		foreach ($templates as $template) {
			$theTemplate = new Template(
				$this->templatePrefix,
				$template->getSlug(),
				$template->getTitle(),
				$template->getDescription(),
				$template->getContent(),
				[Integration::EMAIL_POST_TYPE]
			);
			$templatesRegistry->register($theTemplate);
		}

		return $templatesRegistry;
	}
}

