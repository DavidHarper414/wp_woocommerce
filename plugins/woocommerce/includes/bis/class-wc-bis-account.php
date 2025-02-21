<?php
/**
 * WC_BIS_Account class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Account class.
 *
 * @class    WC_BIS_Account
 * @version  1.6.0
 */
class WC_BIS_Account {

	/**
	 * Cache query vars locally to avoid multiple get_option calls.
	 *
	 * @since 1.4.0
	 * @var array
	 */
	protected $query_vars = array();

	/**
	 * Hook.
	 */
	public function __construct() {

		// Add menu item.
		add_action( 'woocommerce_account_menu_items', array( $this, 'add_navigation_item' ) );

		// Add endpoint setting.
		add_action( 'woocommerce_settings_pages', array( $this, 'add_endpoint_setting' ) );

		// Form handler.
		add_action( 'template_redirect', array( $this, 'process_registration' ) );
		add_action( 'template_redirect', array( $this, 'process_reactivate' ) );
		add_action( 'template_redirect', array( $this, 'process_deactivate' ) );
		add_action( 'template_redirect', array( $this, 'process_unsubscribe' ) );
		add_action( 'template_redirect', array( $this, 'process_verify' ) );
		add_action( 'template_redirect', array( $this, 'process_resend_verification' ) );
		add_action( 'template_redirect', array( $this, 'process_cancel_pending_verification' ) );

		// Page.
		add_action( 'woocommerce_account_backinstock_endpoint', array( $this, 'render_page' ) );
		add_action( 'woocommerce_endpoint_backinstock_title', array( $this, 'get_endpoint_title' ), 10, 2 );
		add_action( 'woocommerce_get_query_vars', array( $this, 'add_query_var' ) );

		// Migrate new users.
		add_action( 'user_register', array( $this, 'migrate_new_user_data' ) );
		add_action( 'profile_update', array( $this, 'migrate_updated_user_data' ), 10, 2 );

		$this->init_query_vars();
	}

	/**
	 * Init query vars by loading options.
	 *
	 * @since 1.4.0
	 */
	public function init_query_vars() {
		$this->query_vars['backinstock'] = get_option( 'woocommerce_myaccount_backinstock_endpoint', 'backinstock' );
	}

	/**
	 * Render page html.
	 *
	 * @return void
	 */
	public function render_page( $current_page ) {

		// Split two paginations using the "|" symbol.
		$current_pages              = ! empty( $current_page ) ? explode( '|', urldecode( $current_page ) ) : array();
		$current_pages              = array_map( 'absint', $current_pages );
		$notifications_current_page = isset( $current_pages[0] ) ? $current_pages[0] : 1;
		$activities_current_page    = isset( $current_pages[1] ) ? $current_pages[1] : 1;

		/**
		 * `woocommerce_bis_account_notifications_per_page` filter.
		 * How many notifications to show per page.
		 *
		 * @since 1.1.2
		 *
		 * @param  int  $per_page
		 * @return int
		 */
		$notifications_per_page = (int) apply_filters( 'woocommerce_bis_account_notifications_per_page', 10 );
		// Notifications.
		$query_args = array(
			'is_active'      => 'on',
			'product_exists' => true,
			'product_status' => 'publish',
			'user_id'        => get_current_user_id(),
			'order_by'       => array( 'id' => 'DESC' ),
			'limit'          => $notifications_per_page,
			'offset'         => ( $notifications_current_page - 1 ) * $notifications_per_page,
		);

		// Check for user roles.
		$user                                  = wp_get_current_user();
		$allowed_roles                         = array( 'shop_manager', 'administrator' );
		$is_user_eligible_for_private_products = is_a( $user, 'WP_User' ) && array_intersect( $allowed_roles, $user->roles );

		if ( $is_user_eligible_for_private_products ) {
			// Allow private products as well.
			unset( $query_args['product_status'] );
		}

		$notifications     = wc_bis_get_notifications( $query_args );
		$has_notifications = ! empty( $notifications ) ? true : false;

		// Count total items.
		$query_args['count'] = true;
		unset( $query_args['limit'] );
		unset( $query_args['offset'] );
		$total_notifications       = WC_BIS()->db->notifications->query( $query_args );
		$total_notifications_pages = ceil( $total_notifications / $notifications_per_page );

		$template_args = array(
			'activities_current_page'    => $activities_current_page,
			'notifications_current_page' => $notifications_current_page,
			'total_notifications_pages'  => $total_notifications_pages,
			'has_notifications'          => $has_notifications,
			'notifications'              => $notifications,
		);

		/**
		 * `woocommerce_bis_account_show_activities` filter.
		 *
		 * Whether or not to show the Activities table in My Account page.
		 *
		 * @since 1.1.3
		 *
		 * @param  bool  $show
		 * @return bool
		 */
		$show_activities = (bool) apply_filters( 'woocommerce_bis_account_show_activities', true );
		if ( $show_activities ) {

			/**
			 * `woocommerce_bis_account_activities_per_page` filter.
			 *
			 * How many notifications to show per page.
			 *
			 * @since 1.1.2
			 *
			 * @param  bool  $show
			 * @return bool
			 */
			$activities_per_page = (int) apply_filters( 'woocommerce_bis_account_activities_per_page', 10 );
			// Activities.
			$activities     = WC_BIS()->db->activity->get_activity_by_user( get_current_user_id(), $activities_per_page, ( $activities_current_page - 1 ) * $activities_per_page );
			$has_activities = count( $activities ) > 0 ? true : false;

			// Count total items.
			$total_activities       = WC_BIS()->db->activity->get_total_activity_records_by_user( get_current_user_id() );
			$total_activities_pages = ceil( $total_activities / $activities_per_page );

			$template_args = array_merge(
				$template_args,
				array(
					'total_activities_pages' => $total_activities_pages,
					'has_activities'         => $has_activities,
					'activities'             => $activities,
				)
			);
		}

		/**
		 * `woocommerce_bis_account_show_pending_notifications` filter.
		 *
		 * Whether or not to show the Activities table in My Account page.
		 *
		 * @since 1.2.0
		 *
		 * @param  bool  $show
		 * @return bool
		 */
		$show_pending = (bool) apply_filters( 'woocommerce_bis_account_show_pending_notifications', true );
		if ( $show_pending ) {

			// Pending Notifications.
			$pending_query_args = array(
				'is_active'      => 'off',
				'is_verified'    => 'no',
				'product_exists' => true,
				'product_status' => 'publish',
				'user_id'        => get_current_user_id(),
				'meta_query'     => array(
					'relation' => 'AND',
					array(
						'key'     => 'awaiting_verification',
						'value'   => 'yes',
						'compare' => '=',
					),
				),
				'order_by'       => array( 'id' => 'DESC' ),
			);

			if ( $is_user_eligible_for_private_products ) {
				// Allow private products as well.
				unset( $pending_query_args['product_status'] );
			}

			$pending_notifications     = wc_bis_get_notifications( $pending_query_args );
			$has_pending_notifications = ! empty( $pending_notifications );
			$template_args             = array_merge(
				$template_args,
				array(
					'pending_notifications'     => $pending_notifications,
					'has_pending_notifications' => $has_pending_notifications,
				)
			);
		}

		// Add element classes.
		$template_args['button_class'] = implode(
			' ',
			array_filter(
				array(
					'button',
					'woocommerce-Button',
					wc_bis_wp_theme_get_element_class_name( 'button' ),
				)
			)
		);

		wc_get_template(
			'myaccount/back-in-stock.php',
			$template_args
		);
	}

