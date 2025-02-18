<?php
/**
 * WC_BIS_Admin_Notices class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin notices handling.
 *
 * @class    WC_BIS_Admin_Notices
 * @version  1.7.2
 */
class WC_BIS_Admin_Notices {

	/**
	 * Notices presisting on the next request.
	 *
	 * @var array
	 */
	public static $meta_box_notices = array();

	/**
	 * Notices displayed on the current request.
	 *
	 * @var array
	 */
	public static $admin_notices = array();

	/**
	 * Maintenance notices displayed on every request until cleared.
	 *
	 * @var array
	 */
	public static $maintenance_notices = array();

	/**
	 * Dismissible notices displayed on the current request.
	 *
	 * @var array
	 */
	public static $dismissed_notices = array();

	/**
	 * Array of maintenance notice types - name => callback.
	 *
	 * @var array
	 */
	private static $maintenance_notice_types = array(
		'welcome'  => 'welcome_notice',
	);

	/**
	 * Constructor.
	 */
	public static function init() {

		if ( ! class_exists( 'WC_BIS_Notices' ) ) {
			require_once WC_ABSPATH . 'includes/admin/class-wc-bis-notices.php';
		}

		// Avoid duplicates for some notice types that are meant to be unique.
		if ( ! isset( $GLOBALS['sw_store']['notices_unique'] ) ) {
			$GLOBALS['sw_store']['notices_unique'] = array();
		}

		self::$maintenance_notices = is_array( get_option( 'wc_bis_maintenance_notices' ) ) ? get_option( 'wc_bis_maintenance_notices' ) : array();
		self::$dismissed_notices   = get_user_meta( get_current_user_id(), 'wc_bis_dismissed_notices', true );
		self::$dismissed_notices   = is_array( self::$dismissed_notices ) ? self::$dismissed_notices : array();

		// Show meta box notices.
		add_action( 'admin_notices', array( __CLASS__, 'output_notices' ) );
		// Save meta box notices.
		add_action( 'shutdown', array( __CLASS__, 'save_notices' ), 1000 );

		if ( function_exists( 'WC' ) ) {
			// Show maintenance notices.
			add_action( 'admin_print_styles', array( __CLASS__, 'hook_maintenance_notices' ) );
		}
	}

	/**
	 * Add a notice/error.
	 *
	 * @since 1.7.0 Added the args.actions parameter.
	 *
	 * @param  string  $text
	 * @param  mixed   $args
	 * @param  boolean $save_notice
	 */
	public static function add_notice( $text, $args, $save_notice = false ) {

		if ( is_array( $args ) ) {
			$type           = $args['type'];
			$dismiss_class  = isset( $args['dismiss_class'] ) ? $args['dismiss_class'] : false;
			$unique_context = isset( $args['unique_context'] ) ? $args['unique_context'] : false;
			$actions        = isset( $args['actions'] ) ? $args['actions'] : array();
		} else {
			$type           = $args;
			$dismiss_class  = false;
			$unique_context = false;
			$actions        = array();
		}

		if ( $unique_context ) {
			if ( self::unique_notice_exists( $unique_context ) ) {
				return;
			} else {
				$GLOBALS['sw_store']['notices_unique'][] = $unique_context;
			}
		}

		$notice = array(
			'type'          => $type,
			'content'       => $text,
			'actions'       => $actions,
			'dismiss_class' => $dismiss_class,
		);

		if ( $save_notice ) {
			self::$meta_box_notices[] = $notice;
		} else {
			self::$admin_notices[] = $notice;
		}
	}

	/**
	 * Checks if a notice that belongs to a the specified uniqueness context already exists.
	 *
	 * @param  string $context
	 * @return bool
	 */
	private static function unique_notice_exists( $context ) {
		return $context && in_array( $context, $GLOBALS['sw_store']['notices_unique'] );
	}

	/**
	 * Get a setting for a notice type.
	 *
	 * @param  string $notice_name
	 * @param  string $key
	 * @param  mixed  $default
	 * @return array
	 */
	public static function get_notice_option( $notice_name, $key, $default = null ) {
		return WC_BIS_Notices::get_notice_option( $notice_name, $key, $default );
	}

	/**
	 * Set a setting for a notice type.
	 *
	 * @param  string $notice_name
	 * @param  string $key
	 * @param  mixed  $value
	 * @return array
	 */
	public static function set_notice_option( $notice_name, $key, $value ) {
		return WC_BIS_Notices::set_notice_option( $notice_name, $key, $value );
	}

	/**
	 * Checks if a maintenance notice is visible.
	 *
	 * @param  string $notice_name
	 * @return boolean
	 */
	public static function is_maintenance_notice_visible( $notice_name ) {
		return in_array( $notice_name, self::$maintenance_notices );
	}

	/**
	 * Checks if a dismissible notice has been dismissed in the past.
	 *
	 * @param  string $notice_name
	 * @return boolean
	 */
	public static function is_dismissible_notice_dismissed( $notice_name ) {
		return in_array( $notice_name, self::$dismissed_notices );
	}

	/**
	 * Save notices to the DB.
	 */
	public static function save_notices() {

		$is_save_variations_ajax = isset( $_REQUEST['action'] ) && 'woocommerce_save_variations' === $_REQUEST['action'];
		$is_dismissing_notice    = isset( $_REQUEST['action'] ) && 'wc_bis_dismiss_notice' === $_REQUEST['action'];

		if ( defined( 'DOING_AJAX' ) && DOING_AJAX && ! $is_save_variations_ajax && ! $is_dismissing_notice ) {
			return;
		}

		if ( ! empty( self::$meta_box_notices ) ) {
			update_option( 'wc_bis_meta_box_notices', self::$meta_box_notices );
		}
		update_option( 'wc_bis_maintenance_notices', self::$maintenance_notices );
	}

