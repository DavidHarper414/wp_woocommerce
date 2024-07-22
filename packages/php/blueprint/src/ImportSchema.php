<?php

namespace Automattic\WooCommerce\Blueprint;

use Automattic\WooCommerce\Blueprint\Schemas\JsonSchema;
use Automattic\WooCommerce\Blueprint\Schemas\ZipSchema;
use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Validator;

/**
 * Class ImportSchema
 *
 * Handles the import schema functionality for WooCommerce.
 *
 * @package Automattic\WooCommerce\Blueprint
 */
class ImportSchema {
	use UseWPFunctions;

	/**
	 * @var JsonSchema The schema instance.
	 */
	private JsonSchema $schema;

	/**
	 * @var Validator The JSON schema validator instance.
	 */
	private Validator $validator;

	/**
	 * @var BuiltInStepProcessors The built-in step processors instance.
	 */
	private BuiltInStepProcessors $builtin_step_processors;

	/**
	 * ImportSchema constructor.
	 *
	 * @param JsonSchema $schema The schema instance.
	 * @param Validator|null $validator The validator instance, optional.
	 */
	public function __construct( JsonSchema $schema,  Validator $validator = null ) {
		$this->schema = $schema;
		if ( null === $validator ) {
			$this->validator = new Validator();
		}

		$this->builtin_step_processors = new BuiltInStepProcessors( $schema );
	}

	public function get_schema() {
		return $this->schema;
	}

	/**
	 * Create an ImportSchema instance from a file.
	 *
	 * @param string $file The file path.
	 * @return ImportSchema The created ImportSchema instance.
	 */
	public static function crate_from_file( $file ) {
		// @todo check for mime type
		// @todo check for allowed types -- json or zip
		$path_info = pathinfo( $file );
		$is_zip    = $path_info['extension'] === 'zip';

		return $is_zip ? self::crate_from_zip( $file ) : self::create_from_json( $file );
	}

	/**
	 * Create an ImportSchema instance from a JSON file.
	 *
	 * @param string $json_path The JSON file path.
	 * @return ImportSchema The created ImportSchema instance.
	 */
	public static function create_from_json( $json_path ) {
		return new self( new JsonSchema( $json_path ) );
	}

	/**
	 * Create an ImportSchema instance from a ZIP file.
	 *
	 * @param string $zip_path The ZIP file path.
	 *
	 * @return ImportSchema The created ImportSchema instance.
	 */
	public static function create_from_zip( $zip_path ) {
		return new self( new ZipSchema( $zip_path ) );
	}

	/**
	 * Import the schema steps.
	 *
	 * @return StepProcessorResult[]
	 */
	public function import() {
		$results   = array();
		$result    = StepProcessorResult::success( 'ImportSchema' );
		$results[] = $result;

		$step_processors    = $this->builtin_step_processors->get_all();
		$step_processors    = $this->wp_apply_filters( 'wooblueprint_importers', $step_processors );
		$indexed_step_processors = Util::index_array( $step_processors, function($key, $step_processor) {
			return $step_processor->get_step_class()::get_step_name();
		} );

		// validate steps before processing
		$this->validate_step_schemas( $indexed_step_processors, $result );

		if ( count( $result->get_messages('error') ) !== 0 ) {
			return $results;
		}


		foreach ( $this->schema->get_steps() as $step_schema ) {
			$stepProcessor = $indexed_step_processors[ $step_schema->step ] ?? null;
			if ( ! $stepProcessor instanceof StepProcessor ) {
				$result->add_error( "Unable to create a step processor for {$step_schema->step}" );
				continue;
			}

			$results[] = $stepProcessor->process( $step_schema );
		}

		return $results;
	}

	protected function validate_step_schemas( array $indexed_step_processors, StepProcessorResult $result ) {
		$step_schemas = array_map( function($step_processor) {
			return $step_processor->get_step_class()::get_schema();
		}, $indexed_step_processors );

		foreach ($this->schema->get_steps() as $step_json) {
			$step_schema = $step_schemas[ $step_json->step ] ?? null;
			if ( ! $step_schema ) {
				$result->add_info( "No schema found for step $step_json->step" );
				continue;
			}

			$validate = $this->validator->validate( $step_json, json_encode($step_schema) );

			if ( ! $validate->isValid() ) {
				$result->add_error( "Schema validation failed for step {$step_json->step}" );
				$errors = ( new ErrorFormatter() )->format( $validate->error() );
				$formatted_errors = array();
				foreach ($errors as $value) {
					$formatted_errors[] = implode("\n", $value);
				}

				$result->add_error( implode("\n", $formatted_errors) );
			}
		}
	}
}