	/*
	---------------------------------------------------*/
	/*
		Action handlers.                                 */
	/*---------------------------------------------------*/

	/**
	 * Process registration.
	 *
	 * @return void
	 */
	public function process_registration() {

		if ( ! empty( $_GET['wc_bis_registration'] ) ) {

			if ( ! is_wc_endpoint_url( 'backinstock' ) ) {
				return;
			}

			if ( ! is_user_logged_in() ) {
				$enable_myaccount_registration = get_option( 'woocommerce_enable_myaccount_registration', 'no' );

				// Notice text based on environment.
				$create_account_text = __( ', or create a new account now.', 'woocommerce' );
				/* translators: create_account_text */
				$notice_text = sprintf( __( 'Please log in to complete the sign-up process%s.', 'woocommerce' ), 'yes' === $enable_myaccount_registration ? $create_account_text : '' );

				wc_add_notice( $notice_text, 'notice' );
				return;
			}

			// Sanity.
			if ( ! isset( $_GET['args'] ) ) {
				return;
			}

			try {

				// Init props.
				$args = array(
					'product_id'     => isset( $_GET['args']['product_id'] ) ? absint( $_GET['args']['product_id'] ) : 0,
					'subscribe_date' => isset( $_GET['args']['subscribe_date'] ) ? absint( $_GET['args']['subscribe_date'] ) : 0,
				);

				// Parse current current user.
				$user               = wp_get_current_user();
				$args['user_id']    = $user->ID;
				$args['user_email'] = $user->user_email;

				// Parse posted attributes.
				$handle_posted_attributes = isset( $_GET['handle_posted_attributes'] ) && 1 == $_GET['handle_posted_attributes'] ? true : false;
				$posted_attributes        = isset( $_GET['posted_attributes'] ) ? wc_clean( $_GET['posted_attributes'] ) : array();

				/**
				 * Handle sign-up.
				 *
				 * `woocommerce_bis_sign_up_account_args` filter.
				 *
				 * @since 1.2.0
				 * @param  array  $args
				 * @return array
				 */
				$signup_args  = (array) apply_filters( 'woocommerce_bis_sign_up_account_args', $args );
				$notification = $this->signup( $signup_args, $handle_posted_attributes ? $posted_attributes : array() );
				if ( ! $notification ) {
					throw new Exception( __( 'Sign up failed. Please try again.', 'woocommerce' ) );
				}

				$redirect_url = $notification ? $notification->get_product_permalink() : '';

			} catch ( Exception $e ) {
				wc_add_notice( $e->getMessage(), 'error' );
			}

			if ( ! empty( $redirect_url ) ) {
				$redirect_url = apply_filters( 'woocommerce_bis_after_login_page_redirect_url', $redirect_url, $notification );
				wp_safe_redirect( $redirect_url );
				exit;
			}
		}
	}

