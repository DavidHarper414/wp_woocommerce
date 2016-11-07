<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WC Product Data Store: Stored in CPT.
 *
 * @version  2.7.0
 * @category Class
 * @author   WooThemes
 */
class WC_Product_Data_Store_CPT extends WC_Data_Store_CPT implements WC_Object_Data_Store {

	/**
	 * If we have already saved our extra data, don't do automatic / default handling.
	 */
	protected $extra_data_saved = false;

	/**
	 * Stores a new product in the database.
	 *
	 * @since 2.7.0
	 * @param WC_Product Object
	 */
	public function create( &$product ) {
		$product->set_date_created( current_time( 'timestamp' ) );
		$post_type = $product->is_type( 'variation' ) ? 'product_variation' : 'product';

		$id = wp_insert_post( apply_filters( 'woocommerce_new_product_data', array(
			'post_type'      => $post_type,
			'post_status'    => $product->get_status() ? $product->get_status() : 'publish',
			'post_author'    => get_current_user_id(),
			'post_title'     => $product->get_name() ? $product->get_name() : __( 'Product', 'woocommerce' ),
			'post_content'   => $product->get_description(),
			'post_excerpt'   => $product->get_short_description(),
			'post_parent'    => $product->get_parent_id(),
			'comment_status' => $product->get_reviews_allowed() ? 'open' : 'closed',
			'ping_status'    => 'closed',
			'menu_order'     => $product->get_menu_order(),
			'post_date'      => date( 'Y-m-d H:i:s', $product->get_date_created() ),
			'post_date_gmt'  => get_gmt_from_date( date( 'Y-m-d H:i:s', $product->get_date_created() ) ),
		) ), true );

		if ( $id && ! is_wp_error( $id ) ) {
			$product->set_id( $id );
			$this->update_post_meta( $product );
			$this->update_terms( $product );
			$this->update_attributes( $product );
			$this->update_version_and_type( $product );
			$product->save_meta_data();
			do_action( 'woocommerce_new_' . $post_type, $id );
		}
	}