	/**
	 * Show any stored error messages.
	 */
	public static function output_notices() {

		$is_load_variations_ajax = isset( $_REQUEST['action'] ) && 'woocommerce_load_variations' === $_REQUEST['action'];
		if ( defined( 'DOING_AJAX' ) && DOING_AJAX && ! $is_load_variations_ajax ) {
			return;
		}

		$saved_notices = get_option( 'wc_bis_meta_box_notices', array() );
		$notices       = array_merge( self::$admin_notices, $saved_notices );

		if ( ! empty( $notices ) ) {

			foreach ( $notices as $notice ) {

				$notice_classes = array( 'wc_bis_notice', 'notice', 'notice-' . esc_attr( $notice['type'] ) );
				$dismiss_attr   = $notice['dismiss_class'] ? ' data-dismiss_class="' . esc_attr( $notice['dismiss_class'] ) . '"' : '';

				if ( $notice['dismiss_class'] ) {
					$notice_classes[] = $notice['dismiss_class'];
					$notice_classes[] = 'is-dismissible';
				}

				$output = '<div class="' . esc_attr( implode( ' ', $notice_classes ) ) . '"' . $dismiss_attr . '>' . wpautop( $notice['content'] ) . '</div>';
				echo wp_kses_post( $output );
			}

			if ( function_exists( 'wc_enqueue_js' ) ) {
				wc_enqueue_js(
					"
					jQuery( function( $ ) {
						jQuery( '.wc_bis_notice .notice-dismiss' ).on( 'click', function() {

							var data = {
								action: 'wc_bis_dismiss_notice',
								notice: jQuery( this ).parent().data( 'dismiss_class' ),
								security: '" . wp_create_nonce( 'wc_bis_dismiss_notice_nonce' ) . "'
							};

							jQuery.post( '" . WC()->ajax_url() . "', data );
						} );
					} );
				"
				);
			}

			// Clear.
			delete_option( 'wc_bis_meta_box_notices' );
		}
	}

	/**
	 * Show maintenance notices.
	 */
	public static function hook_maintenance_notices() {

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		foreach ( self::$maintenance_notice_types as $notice_name => $callback ) {
			if ( self::is_maintenance_notice_visible( $notice_name ) ) {
				call_user_func( array( __CLASS__, $callback ) );
			}
		}
	}

	/**
	 * Add a dimissible notice/error.
	 *
	 * @param  string $text
	 * @param  mixed  $args
	 */
	public static function add_dismissible_notice( $text, $args ) {
		if ( ! isset( $args['dismiss_class'] ) || ! self::is_dismissible_notice_dismissed( $args['dismiss_class'] ) ) {
			self::add_notice( $text, $args );
		}
	}

	/**
	 * Remove a dismissible notice.
	 *
	 * @param  string $notice_name
	 */
	public static function remove_dismissible_notice( $notice_name ) {

		// Remove if not already removed.
		if ( ! self::is_dismissible_notice_dismissed( $notice_name ) ) {
			self::$dismissed_notices = array_merge( self::$dismissed_notices, array( $notice_name ) );
			update_user_meta( get_current_user_id(), 'wc_bis_dismissed_notices', self::$dismissed_notices );
			return true;
		}

		return false;
	}

	/**
	 * Add a maintenance notice to be displayed.
	 *
	 * @param  string $notice_name
	 */
	public static function add_maintenance_notice( $notice_name ) {

		// Add if not already there.
		if ( ! self::is_maintenance_notice_visible( $notice_name ) ) {
			self::$maintenance_notices = array_merge( self::$maintenance_notices, array( $notice_name ) );
			return true;
		}

		return false;
	}

	/**
	 * Remove a maintenance notice.
	 *
	 * @param  string $notice_name
	 */
	public static function remove_maintenance_notice( $notice_name ) {

		// Remove if there.
		if ( self::is_maintenance_notice_visible( $notice_name ) ) {
			self::$maintenance_notices = array_diff( self::$maintenance_notices, array( $notice_name ) );
			return true;
		}

		return false;
	}

	/**
	 * Add 'welcome' notice.
	 */
	public static function welcome_notice() {

		$screen          = get_current_screen();
		$screen_id       = $screen ? $screen->id : '';
		$show_on_screens = array(
			'dashboard',
			'plugins',
		);

		// Onboarding notices should only show on the main dashboard, and on the plugins screen.
		if ( ! in_array( $screen_id, $show_on_screens, true ) ) {
			return;
		}

		ob_start();

		?>
		<p class="sw-welcome-text">
			<?php
				/* translators: onboarding url */
				echo wp_kses_post( sprintf( __( 'Thank you for installing <strong>WooCommerce Back In Stock Notifications</strong>. Please take a minute to <a href="%s">review your settings</a>, and we won\'t bother you again &ndash; ever!', 'woocommerce' ), esc_url( admin_url( 'admin.php?page=wc-settings&tab=bis_settings&dismiss_wc_bis_onboarding=1' ) ) ) );
			?>
		</p>
		<?php

		$notice = ob_get_clean();

		self::add_dismissible_notice(
			$notice,
			array(
				'type'          => 'info',
				'dismiss_class' => 'welcome',
			)
		);
	}

	/**
	 * Dismisses a notice. Dismissible maintenance notices cannot be dismissed forever.
	 *
	 * @param  string $notice
	 */
	public static function dismiss_notice( $notice ) {
		if ( isset( self::$maintenance_notice_types[ $notice ] ) ) {
			return self::remove_maintenance_notice( $notice );
		} else {
			return self::remove_dismissible_notice( $notice );
		}
	}
}

WC_BIS_Admin_Notices::init();
