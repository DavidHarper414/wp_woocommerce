<?php

declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\Admin\EmailEditor\Patterns;

defined( 'ABSPATH' ) || exit;

class PatternsController {

	public function registerPatterns(): void {
		$patterns = [];
		$patterns[] = new WooOneColumnPattern();
		foreach ($patterns as $pattern) {
			register_block_pattern($pattern->get_namespace() . '/' . $pattern->get_name(), $pattern->get_properties());
		}
	}
}
