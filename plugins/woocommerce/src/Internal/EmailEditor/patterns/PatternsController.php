<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\EmailEditor\Patterns;

defined( 'ABSPATH' ) || exit;

class PatternsController {

	public function init(): void {
		$this->register_patterns();
	}

	public function register_patterns(): void {
		$patterns = [];
		$patterns[] = new WooMailContentPattern();
		foreach ($patterns as $pattern) {
			register_block_pattern($pattern->get_namespace() . '/' . $pattern->get_name(), $pattern->get_properties());
		}
	}
}
