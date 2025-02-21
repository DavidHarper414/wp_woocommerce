<?php
/**
 * WC_BIS_Emails class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Emails manager.
 *
 * @class    WC_BIS_Emails
 * @version  x.x.x
 */
class WC_BIS_Emails {

	/**
	 * List of all core subscription email classes.
	 *
	 * @var array
	 */
	public static $email_classes = array(
		'WC_BIS_Email_Notification_Received' => 'emails/class-wc-bis-email-notification-received.php',
		'WC_BIS_Email_Notification_Confirm'  => 'emails/class-wc-bis-email-notification-confirm.php',
		'WC_BIS_Email_Notification_Verify'   => 'emails/class-wc-bis-email-notification-verify.php',
	);

	/**
	 * Constructor.
	 */
	public function __construct() {

		// Setup email hooks & handlers.
		add_filter( 'woocommerce_email_actions', array( $this, 'email_actions' ) );
		add_filter( 'woocommerce_email_classes', array( $this, 'email_classes' ) );

		// Setup styles.
		add_filter( 'woocommerce_email_styles', array( $this, 'add_stylesheets' ), 10, 2 );

		// HTML Parts.
		add_action( 'woocommerce_email_notification_html', array( $this, 'notification_email_html' ), 10, 2 );
		add_action( 'woocommerce_email_confirm_notification_html', array( $this, 'confirm_notification_email_html' ), 10, 2 );
		add_action( 'woocommerce_email_verify_notification_html', array( $this, 'verify_notification_email_html' ), 10, 2 );

		// Restore customer's context into the background queue.
		add_action( 'woocommerce_email_notification_html', array( $this, 'maybe_restore_customer_data' ), 9 );
	}

	/**
	 * Registers custom emails actions.
	 *
	 * @param  array $actions
	 * @return array
	 */
	public function email_actions( $actions ) {

		// WC_BIS_Email_Notification_Received
		$actions[] = 'woocommerce_bis_send_notification_to_customer';
		$actions[] = 'woocommerce_bis_force_send_notification_to_customer';

		// WC_BIS_Email_Notification_Confirm
		$actions[] = 'woocommerce_bis_confirm_notification_to_customer';

		// WC_BIS_Email_Notification_Verify
		$actions[] = 'woocommerce_bis_verify_notification_to_customer';

		return $actions;
	}

	/**
	 * Restore customer data from notification's metadata, if applicable.
	 *
	 * @since 1.3.2
	 *
	 * @param  WC_Notification_Data $notification
	 * @return void
	 */
	public function maybe_restore_customer_data( $notification ) {

		// No need if stores displaying price excluding tax.
		if ( 'incl' !== get_option( 'woocommerce_tax_display_shop' ) ) {
			return;
		}

		// Check if for some reason (e.g., 3PD), a WC_Customer is already assigned into the BG process's context.
		if ( ! empty( WC()->customer ) ) {
			return;
		}

		// Get the recorded customer data, if any.
		$location = $notification->get_meta( '_customer_location_data' );
		if ( empty( $location ) || ! is_array( $location ) || 4 !== count( $location ) ) {
			return;
		}

		// Restore the tax location.
		add_filter(
			'woocommerce_get_tax_location',
			function () use ( $location ) {
				return $location;
			}
		);
	}

	/**
	 * Registers custom emails classes.
	 *
	 * @param  array $emails Array of email classes.
	 * @return array
	 */
	public function email_classes( $emails ) {
		foreach ( self::$email_classes as $email_class => $file_name ) {
			$emails[ $email_class ] = include $file_name;

			if ( is_a( $emails[ $email_class ], 'WC_Email' ) ) {
				$emails[ $email_class ]->setup_hooks();
			}
		}

		return $emails;
	}

	/**
	 * Prints in the email.
	 *
	 * @param  WC_BIS_Notification_Data $notification
	 * @param  WC_Email                 $email
	 * @return void
	 */
	public function notification_email_html( $notification, $email = null ) {
		if ( ! is_a( $email, 'WC_Email' ) ) {
			return;
		}

		$product = $notification->get_product();
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return;
		}