	/**
	 * Signup.
	 *
	 * Handles the signing up session based on the arguments specified.
	 * Creates a new notification or reactivates an existing one, based on the "user + product" unique footprint.
	 *
	 * @since 1.2.0
	 *
	 * @throws Exception
	 *
	 * @param  array $args        Notification args.
	 * @param  array $attributes  Variation attributes in a 'key=>value' format.
	 * @return WC_BIS_Notification_Data|false
	 */
	public function signup( $args, $attributes = array() ) {

		// Bail early.
		if ( empty( $args ) || ! is_array( $attributes ) ) {
			return false;
		}

		// Extract args.
		$account_created = isset( $args['account_created'] );
		unset( $args['account_created'] );

		// Check if a notification with 'user + product' footprint exists.
		$notification = wc_bis_notification_exists( $args, $attributes );
		if ( is_a( $notification, 'WC_BIS_Notification_Data' ) ) {

			if ( $notification->is_active() ) {

				$notice_text     = esc_html__( 'You have already joined this waitlist.', 'woocommerce' );
				$button_class    = wc_bis_wp_theme_get_element_class_name( 'button' );
				$wp_button_class = $button_class ? ' ' . $button_class : '';
				$notice          = sprintf( '<a href="%s" class="button wc-forward%s">%s</a> %s', wc_get_account_endpoint_url( 'backinstock' ), $wp_button_class, esc_html__( 'Manage notifications', 'woocommerce' ), $notice_text );
				if ( is_user_logged_in() ) {
					wc_add_notice( $notice, 'success' );
				} else {
					wc_add_notice( $notice_text, 'success' );
				}
			} elseif ( wc_bis_double_opt_in_required() ) {

				$notification->set_verified_status( 'no' );
				$notification->save();

				if ( ! $notification->is_verification_data_valid() ) {

					// Update renew verification code.
					if ( $notification->maybe_setup_verification_data() ) {

						$notification->save();
						do_action( 'woocommerce_bis_verify_notification_to_customer', $notification );

						if ( $account_created ) {
							wc_add_notice( esc_html__( 'Thanks for signing up! An account has been created for you. Please complete the sign-up process by following the verification link sent to your e-mail.', 'woocommerce' ) );
						} else {
							wc_add_notice( esc_html__( 'Thanks for signing up! Please complete the sign-up process by following the verification link sent to your e-mail.', 'woocommerce' ) );
						}
					}
				} else {

					// Code is valid. Show an noop notice.
					$notice_text     = esc_html__( 'You have already joined this waitlist. Please complete the sign-up process by following the verification link sent to your e-mail.', 'woocommerce' );
					$url             = wp_nonce_url( add_query_arg( array( 'wc_bis_resend_notification' => $notification->get_id() ), $notification->get_product_permalink() ), 'resend_verification_email_nonce' );
					$button_class    = wc_bis_wp_theme_get_element_class_name( 'button' );
					$wp_button_class = $button_class ? ' ' . $button_class : '';
					$notice          = sprintf( '<a href="%s" class="button wc-forward%s">%s</a> %s', $url, $wp_button_class, esc_html__( 'Resend verification', 'woocommerce' ), $notice_text );

					wc_add_notice( $notice, 'success' );
				}
			} else {

				$notification->reactivate();
				$notification->set_verified_status( 'yes' );
				$notification->delete_meta( 'awaiting_verification' );
				if ( $notification->save() ) {

					if ( $account_created ) {
						/* translators: Product name */
						$notice_text = sprintf( esc_html__( 'You have successfully signed up and will be notified when "%s" is back in stock! Note that a new account has been created for you; please check your e-mail for details.', 'woocommerce' ), $notification->get_product_name() );
					} else {
						/* translators: Product name */
						$notice_text = sprintf( esc_html__( 'You have successfully signed up! You will be notified when "%s" is back in stock.', 'woocommerce' ), $notification->get_product_name() );
					}

					if ( is_user_logged_in() ) {
						$button_class    = wc_bis_wp_theme_get_element_class_name( 'button' );
						$wp_button_class = $button_class ? ' ' . $button_class : '';
						$notice          = sprintf( '<a href="%s" class="button wc-forward%s">%s</a> %s', wc_get_account_endpoint_url( 'backinstock' ), $wp_button_class, esc_html__( 'Manage notifications', 'woocommerce' ), $notice_text );
						wc_add_notice( $notice, 'success' );
					} else {
						wc_add_notice( $notice_text, 'success' );
					}

					// Send email.
					do_action( 'woocommerce_bis_confirm_notification_to_customer', $notification );
				}
			}
		} else {

			// New notification.
			$args['is_verified'] = ! wc_bis_double_opt_in_required() ? 'yes' : 'no';
			$args['locale']      = get_locale();
			$id                  = WC_BIS()->db->notifications->add( $args );

			if ( $id ) {

				$save_required = false;
				$notification  = wc_bis_get_notification( $id );
				if ( ! empty( $attributes ) ) {
					$notification->add_meta( 'posted_attributes', $attributes );
					$save_required = true;
				}

				$notification->add_event( 'created', wp_get_current_user() );
				if ( ! wc_bis_double_opt_in_required() ) {

					if ( $account_created ) {
						/* translators: Product name */
						$notice_text = sprintf( esc_html__( 'You have successfully signed up and will be notified when "%s" is back in stock! Note that a new account has been created for you; please check your e-mail for details.', 'woocommerce' ), $notification->get_product_name() );
					} else {
						/* translators: Product name */
						$notice_text = sprintf( esc_html__( 'You have successfully signed up! You will be notified when "%s" is back in stock.', 'woocommerce' ), $notification->get_product_name() );
					}

					if ( is_user_logged_in() ) {

						$button_class    = wc_bis_wp_theme_get_element_class_name( 'button' );
						$wp_button_class = $button_class ? ' ' . $button_class : '';
						$notice          = sprintf( '<a href="%s" class="button wc-forward%s">%s</a> %s', wc_get_account_endpoint_url( 'backinstock' ), $wp_button_class, esc_html__( 'Manage notifications', 'woocommerce' ), $notice_text );
						wc_add_notice( $notice, 'success' );
					} else {
						wc_add_notice( $notice_text, 'success' );
					}

					// Send email.
					do_action( 'woocommerce_bis_confirm_notification_to_customer', $notification );

				} else {

					if ( $notification->maybe_setup_verification_data() ) {
						$save_required = true;
					}

					if ( $account_created ) {
						wc_add_notice( esc_html__( 'Thanks for signing up! A new account has been created for you. Please complete the sign-up process by following the verification link sent to your e-mail.', 'woocommerce' ) );
					} else {
						wc_add_notice( esc_html__( 'Thanks for signing up! Please complete the sign-up process by following the verification link sent to your e-mail.', 'woocommerce' ) );
					}

					do_action( 'woocommerce_bis_verify_notification_to_customer', $notification );
				}

				if ( $save_required ) {
					$notification->save();
				}
			}
		}

		return is_a( $notification, 'WC_BIS_Notification_Data' ) ? $notification : false;
	}