	/**
	 * Read a product from the database.
	 *
	 * @since 2.7.0
	 * @param WC_Product
	 */
	public function read( &$product ) {
		$product->set_defaults();

		if ( ! $product->get_id() || ! ( $post_object = get_post( $product->get_id() ) ) ) {
			throw new Exception( __( 'Invalid product.', 'woocommerce' ) );
			return;
		}

		$id = $product->get_id();
		$product->set_props( array(
			'name'              => get_the_title( $post_object ),
			'slug'              => $post_object->post_name,
			'date_created'      => $post_object->post_date,
			'date_modified'     => $post_object->post_modified,
			'status'            => $post_object->post_status,
			'description'       => $post_object->post_content,
			'short_description' => $post_object->post_excerpt,
			'parent_id'         => $post_object->post_parent,
			'menu_order'        => $post_object->menu_order,
			'reviews_allowed'   => 'open' === $post_object->comment_status,
			'featured'           => get_post_meta( $id, '_featured', true ),
			'catalog_visibility' => get_post_meta( $id, '_visibility', true ),
			'sku'                => get_post_meta( $id, '_sku', true ),
			'regular_price'      => get_post_meta( $id, '_regular_price', true ),
			'sale_price'         => get_post_meta( $id, '_sale_price', true ),
			'date_on_sale_from'  => get_post_meta( $id, '_sale_price_dates_from', true ),
			'date_on_sale_to'    => get_post_meta( $id, '_sale_price_dates_to', true ),
			'total_sales'        => get_post_meta( $id, 'total_sales', true ),
			'tax_status'         => get_post_meta( $id, '_tax_status', true ),
			'tax_class'          => get_post_meta( $id, '_tax_class', true ),
			'manage_stock'       => get_post_meta( $id, '_manage_stock', true ),
			'stock_quantity'     => get_post_meta( $id, '_stock', true ),
			'stock_status'       => get_post_meta( $id, '_stock_status', true ),
			'backorders'         => get_post_meta( $id, '_backorders', true ),
			'sold_individually'  => get_post_meta( $id, '_sold_individually', true ),
			'weight'             => get_post_meta( $id, '_weight', true ),
			'length'             => get_post_meta( $id, '_length', true ),
			'width'              => get_post_meta( $id, '_width', true ),
			'height'             => get_post_meta( $id, '_height', true ),
			'upsell_ids'         => get_post_meta( $id, '_upsell_ids', true ),
			'cross_sell_ids'     => get_post_meta( $id, '_crosssell_ids', true ),
			'purchase_note'      => get_post_meta( $id, '_purchase_note', true ),
			'default_attributes' => get_post_meta( $id, '_default_attributes', true ),
			'category_ids'       => $this->get_term_ids( $id, 'product_cat' ),
			'tag_ids'            => $this->get_term_ids( $id, 'product_tag' ),
			'shipping_class_id'  => current( $this->get_term_ids( $id, 'product_shipping_class' ) ),
			'virtual'            => get_post_meta( $id, '_virtual', true ),
			'downloadable'       => get_post_meta( $id, '_downloadable', true ),
			'downloads'          => array_filter( (array) get_post_meta( $id, '_downloadable_files', true ) ),
			'gallery_image_ids'  => array_filter( explode( ',', get_post_meta( $id, '_product_image_gallery', true ) ) ),
			'download_limit'     => get_post_meta( $id, '_download_limit', true ),
			'download_expiry'    => get_post_meta( $id, '_download_expiry', true ),
			'image_id'           => get_post_thumbnail_id( $id ),
		) );

		if ( $product->is_on_sale() ) {
			$product->set_price( $product->get_sale_price() );
		} else {
			$product->set_price( $product->get_regular_price() );
		}

		$meta_values = maybe_unserialize( get_post_meta( $product->get_id(), '_product_attributes', true ) );

		if ( $meta_values ) {
			$attributes = array();
			foreach ( $meta_values as $meta_value ) {
				if ( ! empty( $meta_value['is_taxonomy'] ) ) {
					if ( ! taxonomy_exists( $meta_value['name'] ) ) {
						continue;
					}
					$options = wp_get_post_terms( $product->get_id(), $meta_value['name'], array( 'fields' => 'ids' ) );
				} else {
					$options = wc_get_text_attributes( $meta_value['value'] );
				}
				$attribute = new WC_Product_Attribute();
				$attribute->set_id( wc_attribute_taxonomy_id_by_name( $meta_value['name'] ) );
				$attribute->set_name( $meta_value['name'] );
				$attribute->set_options( $options );
				$attribute->set_position( $meta_value['position'] );
				$attribute->set_visible( $meta_value['is_visible'] );
				$attribute->set_variation( $meta_value['is_variation'] );
				$attributes[] = $attribute;
			}
			$product->set_attributes( $attributes );
		}

		// Gets extra data associated with the product.
		// Like button text or product URL for external products.
		foreach ( $product->get_extra_data_keys() as $key ) {
			$function = 'set_' . $key;
			if ( is_callable( array( $product, $function ) ) ) {
				$product->{$function}( get_post_meta( $product->get_id(), '_' . $key, true ) );
			}
		}

		// Set object_read true once all data is read.
		$product->set_object_read( true );
	}

	/**
	 * Updates an existing product.
	 *
	 * @since 2.7.0
	 * @param WC_Product
	 */
	public function update( &$product ) {
		$post_data = array(
			'ID'             => $product->get_id(),
			'post_content'   => $product->get_description(),
			'post_excerpt'   => $product->get_short_description(),
			'post_title'     => $product->get_name(),
			'post_parent'    => $product->get_parent_id(),
			'comment_status' => $product->get_reviews_allowed() ? 'open' : 'closed',
			'post_status'    => $product->get_status() ? $product->get_status() : 'publish',
			'menu_order'     => $product->get_menu_order(),
		);
		wp_update_post( $post_data );

		$this->update_post_meta( $product );
		$this->update_terms( $product );
		$this->update_attributes( $product );
		$this->update_version_and_type( $product );
		$product->save_meta_data();

		$post_type = $product->is_type( 'variation' ) ? 'product_variation' : 'product';
		do_action( 'woocommerce_update_' . $post_type, $product->get_id() );

		// Set object_read true once all data is read.
		$product->set_object_read( true );
	}

