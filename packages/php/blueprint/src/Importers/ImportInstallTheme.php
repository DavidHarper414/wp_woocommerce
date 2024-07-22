<?php

namespace Automattic\WooCommerce\Blueprint\Importers;

use Automattic\WooCommerce\Blueprint\ResourceStorages;
use Automattic\WooCommerce\Blueprint\StepProcessor;
use Automattic\WooCommerce\Blueprint\StepProcessorResult;
use Automattic\WooCommerce\Blueprint\Steps\InstallTheme;
use Automattic\WooCommerce\Blueprint\UseWPFunctions;
use Plugin_Upgrader;

class ImportInstallTheme implements StepProcessor {
	use UseWPFunctions;
	private ResourceStorages $storage;
	private StepProcessorResult $result;

	public function __construct( ResourceStorages $storage ) {
		$this->result  = StepProcessorResult::success( 'InstallThemes' );
		$this->storage = $storage;
	}
	public function process( $schema ): StepProcessorResult {
		$installed_themes = wp_get_themes();
		$theme            = $schema->themeZipFile;

		if ( isset( $installed_themes[ $theme->slug ] ) ) {
			$this->result->add_info( "Skipped installing {$theme->slug}. It is already installed." );
			return $this->result;
		}
		if ( $this->storage->is_supported_resource( $theme->resource ) === false ) {
			$this->result->add_error( "Invalid resource type for {$theme->slug}" );
			return $this->result;
		}

		$downloaded_path = $this->storage->download( $theme->slug, $theme->resource );

		if ( ! $downloaded_path ) {
			$this->result->add_error( "Unable to download {$theme->slug} with {$theme->resource} resource type." );
			return $this->result;
		}

		$this->result->add_debug( "'$theme->slug' has been downloaded in $downloaded_path" );

		$install = $this->install( $downloaded_path );
		$install && $this->result->add_debug( "Theme '$theme->slug' installed successfully." );
		$theme_switch = $theme->activate === true && $this->wp_switch_theme( $theme->slug );
		$theme_switch && $this->result->add_debug( "Switched theme to '$theme->slug'." );

		return $this->result;
	}

	protected function install( $local_plugin_path ) {
		if ( ! class_exists( 'WP_Filesystem_Base' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			WP_Filesystem();
		}

		$unzip_result = unzip_file( $local_plugin_path, get_theme_root() );

		if ( is_wp_error( $unzip_result ) ) {
			return false;
		}

		return true;
	}

	public function get_step_class(): string {
		return InstallTheme::class;
	}
}
