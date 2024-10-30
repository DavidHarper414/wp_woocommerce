<?php
declare(strict_types=1);

namespace Automattic\WooCommerce\Internal\DependencyManagement\ServiceProviders;

use Automattic\WooCommerce\Internal\ProductFilters\Cache;
use Automattic\WooCommerce\Internal\ProductFilters\Controller;
use Automattic\WooCommerce\Internal\ProductFilters\FilterData;
use Automattic\WooCommerce\Internal\ProductFilters\QueryClauses;

/**
 * LoggingServiceProvider class.
 */
class ProductFiltersServiceProvider extends AbstractInterfaceServiceProvider {
	/**
	 * List services provided by this class.
	 *
	 * @var string[]
	 */
	protected $provides = array(
		QueryClauses::class,
		FilterData::class,
		Controller::class,
		Cache::class,
	);

	/**
	 * Registers services provided by this class.
	 *
	 * @return void
	 */
	public function register() {
		$this->share( QueryClauses::class );
		$this->share( Cache::class );
		$this->share_with_implements_tags( Controller::class )->addArgument( QueryClauses::class );
		/**
		 * We allow changing the clauses generator at run time, so we use `add`
		 * here to return a new instance with a known default clause generator
		 * when retrieving the data provider from the container.
		 */
		$this->add( FilterData::class )->addArguments( array( QueryClauses::class, Cache::class ) );
	}
}