	/**
	 * Helper method that updates all the post meta for a product based on it's settings in the WC_Product class.
	 *
	 * @param WC_Product Object
	 * @since 2.7.0
	 */
	protected function update_post_meta( $product ) {
		$updated_props     = array();
		$changed_props     = array_keys( $product->get_changes() );
		$meta_key_to_props = array(
			'_visibility'            => 'catalog_visibility',
			'_sku'                   => 'sku',
			'_regular_price'         => 'regular_price',
			'_sale_price'            => 'sale_price',
			'_sale_price_dates_from' => 'date_on_sale_from',
			'_sale_price_dates_to'   => 'date_on_sale_to',
			'total_sales'            => 'total_sales',
			'_tax_status'            => 'tax_status',
			'_tax_class'             => 'tax_class',
			'_manage_stock'          => 'manage_stock',
			'_backorders'            => 'backorders',
			'_sold_individually'     => 'sold_individually',
			'_weight'                => 'weight',
			'_length'                => 'length',
			'_width'                 => 'width',
			'_height'                => 'height',
			'_upsell_ids'            => 'upsell_ids',
			'_crosssell_ids'         => 'cross_sell_ids',
			'_purchase_note'         => 'purchase_note',
			'_default_attributes'    => 'default_attributes',
			'_virtual'               => 'virtual',
			'_downloadable'          => 'downloadable',
			'_product_image_gallery' => 'gallery_image_ids',
			'_download_limit'        => 'download_limit',
			'_download_expiry'       => 'download_expiry',
			'_featured'              => 'featured',
			'_thumbnail_id'          => 'image_id',
			'_downloadable_files'    => 'downloads',
			'_stock'                 => 'stock_quantity',
			'_stock_status'          => 'stock_status',
		);

		foreach ( $meta_key_to_props as $meta_key => $prop ) {
			if ( ! in_array( $prop, $changed_props ) ) {
				continue;
			}
			$value = $product->{"get_$prop"}( 'edit' );
			switch ( $prop ) {
				case 'virtual' :
				case 'downloadable' :
					$updated = update_post_meta( $product->get_id(), $meta_key, wc_bool_to_string( $value ) );
					break;
				case 'gallery_image_ids' :
					$updated = update_post_meta( $product->get_id(), $meta_key, implode( ',', $value ) );
					break;
				case 'image_id' :
					if ( ! empty( $value ) ) {
						set_post_thumbnail( $product->get_id(), $value );
					} else {
						delete_post_meta( $product->get_id(), '_thumbnail_id' );
					}
					$updated = true;
					break;
				default :
					$updated = update_post_meta( $product->get_id(), $meta_key, $value );
					break;
			}
			if ( $updated ) {
				$updated_props[] = $prop;
			}
		}

		if ( $product->is_on_sale() ) {
			update_post_meta( $product->get_id(), '_price', $product->get_sale_price() );
		} else {
			update_post_meta( $product->get_id(), '_price', $product->get_regular_price() );
		}

		if ( in_array( 'featured', $updated_props ) ) {
			delete_transient( 'wc_featured_products' );
		}

		if ( in_array( 'downloads', $updated_props ) ) {
			// grant permission to any newly added files on any existing orders for this product prior to saving.
			if ( $product->is_type( 'variation' ) ) {
				do_action( 'woocommerce_process_product_file_download_paths', $product->get_parent_id(), $product->get_id(), $product->get_downloads() );
			} else {
				do_action( 'woocommerce_process_product_file_download_paths', $product->get_id(), 0, $product->get_downloads() );
			}
		}

		if ( in_array( 'stock_quantity', $updated_props ) ) {
			do_action( $product->is_type( 'variation' ) ? 'woocommerce_variation_set_stock' : 'woocommerce_product_set_stock' , $product );
		}

		if ( in_array( 'stock_status', $updated_props ) ) {
			do_action( $product->is_type( 'variation' ) ? 'woocommerce_variation_set_stock_status' : 'woocommerce_product_set_stock_status' , $product->get_id(), $product->get_stock_status() );
		}

		// Update extra data associated with the product.
		// Like button text or product URL for external products.
		if ( ! $this->extra_data_saved ) {
			foreach ( $product->get_extra_data_keys() as $key ) {
				$function = 'get_' . $key;
				if ( in_array( $key, $changed_props ) && is_callable( array( $product, $function ) ) ) {
					update_post_meta( $product->get_id(), '_' . $key, $product->{$function}( 'edit' ) );
				}
			}
		}
	}

