<?php

namespace Automattic\WooCommerce\Blueprint\Importers;

use Automattic\WooCommerce\Blueprint\StepProcessor;
use Automattic\WooCommerce\Blueprint\StepProcessorResult;
use Automattic\WooCommerce\Blueprint\Steps\DeletePlugin;
use Automattic\WooCommerce\Blueprint\UsePluginHelpers;

class ImportDeletePlugin implements StepProcessor {
	use UsePluginHelpers;

	public function process( $schema ): StepProcessorResult {
		$result = StepProcessorResult::success( 'DeletePlugins' );
		$name   = $schema->pluginName;

		$delete = $this->delete_plugin_by_slug( $name );
		if ( $delete ) {
			$result->add_info( "Deleted {$name}." );
		} else {
			$result->add_error( "Unable to delete {$name}." );
		}

		return $result;
	}

	public function get_step_class(): string {
		return DeletePlugin::class;
	}
}
