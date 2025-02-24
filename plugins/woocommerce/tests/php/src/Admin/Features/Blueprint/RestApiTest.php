<?php
/**
 * Unit tests for RestApi class.
 */

namespace Automattic\WooCommerce\Tests\Admin\Features\Blueprint;

use Automattic\WooCommerce\Admin\Features\Blueprint\RestApi;
use WP_REST_Request;
use WP_Test_REST_TestCase;

/**
 * Unit tests for RestApi class.
 */
class RestApiTest extends WP_Test_REST_TestCase {
	/**
	 * @var RestApi
	 */
	private $rest_api;

	/**
	 * @var string
	 */
	private $temp_file;

	/**
	 * Setup test case.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->rest_api = new RestApi();

		// Create a temporary test file with valid Blueprint schema
		$this->temp_file = wp_tempnam('blueprint_test_');
		$blueprint_content = json_encode([
			'steps' => [
				[
					'step' => 'setWCSettings',
					'settings' => [
						'woocommerce_store_address' => '123 Test St',
						'woocommerce_store_city' => 'Test City'
					]
				]
			]
		]);
		file_put_contents($this->temp_file, $blueprint_content);
	}

	/**
	 * Test file size validation in queue endpoint.
	 */
	public function test_queue_file_size_validation() {
		// Mock file upload data
		$_FILES['file'] = array(
			'name' => 'test.json',
			'type' => 'application/json',
			'size' => RestApi::MAX_FILE_SIZE + 1024, // Slightly over limit
			'tmp_name' => $this->temp_file,
			'error' => UPLOAD_ERR_OK
		);

		// Set nonce
		$_POST['blueprint_upload_nonce'] = wp_create_nonce('blueprint_upload_nonce');

		$response = $this->rest_api->queue();

		$this->assertEquals('upload', $response['error_type']);
		$this->assertStringContainsString('50 MB', $response['errors'][0]);
	}

	/**
	 * Test custom file size limit via filter.
	 */
	public function test_custom_file_size_limit() {
		$custom_limit = 10 * 1024 * 1024; // 10MB

		add_filter('woocommerce_blueprint_upload_max_file_size', function() use ($custom_limit) {
			return $custom_limit;
		});

		// Mock file upload data
		$_FILES['file'] = array(
			'name' => 'test.json',
			'type' => 'application/json',
			'size' => $custom_limit + 1024, // Slightly over custom limit
			'tmp_name' => $this->temp_file,
			'error' => UPLOAD_ERR_OK
		);

		// Set nonce
		$_POST['blueprint_upload_nonce'] = wp_create_nonce('blueprint_upload_nonce');

		$response = $this->rest_api->queue();

		$this->assertEquals('upload', $response['error_type']);
		$this->assertStringContainsString('10 MB', $response['errors'][0]);

		// Clean up
		remove_all_filters('woocommerce_blueprint_upload_max_file_size');
	}

	/**
	 * Clean up after each test.
	 */
	public function tearDown(): void {
		parent::tearDown();
		// Clean up global state
		unset($_FILES['file']);
		unset($_POST['blueprint_upload_nonce']);

		// Clean up temporary file
		if (file_exists($this->temp_file)) {
			unlink($this->temp_file);
		}
	}
} 