		// Is existing user?
		$user    = get_user_by( 'email', $notification->get_user_email() );
		$is_user = $user && is_a( $user, 'WP_User' );

		// Unsubscribe URL.
		$base_url         = (string) apply_filters( 'woocommerce_bis_email_received_unsubscribe_href', get_permalink( wc_get_page_id( 'shop' ) ), $notification );
		$unsubscribe_href = add_query_arg(
			array(
				'bis_unsub'     => urlencode( base64_encode( $notification->get_hash() ) ),
				'bis_unsub_ref' => 'notification',
				'bis_unsub_id'  => $notification->get_id(),
			),
			$base_url
		);

		// Default template params.
		$template_args = array(
			'notification'       => $notification,
			'product'            => $product,
			'intro_content'      => $email->get_into_content(),
			'additional_content' => $email->get_additional_content(),
			'is_user'            => $is_user,
			'unsubscribe_href'   => $unsubscribe_href,
			'email'              => $email,
		);

		// Render notification part.
		wc_get_template(
			'emails/html-back-in-stock-notification-received.php',
			(array) apply_filters( 'woocommerce_bis_email_received_template_args', $template_args, $notification, $email )
		);
	}

	/**
	 * Prints in the email.
	 *
	 * @param  WC_BIS_Notification_Data $notification
	 * @param  WC_Email                 $email
	 * @return void
	 */
	public function confirm_notification_email_html( $notification, $email = null ) {
		if ( ! is_a( $email, 'WC_Email' ) ) {
			return;
		}

		$product = $notification->get_product();
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return;
		}

		// Is existing user?
		$user    = get_user_by( 'email', $notification->get_user_email() );
		$is_user = $user && is_a( $user, 'WP_User' );

		// Unsubscribe URL.
		$base_url         = (string) apply_filters( 'woocommerce_bis_email_confirm_unsubscribe_href', $notification->get_product_permalink(), $notification );
		$unsubscribe_href = add_query_arg(
			array(
				'bis_unsub'     => urlencode( base64_encode( $notification->get_hash() ) ),
				'bis_unsub_ref' => 'confirmation',
				'bis_unsub_id'  => $notification->get_id(),
			),
			$base_url
		);

		// Default template params.
		$template_args = array(
			'notification'       => $notification,
			'product'            => $product,
			'intro_content'      => $email->get_into_content(),
			'additional_content' => $email->get_additional_content(),
			'is_user'            => $is_user,
			'unsubscribe_href'   => $unsubscribe_href,
			'email'              => $email,
		);

		// Render notification part.
		wc_get_template(
			'emails/html-back-in-stock-notification-confirm.php',
			(array) apply_filters( 'woocommerce_bis_email_confirm_template_args', $template_args, $notification, $email )
		);
	}

	/**
	 * Prints in the email.
	 *
	 * @since 1.2.0
	 *
	 * @param  WC_BIS_Notification_Data $notification
	 * @param  WC_Email                 $email
	 * @return void
	 */
	public function verify_notification_email_html( $notification, $email = null ) {
		if ( ! is_a( $email, 'WC_Email' ) ) {
			return;
		}

		$product = $notification->get_product();
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return;
		}

		// Is existing user?
		$user    = get_user_by( 'email', $notification->get_user_email() );
		$is_user = $user && is_a( $user, 'WP_User' );

		// Verification URL.
		$base_url                          = (string) apply_filters( 'woocommerce_bis_email_verify_button_href', get_permalink( wc_get_page_id( 'shop' ) ), $notification );
		$verification_href                 = add_query_arg(
			array(
				'bis_ver'      => urlencode( base64_encode( $notification->get_verification_hash() ) ),
				'bis_ver_id'   => $notification->get_id(),
				'bis_ver_code' => $notification->get_meta( '_verification_code' ),
			),
			$base_url
		);
		$verification_expiration_threshold = human_time_diff( time(), time() + wc_bis_get_verification_expiration_time_threshold() );

		// Default template params.
		$template_args = array(
			'notification'                      => $notification,
			'product'                           => $product,
			'intro_content'                     => $email->get_into_content(),
			'verification_href'                 => $verification_href,
			'verification_expiration_threshold' => $verification_expiration_threshold,
			'is_user'                           => $is_user,
			'additional_content'                => $email->get_additional_content(),
			'email'                             => $email,
		);

		// Render notification part.
		wc_get_template(
			'emails/html-back-in-stock-notification-verify.php',
			(array) apply_filters( 'woocommerce_bis_email_verify_template_args', $template_args, $notification, $email )
		);
	}

	/**
	 * Prints CSS in the emails.
	 *
	 * @param  string   $css
	 * @param  WC_Email $email (Optional)
	 * @return void
	 */
	public function add_stylesheets( $css, $email = null ) {
		// Hint: $email param is not added until WC 3.6.

		/**
		 * `woocommerce_bis_emails_to_style` filter.
		 *
		 * @since  1.3.0
		 *
		 * @return array
		 */
		if ( ( is_null( $email ) || ! in_array( $email->id, (array) apply_filters( 'woocommerce_bis_emails_to_style', array( 'bis_notification_confirm', 'bis_notification_received', 'bis_notification_verify' ) ) ) ) ) {
			return $css;
		}

		// Background color.
		$bg = get_option( 'woocommerce_email_background_color' );
		// General text.
		$text = get_option( 'woocommerce_email_text_color' );
		// Email body background color.
		$body = get_option( 'woocommerce_email_body_background_color' );
		// Primary color.
		$base      = get_option( 'woocommerce_email_base_color' );
		$base_text = (string) apply_filters( 'woocommerce_bis_email_base_text_color', wc_light_or_dark( $base, '#202020', '#ffffff' ), $email );

		ob_start();
		?>
		#header_wrapper h1 {
			line-height: 1em !important;
		}
		#notification__container {
			color: <?php echo esc_attr( $text ); ?> !important;
			padding: 20px 20px;
			text-align: center;
			font-family: "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
			width: 100%;
		}
		#notification__into_content {
			margin-bottom: 48px;
			color: <?php echo esc_attr( $text ); ?> !important;
		}
		#notification__product__image {
			text-align: center;
			margin-bottom: 20px;
			width: 100%;
		}
		#notification__product__image img {
			margin-right: 0;
			width: 220px;
		}
		#notification__product__title {
			font-size: 16px;
			font-weight: bold;
			line-height: 130%;
			margin-bottom: 5px;
			color: <?php echo esc_attr( $text ); ?> !important;
		}
		#notification__product__attributes table {
			width: 100%;
			padding: 0;
			margin: 0;
			color: <?php echo esc_attr( $text ); ?> !important;
		}
		#notification__product__attributes th,
		#notification__product__attributes td {
			color: <?php echo esc_attr( $text ); ?> !important;
			padding: 4px !important;
			text-align: center;
		}
		#notification__product__price {
			margin-bottom: 20px;
			color: <?php echo esc_attr( $text ); ?> !important;
		}
		#notification__action_button {
			text-decoration: none;
			display: inline-block;
			background: <?php echo esc_attr( $base ); ?>;
			color: <?php echo esc_attr( $base_text ); ?> !important;
			border: 10px solid <?php echo esc_attr( $base ); ?>;
		}
		#notification__verification_expiration {
			font-size: 0.8em;
			margin-top: 20px;
			color: <?php echo esc_attr( $text ); ?>;
		}
		#notification__footer {
			text-align: center;
			margin-top: 20px;
			color: <?php echo esc_attr( $text ); ?>;
		}
		#notification__unsubscribe_link {
			color: <?php echo esc_attr( $text ); ?>;
		}
		#notification__product__price .screen-reader-text {
			display: none;
		}
		<?php
		$css .= ob_get_clean();

		return $css;
	}
}
