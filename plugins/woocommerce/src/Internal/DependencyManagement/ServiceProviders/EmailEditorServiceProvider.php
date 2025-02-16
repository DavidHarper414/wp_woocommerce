<?php

declare(strict_types=1);

namespace Automattic\WooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\WooCommerce\Internal\Admin\EmailEditor\Integration;
use Automattic\WooCommerce\Internal\Admin\EmailEditor\PageRenderer;
use Automattic\WooCommerce\Internal\Admin\EmailEditor\Patterns\PatternsController;
use Automattic\WooCommerce\Internal\Admin\EmailEditor\Templates\TemplatesController;

/**
 * Service provider for the EmailEditor namespace.
 */
class EmailEditorServiceProvider extends AbstractInterfaceServiceProvider
{

	/**
	 * The classes/interfaces that are serviced by this service provider.
	 *
	 * @var array
	 */
	protected $provides = array(
		Integration::class,
		PageRenderer::class,
		PatternsController::class,
		TemplatesController::class,
	);

	/**
	 * Register the classes.
	 */
	public function register()
	{
		$this->share(Integration::class);
		$this->share(PageRenderer::class);
		$this->share(PatternsController::class);
		$this->share(TemplatesController::class);
	}
}