	/**
	 * For all stored terms in all taxonomies, save them to the DB.
	 *
	 * @param WC_Product Object
	 * @since 2.7.0
	 */
	protected function update_terms( $product ) {
		wp_set_post_terms( $product->get_id(), $product->get_category_ids(), 'product_cat', false );
		wp_set_post_terms( $product->get_id(), $product->get_tag_ids(), 'product_tag', false );
		wp_set_post_terms( $product->get_id(), array( $product->get_shipping_class_id() ), 'product_shipping_class', false );
	}

	/**
	 * Update attributes which are a mix of terms and meta data.
	 *
	 * @param WC_Product Object
	 * @since 2.7.0
	 */
	protected function update_attributes( $product ) {
		$attributes  = $product->get_attributes();
		$meta_values = array();

		if ( $attributes ) {
			foreach ( $attributes as $attribute_key => $attribute ) {
				$value = '';

				if ( is_null( $attribute ) ) {
					if ( taxonomy_exists( $attribute_key ) ) {
						// Handle attributes that have been unset.
						wp_set_object_terms( $product->get_id(), array(), $attribute_key );
					}
					continue;

				} elseif ( $attribute->is_taxonomy() ) {
					wp_set_object_terms( $product->get_id(), wp_list_pluck( $attribute->get_terms(), 'term_id' ), $attribute->get_name() );

				} else {
					$value = wc_implode_text_attributes( $attribute->get_options() );
				}

				// Store in format WC uses in meta.
				$meta_values[ $attribute_key ] = array(
					'name'         => $attribute->get_name(),
					'value'        => $value,
					'position'     => $attribute->get_position(),
					'is_visible'   => $attribute->get_visible() ? 1 : 0,
					'is_variation' => $attribute->get_variation() ? 1 : 0,
					'is_taxonomy'  => $attribute->is_taxonomy() ? 1 : 0,
				);
			}
		}
		update_post_meta( $product->get_id(), '_product_attributes', $meta_values );
	}

	/**
	 * Makes sure the proper product type and product version are set when saving this product.
	 *
	 * @param WC_Product Object
	 * @since 2.7.0
	 */
	private function update_version_and_type( $product ) {
		// Make sure we store the product type.
		$type_term = get_term_by( 'name', $product->get_type(), 'product_type' );
		wp_set_object_terms( $product->get_id(), absint( $type_term->term_id ), 'product_type' );

		// Version is set to current WC version to track data changes.
		update_post_meta( $product->get_id(), '_product_version', WC_VERSION );
		wc_delete_product_transients( $product->get_id() );
	}

	/**
	 * Deletes a product from the database.
	 * @param WC_Product Object
	 * @param bool $force_delete True to permently delete, false to trash.
	 */
	public function delete( &$product, $force_delete = false ) {
		$id        = $product->get_id();
		$post_type = $product->is_type( 'variation' ) ? 'product_variation' : 'product';

		if ( $force_delete ) {
			wp_delete_post( $product->get_id() );
			$product->set_id( 0 );
		} else {
			wp_trash_post( $product->get_id() );
			$product->set_status( 'trash' );
		}
		do_action( 'woocommerce_delete_' . $post_type, $id );
	}
}
