<?php
/**
 * Update Functions
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Update 1.1.0 db function.
 *
 * @return void
 */
function wc_bis_update_110_main() {

	// Find activities with empty email value and restore them.
	$activities = WC_BIS()->db->activity->query(
		array(
			'return'     => 'objects',
			'user_email' => '',
			'user_id'    => 0,
		)
	);

	if ( empty( $activities ) ) {
		// No work needed.
		return;
	}

	// Start migrating.
	foreach ( $activities as $activity ) {
		$notification = wc_bis_get_notification( $activity->get_notification_id() );
		if ( $notification ) {
			$activity->set_user_email( $notification->get_user_email() );
			$activity->save();
		}
	}
}

/**
 * Update 1.1.0 db version function.
 *
 * @return void
 */
function wc_bis_update_110_db_version() {
	WC_BIS_Install::update_db_version( '1.1.0' );
}
