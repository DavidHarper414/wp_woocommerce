<?php

declare( strict_types = 1);

namespace Automattic\WooCommerce\Admin\Features\Blueprint\Exporters;

use Automattic\WooCommerce\Admin\Features\Blueprint\SettingOptions;
use Automattic\WooCommerce\Blueprint\Exporters\HasAlias;
use Automattic\WooCommerce\Blueprint\Exporters\StepExporter;
use Automattic\WooCommerce\Blueprint\Steps\SetSiteOptions;
use Automattic\WooCommerce\Blueprint\UseWPFunctions;

/**
 * Class ExportWCSettingsProducts
 *
 * This class exports WooCommerce settings and implements the StepExporter and HasAlias interfaces.
 *
 * @package Automattic\WooCommerce\Admin\Features\Blueprint\Exporters
 */
class ExportWCSettingsAdvanced extends ExportWCSettingsGeneral {
	use UseWPFunctions;

	/**
	 * Page I.D to export.
	 *
	 * @var string The page ID.
	 */
	protected string $page_id = 'advanced';

	/**
	 * Get the alias for this exporter.
	 *
	 * @return string
	 */
	public function get_alias() {
		return 'setWCSettingsAdvanced';
	}

	/**
	 * Return label used in the frontend.
	 *
	 * @return string
	 */
	public function get_label() {
		return __( 'Advanced', 'woocommerce' );
	}

	/**
	 * Return description used in the frontend.
	 *
	 * @return string
	 */
	public function get_description() {
		return __( 'It includes all settings in WooCommerce | Settings | Advanced.', 'woocommerce' );
	}
}
