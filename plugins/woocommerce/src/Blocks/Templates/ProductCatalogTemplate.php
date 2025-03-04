<?php

namespace Automattic\WooCommerce\Blocks\Templates;

use Automattic\WooCommerce\Blocks\Templates\ArchiveProductTemplatesCompatibility;
use Automattic\WooCommerce\Blocks\Utils\BlockTemplateUtils;

/**
 * ProductCatalogTemplate class.
 *
 * @internal
 */
class ProductCatalogTemplate extends AbstractTemplate {

	/**
	 * The slug of the template.
	 *
	 * @var string
	 */
	const SLUG = 'archive-product';

	/**
	 * Initialization method.
	 */
	public function init() {
		add_action( 'template_redirect', array( $this, 'render_block_template' ) );
		add_filter( 'rest_prepare_page', array( $this, 'modify_shop_page_template' ), 10, 3 );
	}

	/**
	 * Returns the title of the template.
	 *
	 * @return string
	 */
	public function get_template_title() {
		return _x( 'Product Catalog', 'Template name', 'woocommerce' );
	}

	/**
	 * Returns the description of the template.
	 *
	 * @return string
	 */
	public function get_template_description() {
		return __( 'Displays your products.', 'woocommerce' );
	}

	/**
	 * Renders the default block template from Woo Blocks if no theme templates exist.
	 */
	public function render_block_template() {
		if ( ! is_embed() && ( is_post_type_archive( 'product' ) || is_page( wc_get_page_id( 'shop' ) ) ) && ! is_search() ) {
			$compatibility_layer = new ArchiveProductTemplatesCompatibility();
			$compatibility_layer->init();

			$templates = get_block_templates( array( 'slug__in' => array( self::SLUG ) ) );

			if ( isset( $templates[0] ) && BlockTemplateUtils::template_has_legacy_template_block( $templates[0] ) ) {
				add_filter( 'woocommerce_disable_compatibility_layer', '__return_true' );
			}

			add_filter( 'woocommerce_has_block_template', '__return_true', 10, 0 );
		}
	}

	/**
	 * Modify the shop page template to include the Product Catalog template.
	 * This is so that the Product Catalog template is used on the shop page in the template selector.
	 *
	 * @param WP_REST_Response $response The response object.
	 * @param WP_Post          $post     The post object.
	 * @param WP_REST_Request  $request  The request object.
	 * @return WP_REST_Response
	 */
	public function modify_shop_page_template( $response, $post, $request ) {
		if ( wc_get_page_id( 'shop' ) === $post->ID ) {
			$response->data['template'] = 'archive-product';
		}
		return $response;
	}
}
