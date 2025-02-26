<?php
/**
 * ProductDownloads AdminPreview class file.
 *
 * @package WooCommerce\Internal\ProductDownloads
 */

namespace Automattic\WooCommerce\Internal\ProductDownloads;

use Automattic\WooCommerce\Internal\RegisterHooksInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Class for handling secure admin previews of downloadable product files
 * that would otherwise be inaccessible due to server security configurations.
 *
 * @since x.x.x
 */
class AdminPreview implements RegisterHooksInterface {

	/**
	 * Register hooks.
	 */
	public function register() {
		add_action( 'init', array( $this, 'serve_admin_image_src' ), 5 );
	}

	/**
	 * Get secure URL for admin image that works with image src attributes
	 *
	 * @param int    $product_id    Product ID.
	 * @param int    $attachment_id Attachment ID.
	 * @param string $size          Image size.
	 * @return string Secure admin image URL.
	 *
	 * @since x.x.x
	 */
	public function get_admin_image_src_url( $product_id, $attachment_id, $size ) {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return '';
		}

		return add_query_arg(
			array(
				'wc-uploads-image-src' => $attachment_id,
				'product'              => $product_id,
				'nonce'                => wp_create_nonce( 'admin-image-src-' . $attachment_id ),
				'size'                 => $size,
			),
			trailingslashit( home_url() )
		);
	}

	/**
	 * Serve image directly with appropriate headers for src attributes
	 *
	 * @since x.x.x
	 */
	public function serve_admin_image_src() {
		if ( ! isset( $_GET['wc-uploads-image-src'] )
			|| ! isset( $_GET['product'] )
			|| ! isset( $_GET['nonce'] ) ) {
			return;
		}

		$attachment_id = absint( $_GET['wc-uploads-image-src'] );

		// Security check.
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['nonce'] ) ), 'admin-image-src-' . $attachment_id )
			|| ! current_user_can( 'manage_woocommerce' )
		) {
			$this->download_error( __( 'Invalid access token', 'woocommerce' ), '', 403 );
		}

		// Get file path.
		$file_path = get_attached_file( $attachment_id );
		if ( ! $file_path || ! file_exists( $file_path ) ) {
			$this->download_error( __( 'File not found', 'woocommerce' ), '', 404 );
		}

		// Only allow image mime types.
		$mime_type        = get_post_mime_type( $attachment_id );
		$allowed_mime_types = array(
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
			'image/webp',
		);
		if ( ! in_array( $mime_type, $allowed_mime_types, true ) ) {
			$this->download_error( __( 'Invalid file type', 'woocommerce' ), '', 403 );
		}

		// Handle image size requests - use 'large' as maximum size, 'full' can be too large
		$requested_size = isset( $_GET['size'] ) ? sanitize_text_field( wp_unslash( $_GET['size'] ) ) : 'full';
		$size = $requested_size === 'full' ? 'large' : $requested_size;

		$resized = image_get_intermediate_size( $attachment_id, $size );
		if ( $resized && isset( $resized['path'] ) ) {
			$uploads_dir      = wp_upload_dir();
			$resized_file_path = $uploads_dir['basedir'] . '/' . $resized['path'];
			if ( file_exists( $resized_file_path ) ) {
				$file_path = $resized_file_path;
			}
		}

		// Prevent any accidental output.
		$this->clean_buffers();

		// Set headers for direct viewing in browser.
		nocache_headers();
		header( 'Content-Type: ' . $mime_type );
		header( 'Content-Length: ' . filesize( $file_path ) );
		header( 'Content-Disposition: inline; filename="' . basename( $file_path ) . '"' );

		readfile( $file_path );
		exit;
	}

	/**
	 * Clean all output buffers.
	 *
	 * Can prevent errors, for example: transfer closed with 3 bytes remaining to read.
	 */
	private function clean_buffers() {
		if ( ob_get_level() ) {
			$levels = ob_get_level();
			for ( $i = 0; $i < $levels; $i++ ) {
				@ob_end_clean(); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}
		} else {
			@ob_end_clean(); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}
	}

	/**
	 * Die with an error message if the download fails.
	 *
	 * @param string $message Error message.
	 * @param string $title   Error title.
	 * @param int    $status  Error status.
	 */
	private function download_error( $message, $title = '', $status = 404 ) {
		if ( ! strstr( $message, '<a ' ) ) {
			$message .= ' <a href="' . esc_url( wc_get_page_permalink( 'shop' ) ) . '" class="wc-forward">' . esc_html__( 'Go to shop', 'woocommerce' ) . '</a>';
		}
		wp_die( $message, $title, array( 'response' => $status ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}
