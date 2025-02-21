<?php
/**
 * WC_BIS_Email_Previewable interface.
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    x.x.x
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interface used to signal that an email class has the necessary methods to build a custom preview.
 *
 * @interface WC_BIS_Email_Previewable
 * @version  x.x.x
 */
interface WC_BIS_Email_Previewable {
	/**
	 * Prepares the email based on the notification data.
	 *
	 * @param WC_BIS_Notification_Data $notification Notification data.
	 *
	 * @return void
	 */
	public function prepare_email( WC_BIS_Notification_Data $notification ): void;
}