	/**
	 * Process data when re-activate.
	 *
	 * @return void
	 */
	public function process_reactivate() {

		if ( empty( $_GET['wc_bis_reactivate'] ) ) {
			return;
		}

		if ( ! is_numeric( $_GET['wc_bis_reactivate'] ) || ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( wc_clean( $_REQUEST['_wpnonce'] ), 'reactivate_notification_account_nonce' ) ) {
			wc_add_notice( __( 'We were unable to process your request. Please try again later, or get in touch with us for assistance.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $this->get_endpoint_url() );
			exit;
		}

		// Reactivate.
		$notification = wc_bis_get_notification( absint( $_GET['wc_bis_reactivate'] ) );
		if ( ! is_a( $notification, 'WC_BIS_Notification_Data' ) ) {
			wc_add_notice( __( 'We were unable to process your request. Notification not found.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $this->get_endpoint_url() );
			exit;
		}

		if ( ! is_user_logged_in() || $notification->is_pending() || $notification->get_user_id() !== get_current_user_id() ) {
			wc_add_notice( __( 'We were unable to authorize your request. Please try again later, or get in touch with us for assistance.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $this->get_endpoint_url() );
			exit;
		}

		// From now on, we know that the request came from the "Undo" button.
		$notification->reactivate();
		// Handle double opt-in.
		// Hint: Notifications get unverified when they deactivated from the account page. @see process_deactivate().
		if ( ! $notification->is_verified() ) {
			$notification->set_verified_status( 'yes' );
		}

		if ( $notification->save() ) {
			wc_add_notice( __( 'Notification reactivated.', 'woocommerce' ), 'success' );
		}

		wp_safe_redirect( $this->get_endpoint_url() );
		exit;
	}

	/**
	 * Process data when deactivating.
	 *
	 * @return void
	 */
	public function process_deactivate() {

		if ( empty( $_GET['wc_bis_deactivate'] ) ) {
			return;
		}

		if ( ! is_numeric( $_GET['wc_bis_deactivate'] ) || ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( wc_clean( $_REQUEST['_wpnonce'] ), 'deactivate_notification_account_nonce' ) ) {
			wc_add_notice( __( 'We were unable to process your request. Please try again later, or get in touch with us for assistance.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $this->get_endpoint_url() );
			exit;
		}

		// Reactivate.
		$notification = wc_bis_get_notification( absint( $_GET['wc_bis_deactivate'] ) );
		if ( ! is_a( $notification, 'WC_BIS_Notification_Data' ) ) {
			wc_add_notice( __( 'We were unable to process your request. Notification not found.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $this->get_endpoint_url() );
			exit;
		}

		if ( ! is_user_logged_in() || $notification->get_user_id() !== get_current_user_id() ) {
			wc_add_notice( __( 'We were unable to process your request. Please try again later, or get in touch with us for assistance.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $this->get_endpoint_url() );
			exit;
		}

		$notification->deactivate();
		// Handle double-opt-in invalidation.
		if ( wc_bis_double_opt_in_required() ) {
			$notification->set_verified_status( 'no' );
			$notification->invalidate_verification_data();
		}

		if ( $notification->save() ) {
			$notice_text     = esc_html__( 'Notification deactivated.', 'woocommerce' );
			$button_class    = wc_bis_wp_theme_get_element_class_name( 'button' );
			$wp_button_class = $button_class ? ' ' . $button_class : '';
			$notice          = sprintf( '<a href="%s" class="button wc-forward%s">%s</a> %s', wp_nonce_url( add_query_arg( array( 'wc_bis_reactivate' => $notification->get_id() ), $this->get_endpoint_url() ), 'reactivate_notification_account_nonce' ), $wp_button_class, esc_html__( 'Undo', 'woocommerce' ), $notice_text );
			wc_add_notice( $notice, 'success' );
		}

		wp_safe_redirect( $this->get_endpoint_url() );
		exit;
	}

	/**
	 * Process data when verifying.
	 *
	 * @since 1.2.0
	 *
	 * @return void
	 */
	public function process_verify() {
		if ( empty( $_GET['bis_ver'] ) ) {
			return;
		}

		$requested_notification = isset( $_GET['bis_ver_id'] ) ? absint( $_GET['bis_ver_id'] ) : 0;
		$verify_hash            = isset( $_GET['bis_ver'] ) ? wc_clean( $_GET['bis_ver'] ) : '';
		$verify_code            = isset( $_GET['bis_ver_code'] ) ? wc_clean( $_GET['bis_ver_code'] ) : '';
		$current_notification   = wc_bis_get_notification( $requested_notification );

		/**
		 * `woocommerce_bis_verify_url` filter.
		 *
		 * @since 1.2.0
		 *
		 * @param  string  $url
		 * @return string
		 */
		$url = apply_filters( 'woocommerce_bis_verify_url', add_query_arg( array( 'bis_ver_handle' => microtime() ), remove_query_arg( array( 'bis_ver', 'bis_ver_code', 'bis_ver_id' ) ) ) );

		// We need session for notices to work.
		if ( ! WC()->session->has_session() ) {
			// Generate a random customer ID.
			WC()->session->set_customer_session_cookie( true );
		}

		if ( ! is_a( $current_notification, 'WC_BIS_Notification_Data' ) ) {
			wc_add_notice( esc_html__( 'Invalid link.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		if ( ! $current_notification->is_verification_data_valid() || $current_notification->is_active() ) {
			wc_add_notice( esc_html__( 'The verification link you followed has expired.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		$hash_to_check = urldecode( base64_decode( $verify_hash ) );
		if ( ! $current_notification->validate_verification_code( $verify_code, $hash_to_check ) ) {
			wc_add_notice( esc_html__( 'Invalid link.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		$product = $current_notification->get_product();
		if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
			wc_add_notice( esc_html__( 'Invalid product.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		sleep( 1 );
		// All clear...

		$current_notification->set_verified_status( 'yes' );
		$current_notification->set_active( 'on' );
		$current_notification->invalidate_verification_data();
		$current_notification->save();
		$current_notification->add_event( 'verified' );

		// Send the confirmation e-mail.
		do_action( 'woocommerce_bis_confirm_notification_to_customer', $current_notification );

		/* translators: %s product name */
		$notice_text = sprintf( esc_html__( 'Successfully verified stock notifications for "%s".', 'woocommerce' ), $current_notification->get_product_name() );

		if ( is_user_logged_in() ) {

			$button_class    = wc_bis_wp_theme_get_element_class_name( 'button' );
			$wp_button_class = $button_class ? ' ' . $button_class : '';
			$notice          = sprintf( '<a href="%s" class="button wc-forward%s">%s</a> %s', $this->get_endpoint_url(), $wp_button_class, esc_html__( 'Manage notifications', 'woocommerce' ), $notice_text );
			wc_add_notice( $notice, 'success' );
		} else {
			wc_add_notice( $notice_text, 'success' );
		}

		wp_safe_redirect( $url );
		exit;
	}

	/**
	 * Process data when unsubscribing.
	 *
	 * @return void
	 */
	public function process_unsubscribe() {

		if ( empty( $_GET['bis_unsub'] ) ) {
			return;
		}

		$requested_notification = isset( $_GET['bis_unsub_id'] ) ? absint( $_GET['bis_unsub_id'] ) : 0;
		$unsubscribing_hash     = wc_clean( $_GET['bis_unsub'] );
		$is_confirmation        = isset( $_GET['bis_unsub_ref'] ) && 'confirmation' === $_GET['bis_unsub_ref'];

		// Check for backwards compatibility hashes.
		// Hint: Previous hash requests didn't include a 'bis_unsub_id' param.
		$is_legacy_request = empty( $requested_notification );

		/**
		 * `woocommerce_bis_unsubscribe_url` filter.
		 *
		 * @since 1.1.2
		 *
		 * @param  string  $url
		 * @return string
		 */
		$url = apply_filters( 'woocommerce_bis_unsubscribe_url', add_query_arg( array( 'bis_unsub_handle' => microtime() ), remove_query_arg( array( 'bis_unsub', 'bis_unsub_id', 'bis_unsub_ref' ) ) ) );

		// Validate notification and product.
		if ( $is_legacy_request ) {

			$current_notification = WC_BIS()->db->notifications->get_by_hash( $unsubscribing_hash );

			// If notification has one or more new meta data and still uses the legacy way, then it's probably a "bad" or invalid link.
			if ( $current_notification->get_meta( '_hash_iv' ) || $current_notification->get_meta( '_hash_key' ) ) {
				// Reset for safety.
				$current_notification = false;
			}
		} else {

			$current_notification = wc_bis_get_notification( $requested_notification );
			$hash_to_check        = urldecode( base64_decode( $unsubscribing_hash ) );
			if ( ! $current_notification || ! $current_notification->validate_hash( $hash_to_check ) ) {
				// Reset for safety.
				$current_notification = false;
			}
		}

		// We need session for notices to work.
		if ( ! WC()->session->has_session() ) {
			// Generate a random customer ID.
			WC()->session->set_customer_session_cookie( true );
		}

		if ( ! is_a( $current_notification, 'WC_BIS_Notification_Data' ) ) {
			wc_add_notice( esc_html__( 'Invalid link.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		$product = $current_notification->get_product();
		if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
			wc_add_notice( esc_html__( 'Invalid product.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		sleep( 1 );
		// All clear, start deactivating...

		// Has user with this email?
		$user              = get_user_by( 'email', $current_notification->get_user_email() );
		$is_valid_customer = $user && is_a( $user, 'WP_User' );

		/**
		 * `woocommerce_bis_force_customer_unsubscribe_per_product` filter.
		 *
		 * Enable this filter to allow registered customers to force unsubscribe from specific product directly from the email link.
		 *
		 * @since 1.1.3
		 *
		 * @param  bool  $enable
		 * @return bool
		 */
		$force_deactivation = (bool) apply_filters( 'woocommerce_bis_force_customer_unsubscribe_per_product', true );
		$unsubscribe_single = $is_confirmation && ( ! $is_valid_customer || $force_deactivation );

		// Unsubscribe single product?
		if ( $unsubscribe_single ) {

			// Unsubscribe only from this product.
			$notifications = wc_bis_get_notifications(
				array(
					'product_id' => $current_notification->get_product_id(),
					'user_email' => $current_notification->get_user_email(),
				)
			);

			if ( $notifications ) {
				foreach ( $notifications as $notification ) {
					if ( $notification->get_product_id() === $current_notification->get_product_id() && $notification->get_user_email() === $current_notification->get_user_email() && $notification->is_active() ) {
						$notification->deactivate();
						$notification->add_event( 'unsubscribed', $user && is_a( $user, 'WP_User' ) ? $user : $current_notification->get_user_email() );

						$notification->save();
					}
				}
			}

			/* translators: %2$s product name, %1$s user email */
			$notice_text = sprintf( esc_html__( 'Successfully unsubscribed %1$s. You will not receive a notification when "%2$s" becomes available.', 'woocommerce' ), $current_notification->get_user_email(), $product->get_name() );

			if ( is_user_logged_in() ) {

				$button_class    = wc_bis_wp_theme_get_element_class_name( 'button' );
				$wp_button_class = $button_class ? ' ' . $button_class : '';
				$notice          = sprintf( '<a href="%s" class="button wc-forward%s">%s</a> %s', $this->get_endpoint_url(), $wp_button_class, esc_html__( 'Manage notifications', 'woocommerce' ), $notice_text );

				wc_add_notice( $notice, 'success' );
			} else {
				wc_add_notice( $notice_text, 'success' );
			}

			// Unsubscribe all products?
		} elseif ( $is_valid_customer ) {

				// Redirect to account with notice.
			if ( ! is_user_logged_in() ) {
				wc_add_notice( __( 'Please log in to manage your notifications.', 'woocommerce' ), 'notice' );
			}

				wp_safe_redirect( $this->get_endpoint_url() );
				exit;

		} else {

			// Unsubscribe every notification with $email.
			$notifications = wc_bis_get_notifications( array( 'user_email' => $current_notification->get_user_email() ) );
			if ( $notifications ) {
				foreach ( $notifications as $notification ) {
					if ( $notification->get_user_email() === $current_notification->get_user_email() ) {
						$notification->deactivate();
						$notification->add_event( 'unsubscribed', wp_get_current_user() );

						$notification->save();
					}
				}
			}

			/* translators: %s user email */
			$notice_text = sprintf( esc_html__( 'Successfully unsubscribed %s from all stock notifications.', 'woocommerce' ), $current_notification->get_user_email() );
			wc_add_notice( $notice_text, 'success' );
		}

		wp_safe_redirect( $url );
		exit;
	}

	/**
	 * Process resend verification email.
	 *
	 * @since 1.2.0
	 *
	 * @return void
	 */
	public function process_resend_verification() {
		if ( empty( $_GET['wc_bis_resend_notification'] ) ) {
			return;
		}

		$url = remove_query_arg( array( 'wc_bis_resend_notification', '_wpnonce' ) );

		// We need session for notices to work.
		if ( ! WC()->session->has_session() ) {
			// Generate a random customer ID.
			WC()->session->set_customer_session_cookie( true );
		}

		if ( ! is_numeric( $_GET['wc_bis_resend_notification'] ) || ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( wc_clean( $_REQUEST['_wpnonce'] ), 'resend_verification_email_nonce' ) ) {
			wc_add_notice( __( 'We were unable to process your request. Please try again later, or get in touch with us for assistance.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		$notification = wc_bis_get_notification( absint( $_GET['wc_bis_resend_notification'] ) );
		if ( ! is_a( $notification, 'WC_BIS_Notification_Data' ) || ! $notification->is_pending() ) {
			wc_add_notice( esc_html__( 'Invalid link.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		if ( $notification->get_user_id() && ( is_user_logged_in() && $notification->get_user_id() !== get_current_user_id() ) ) {
			wc_add_notice( __( 'We were unable to authorize your request. Please try again later, or get in touch with us for assistance.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		// Before make sure that a new verification code is sent every time.
		$notification->invalidate_verification_data();

		// Force send the email.
		do_action( 'woocommerce_bis_verify_notification_to_customer', $notification );

		/* translators: %s user email */
		$notice_text = sprintf( esc_html__( 'Verification e-mail sent to "%s". Please check your inbox!', 'woocommerce' ), $notification->get_user_email() );
		wc_add_notice( $notice_text, 'success' );

		wp_safe_redirect( $url );
		exit;
	}

	/**
	 * Process canceling a pending verification request.
	 *
	 * @since 1.2.0
	 *
	 * @return void
	 */
	public function process_cancel_pending_verification() {
		if ( empty( $_GET['wc_bis_cancel_pending_notification'] ) ) {
			return;
		}

		$url = remove_query_arg( array( 'wc_bis_cancel_pending_notification', '_wpnonce' ) );

		// We need session for notices to work.
		if ( ! WC()->session->has_session() ) {
			// Generate a random customer ID.
			WC()->session->set_customer_session_cookie( true );
		}

		if ( ! is_numeric( $_GET['wc_bis_cancel_pending_notification'] ) || ! isset( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( wc_clean( $_REQUEST['_wpnonce'] ), 'cancel_pending_verification_nonce' ) ) {
			wc_add_notice( __( 'We were unable to process your request. Please try again later, or get in touch with us for assistance.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		$notification = wc_bis_get_notification( absint( $_GET['wc_bis_cancel_pending_notification'] ) );
		if ( ! is_a( $notification, 'WC_BIS_Notification_Data' ) || ! $notification->is_pending() ) {
			wc_add_notice( esc_html__( 'Invalid link.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		if ( ! is_user_logged_in() || $notification->get_user_id() !== get_current_user_id() ) {
			wc_add_notice( __( 'We were unable to authorize your request. Please try again later, or get in touch with us for assistance.', 'woocommerce' ), 'error' );
			wp_safe_redirect( $url );
			exit;
		}

		$notification->invalidate_verification_data();
		$notification->save();
		$notification->add_event( 'verification_cancelled', wp_get_current_user() );

		/* translators: %s user email */
		$notice_text = esc_html__( 'Pending notification cancelled.', 'woocommerce' );
		wc_add_notice( $notice_text, 'success' );

		wp_safe_redirect( $url );
		exit;
	}

	/*
	---------------------------------------------------*/
	/*
		Account Page.                                    */
	/*---------------------------------------------------*/

	/**
	 * Add navigation item.
	 *
	 * @param  array $items
	 * @return array
	 */
	public function add_navigation_item( $items ) {

		// If the Back In Stock endpoint setting is empty, don't display it; in line with core WC behaviour.
		if ( empty( $this->query_vars['backinstock'] ) ) {
			return $items;
		}

		$after_menu_position = 3;
		$bis_menu_item       = array( 'backinstock' => __( 'Stock Notifications', 'woocommerce' ) );
		$items               = array_slice( $items, 0, $after_menu_position, true ) + $bis_menu_item + array_slice( $items, $after_menu_position, count( $items ) - $after_menu_position, true );

		return $items;
	}

	/**
	 * Add endpoint.
	 *
	 * @param  array $settings
	 * @return array
	 */
	public function add_endpoint_setting( $settings ) {

		// Find where is the id "account_endpoint_options" with type "sectionend".
		$counted_index = 0; // Settings array is not entirely zero-based.
		foreach ( $settings as $index => $setting ) {
			if ( isset( $setting['type'], $setting['id'] ) && 'sectionend' === $setting['type'] && 'account_endpoint_options' === $setting['id'] ) {
				$end_index = $index;
				break;
			}

			// Increase counted index.
			++$counted_index;
		}

		if ( isset( $end_index ) ) {

			$setting = array(
				'title'    => __( 'Stock notifications', 'woocommerce' ),
				'desc'     => __( 'Endpoint for the "My account &rarr; Stock Notifications" page.', 'woocommerce' ),
				'id'       => 'woocommerce_myaccount_backinstock_endpoint',
				'type'     => 'text',
				'default'  => 'backinstock',
				'desc_tip' => true,
			);

			$settings = array_slice( $settings, 0, $counted_index, true ) + array( 'backinstock' => $setting ) + array_slice( $settings, $counted_index, count( $settings ) - $counted_index, true );
		}

		return $settings;
	}

	/**
	 * Get the endpoint page url.
	 *
	 * @return string
	 */
	public function get_endpoint_url() {
		return wc_get_endpoint_url( 'backinstock', null, wc_get_page_permalink( 'myaccount' ) );
	}

	/**
	 * Get the endpoint page title.
	 *
	 * @param  string $title
	 * @param  string $endpoint
	 * @return string
	 */
	public function get_endpoint_title( $title, $endpoint ) {

		if ( 'backinstock' === $endpoint ) {
			$title = __( 'Stock Notifications', 'woocommerce' );
		}

		return $title;
	}

	/**
	 * Add endpoint slug as query var.
	 *
	 * @param  array $query_vars
	 * @return array
	 */
	public function add_query_var( $query_vars ) {
		$query_vars['backinstock'] = $this->query_vars['backinstock'];
		return $query_vars;
	}

	/*
	---------------------------------------------------*/
	/*
		User data functions.                             */
	/*---------------------------------------------------*/

	/**
	 * Process data when re-activate.
	 *
	 * @param  string $email
	 * @return void
	 */
	public function create_customer( $email ) {

		if ( ! wc_bis_is_email( $email ) ) {
			return false;
		}

		// Generate username and password.
		$username = wc_create_new_customer_username( $email );
		$username = sanitize_user( $username );

		$password = 'yes' === get_option( 'woocommerce_registration_generate_password' ) ? '' : wp_generate_password();
		$user_id  = wc_create_new_customer( $email, $username, $password );
		if ( is_a( $user_id, 'WP_Error' ) ) {
			return false;
		}

		return $user_id;
	}

	/**
	 * Migrating existing notifications when user is added.
	 *
	 * @param  int $user_id
	 * @return void
	 */
	public function migrate_new_user_data( $user_id ) {

		$user = get_user_by( 'id', $user_id );
		if ( is_a( $user, 'WP_User' ) ) {

			// Sanity check.
			if ( empty( $user->user_email ) || empty( $user->ID ) || ! wc_bis_is_email( $user->user_email ) ) {
				return;
			}

			// Migrate notifications subscribed by guests with the same email.
			$query_args = array(
				'return'     => 'objects',
				'user_email' => $user->user_email,
				'user_id'    => 0,
			);

			$notifications = wc_bis_get_notifications( $query_args );
			if ( empty( $notifications ) ) {
				return;
			}

			foreach ( $notifications as $notification ) {
				$notification->set_user_id( $user->ID );
				$notification->save();
			}
		}
	}

	/**
	 * Migrating existing notifications when a user changes his email.
	 *
	 * @param  int   $user_id
	 * @param  array $old_user
	 * @return void
	 */
	public function migrate_updated_user_data( $user_id, $old_user ) {

		$user = get_user_by( 'id', $user_id );
		if ( is_a( $user, 'WP_User' ) && is_a( $old_user, 'WP_User' ) ) {

			// Sanity check.
			if ( empty( $user->user_email ) || empty( $user->ID ) || ! wc_bis_is_email( $user->user_email ) ) {
				return;
			}

			// If the email is changed migrate.
			if ( $user->user_email !== $old_user->user_email ) {
				$query_args    = array(
					'return'  => 'objects',
					'user_id' => $user->ID,
				);
				$notifications = wc_bis_get_notifications( $query_args );
				if ( empty( $notifications ) ) {
					return;
				}

				foreach ( $notifications as $notification ) {
					$notification->set_user_email( $user->user_email );
					$notification->save();
				}
			}
		}
	}
}
