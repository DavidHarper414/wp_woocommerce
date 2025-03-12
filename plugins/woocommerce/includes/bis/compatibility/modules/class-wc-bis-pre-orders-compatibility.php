<?php
/**
 * WC_BIS_Pre_Orders_Compatibility class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.4
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce Pre-Orders compatibility.
 *
 * @version  1.0.4
 */
class WC_BIS_Pre_Orders_Compatibility {

	/**
	 * Initialize integration.
	 */
	public static function init() {

		// Replace email subject.
		add_filter( 'woocommerce_email_subject_bis_notification_received', array( __CLASS__, 'replace_email_subject' ), 11, 3 );

		// Replace email heading title.
		add_filter( 'woocommerce_email_heading_bis_notification_received', array( __CLASS__, 'replace_email_heading' ), 11, 3 );

		// Replace intro content.
		add_filter( 'woocommerce_bis_email_intro_content', array( __CLASS__, 'replace_email_intro_content' ), 11, 3 );

		// Replace action button text.
		add_filter( 'woocommerce_bis_email_received_button_text', array( __CLASS__, 'replace_email_action_button_text' ), 11, 2 );
	}

	/**
	 * Replace email subject.
	 */
	public static function replace_email_subject( $subject, $notification, $email ) {

		if ( ! is_a( $email, 'WC_Email' ) || 'bis_notification_received' !== $email->id ) {
			return $subject;
		}

		$notification = $email->object;
		$product      = $notification->get_product();
		if ( is_a( $product, 'WC_Product' ) && WC_Pre_Orders_Product::product_can_be_pre_ordered( $product ) ) {
			$subject = apply_filters( 'woocommerce_bis_po_email_subject', _x( '"{product_name}" is now available for pre-order!', 'Pre-Order Email notification', 'woocommerce' ), $product );
			$subject = $email->format_string( $subject );
		}

		return $subject;
	}

	/**
	 * Replace email heading.
	 */
	public static function replace_email_heading( $heading, $notification, $email ) {
		if ( ! is_a( $email, 'WC_Email' ) || 'bis_notification_received' !== $email->id ) {
			return $heading;
		}

		$notification = $email->object;
		$product      = $notification->get_product();
		if ( is_a( $product, 'WC_Product' ) && WC_Pre_Orders_Product::product_can_be_pre_ordered( $product ) ) {
			$heading = apply_filters( 'woocommerce_bis_po_email_heading', _x( 'Now available for pre-order!', 'Pre-Order Email notification', 'woocommerce' ), $product );
			$heading = $email->format_string( $heading );
		}

		return $heading;
	}

	/**
	 * Replace email intro content.
	 */
	public static function replace_email_intro_content( $intro_content, $notification, $email ) {
		if ( ! is_a( $email, 'WC_Email' ) || ! in_array( $email->id, array( 'bis_notification_received', 'bis_notification_confirm' ) ) ) {
			return $intro_content;
		}

		$notification = $email->object;
		$product      = $notification->get_product();
		if ( is_a( $product, 'WC_Product' ) && WC_Pre_Orders_Product::product_can_be_pre_ordered( $product ) ) {

			if ( 'bis_notification_received' === $email->id ) {
				$intro_content = apply_filters( 'woocommerce_bis_po_email_intro_content', _x( 'Great news: You can now pre-order "{product_name}"!', 'Pre-Order Email notification', 'woocommerce' ), $product );
			} elseif ( 'bis_notification_confirm' === $email->id ) {
				$intro_content = apply_filters( 'woocommerce_bis_po_email_confirm_intro_content', _x( 'Thanks for joining the waitlist! You will hear from us again when "{product_name}" is available.', 'Pre-Order Email notification', 'woocommerce' ), $product );
			}

			$intro_content = $email->format_string( $intro_content );
		}

		return $intro_content;
	}

	/**
	 * Replace email action button.
	 */
	public static function replace_email_action_button_text( $text, $notification ) {
		$product = $notification->get_product();

		if ( is_a( $product, 'WC_Product' ) && WC_Pre_Orders_Product::product_can_be_pre_ordered( $product ) ) {
			$text = apply_filters( 'woocommerce_bis_po_email_action_button_text', esc_html_x( 'Pre-Order Now', 'Pre-Order Email notification', 'woocommerce' ), $product );
		}

		return $text;
	}
}

WC_BIS_Pre_Orders_Compatibility::init();
