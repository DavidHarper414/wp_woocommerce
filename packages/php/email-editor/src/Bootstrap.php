<?php declare(strict_types = 1);

namespace Automattic\WooCommerce\EmailEditor;

use Automattic\WooCommerce\EmailEditor\Engine\Email_Editor;
use Automattic\WooCommerce\EmailEditor\Integrations\Core\Initializer as CoreEmailEditorIntegration;

class Bootstrap {

	/** @var Email_Editor */
	private $emailEditor;

	/** @var CoreEmailEditorIntegration */
	private $coreEmailEditorIntegration;

	public function __construct(
		Email_Editor $emailEditor,
		CoreEmailEditorIntegration $coreEmailEditorIntegration
	) {
		$this->emailEditor = $emailEditor;
		$this->coreEmailEditorIntegration = $coreEmailEditorIntegration;
	}

	public function init() {
		add_action('init', [
			$this,
			'initialize',
		]);

		add_filter('woocommerce_email_editor_initialized', [
			$this,
			'setupEmailEditorIntegrations',
		]);
	}

	public function initialize() {
	  $this->emailEditor->initialize();
	}

	public function setupEmailEditorIntegrations() {
	  $this->coreEmailEditorIntegration->initialize();
	}
}
