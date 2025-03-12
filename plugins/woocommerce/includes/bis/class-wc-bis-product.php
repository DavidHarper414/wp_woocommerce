<?php
/**
 * WC_BIS_Product class
 *
 * @package  WooCommerce Back In Stock Notifications
 * @since    1.0.0
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Back In Stock Product Controller.
 *
 * @class    WC_BIS_Product
 * @version  2.0.0
 */
class WC_BIS_Product {

	/**
	 * Init.
	 */
	public function __construct() {
		add_action( 'wp_loaded', array( $this, 'handle_form_submit' ) );
		add_action( 'woocommerce_simple_add_to_cart', array( $this, 'handle_display_form' ), 30 );
		add_action( 'woocommerce_before_variations_form', array( $this, 'handle_display_form' ) );
		add_filter( 'woocommerce_get_stock_html', array( $this, 'handle_display_form_variation' ), 10, 2 );

		// Display a link to inform users that they can register for back in stock notifications.
		add_filter( 'woocommerce_loop_add_to_cart_link', array( $this, 'loop_add_to_cart_link_signup_prompt' ), 1000, 2 );
		add_action( 'template_redirect', array( $this, 'handle_signup_prompt_notice' ) );
	}

	/**
	 * Handles the form submission.
	 *
	 * @return void
	 */
	public function handle_form_submit() {

		if ( isset( $_POST['wc_bis_product_live_form'] ) ) {

			/**
			 * `woocommerce_bis_prevent_sign_up_security` filter.
			 *
			 * Utilizing full page cache could prevent this handler from working properly. The system will cache HTML along with the security nonce. In order to have caching and enable this check you must handle the nonce part in the HTML.
			 *
			 * @since  1.0.6
			 *
			 * @param  bool
			 * @return bool
			 */
			$use_security = ! (bool) apply_filters( 'woocommerce_bis_prevent_sign_up_security', true );
			if ( $use_security && ( ! isset( $_POST['security'] ) || ! wp_verify_nonce( wc_clean( $_POST['security'] ), 'wc-bis-registration-form' ) ) ) {
				wc_add_notice( __( 'Sign-up failed. If this issue persists, please refresh the page and try again.', 'woocommerce' ), 'error' );
				return;
			}

			/*
			 * Parse product data.
			 */
			$is_account_required      = wc_bis_is_account_required();
			$handle_posted_attributes = false;
			$product                  = isset( $_POST['wc_bis_product_id'] ) ? wc_get_product( absint( $_POST['wc_bis_product_id'] ) ) : false;
			if ( ! is_a( $product, 'WC_Product' ) ) {
				wc_add_notice( __( 'Sign-up failed. Invalid product properties.', 'woocommerce' ), 'error' );
				return;
			}

			if ( $this->is_disabled( $product ) ) {
				wc_add_notice( __( 'Sign-up failed. Stock notifications for this product have been disabled.', 'woocommerce' ), 'error' );
				return;
			}

			$args               = array();
			$args['product_id'] = $product->get_id();
			$posted_attributes  = array();

			/*
			 * Parse variation data.
			 */
			if ( isset( $_POST['wc_bis_variation_id'] ) && ! empty( $_POST['wc_bis_variation_id'] ) ) {
				$variation = wc_get_product( absint( $_POST['wc_bis_variation_id'] ) );

				if ( ! is_a( $variation, 'WC_Product' ) ) {
					wc_add_notice( __( 'Sign-up failed. Invalid variation properties.', 'woocommerce' ), 'error' );
					return;
				}

				// Replace with variation.
				$args['product_id'] = $variation->get_id();
				// Mark waiting time now if variation is currently outofstock.
				if ( ! $variation->is_in_stock() ) {
					$args['subscribe_date'] = time();
				}

				// Filter out 'any' variations, which are empty, as they need to be explicitly specified.
				$variation_attributes = $variation->get_variation_attributes();
				$variation_attributes = array_filter( $variation_attributes ); // nosemgrep: audit.php.lang.misc.array-filter-no-callback

				// Gather posted attributes.
				foreach ( $product->get_attributes() as $attribute ) {

					if ( ! is_a( $attribute, 'WC_Product_Attribute' ) || ! $attribute->get_variation() ) {
						continue;
					}

					$attribute_key = 'attribute_' . sanitize_title( $attribute->get_name() );

					if ( isset( $_POST[ $attribute_key ] ) ) {
						$value                               = html_entity_decode( wc_clean( wp_unslash( $_POST[ $attribute_key ] ) ), ENT_QUOTES, get_bloginfo( 'charset' ) );
						$posted_attributes[ $attribute_key ] = $value;
					}
				}

				// Merge variation attributes and posted attributes.
				if ( ! empty( array_diff( $posted_attributes, $variation_attributes ) ) ) {
					// Has `any` attribute on variation. Save $posted_attributes to a `posted_attributes` meta key.
					$handle_posted_attributes = true;
				}
			} else {

				// Mark waiting time now if product is currently outofstock.
				if ( ! $product->is_in_stock() ) {
					$args['subscribe_date'] = time();
				}
			}

			try {

				/*
				 * If registration is required redirect to myaccount.
				 */
				if ( $is_account_required && ! is_user_logged_in() ) {

					/**
					 * `woocommerce_bis_sign_up_resume_args` filter.
					 *
					 * @since 1.2.0
					 * @param  array $args
					 * @return array
					 */
					$http_query_args = http_build_query(
						(array) apply_filters(
							'woocommerce_bis_sign_up_resume_args',
							array(
								'wc_bis_registration'      => true,
								'args'                     => $args,
								'handle_posted_attributes' => $handle_posted_attributes,
								'posted_attributes'        => $posted_attributes,
							)
						)
					);

					$url = sprintf( '%s%s%s', wc_get_account_endpoint_url( 'backinstock' ), '?', $http_query_args );
					wp_safe_redirect( $url );
					exit;
				}

				/*
				 * Parse user.
				 */
				if ( is_user_logged_in() ) {

					$user               = wp_get_current_user();
					$args['user_id']    = $user->ID;
					$args['user_email'] = $user->user_email;

				} else {

					// Check for valid email.
					$email_input = isset( $_POST['wc_bis_email'] ) ? wc_clean( $_POST['wc_bis_email'] ) : false;
					if ( ! $email_input || ! wc_bis_is_email( $email_input ) ) {
						throw new Exception( __( 'Invalid e-mail.', 'woocommerce' ) );
					}

					// Check for valid privacy terms.
					$privacy_input = isset( $_POST['wc_bis_opt_in'] ) ? wc_clean( $_POST['wc_bis_opt_in'] ) : false;
					if ( wc_bis_is_opt_in_required() && 'on' !== $privacy_input ) {
						throw new Exception( __( 'To proceed, please consent to the creation of a new account with your e-mail.', 'woocommerce' ) );
					}

					$args['user_email'] = $email_input;

					// Check if user exists with this email.
					$user = get_user_by( 'email', $email_input );
					if ( $user && is_a( $user, 'WP_User' ) ) {

						$args['user_id']    = $user->ID;
						$args['user_email'] = $user->user_email;

					} elseif ( wc_bis_create_account_on_registration() ) {

						$user_id = WC_BIS()->account->create_customer( $email_input );
						$user    = get_user_by( 'id', $user_id );
						if ( $user && is_a( $user, 'WP_User' ) ) {

							$args['user_id']         = $user->ID;
							$args['user_email']      = $user->user_email;
							$args['account_created'] = true;

						}
					}
				}

				/**
				 * Handle sign-up.
				 *
				 * `woocommerce_bis_sign_up_args` filter.
				 *
				 * @since 1.2.0
				 * @param  array  $args
				 * @return array
				 */
				$signup_args  = (array) apply_filters( 'woocommerce_bis_sign_up_args', $args );
				$notification = WC_BIS()->account->signup( $signup_args, $handle_posted_attributes ? $posted_attributes : array() );
				if ( ! $notification ) {
					throw new Exception( __( 'Sign up failed. Please try again.', 'woocommerce' ) );
				}

				$redirect_url = $notification ? $notification->get_product_permalink() : '';

			} catch ( Exception $e ) {
				wc_add_notice( $e->getMessage(), 'error' );
			}

			/**
			 * `woocommerce_bis_prevent_sign_up_redirect` filter.
			 *
			 * @since  1.0.5
			 *
			 * @param  bool
			 * @return bool
			 */
			$prevent_sign_up_redirect = (bool) apply_filters( 'woocommerce_bis_prevent_sign_up_redirect', false );
			if ( ! wc_bis_is_using_html_caching_for_users() && ! $prevent_sign_up_redirect && is_user_logged_in() && ! empty( $redirect_url ) ) {

				/**
				 * `woocommerce_bis_sign_up_redirect_url` filter.
				 *
				 * @since  1.0.9
				 *
				 * @param  string                   $redirect_url
				 * @param  WC_BIS_Notification_Data $notification
				 * @return string
				 */
				$redirect_url = apply_filters( 'woocommerce_bis_sign_up_redirect_url', $redirect_url, $notification );

				wp_safe_redirect( $redirect_url );
				exit;

			} else {
				return;
			}
		}
	}

	/**
	 * Display the form on variations.
	 *
	 * @param  string $html
	 * @param  mixed  $product
	 * @return string
	 */
	public function handle_display_form_variation( $html, $product ) {

		if ( ! $product->is_type( 'variation' ) ) {
			return $html;
		}

		if ( ! $this->is_eligible( $product ) ) {
			return $html;
		}

		ob_start();
		$this->display_form( $product );
		$form = ob_get_clean();

		return $html . $form;
	}

	/**
	 * Handle BIS form.
	 *
	 * @return void
	 */
	public function handle_display_form() {
		global $product;

		if ( ! is_product() ) {
			return;
		}

		$this->display_form( $product );
	}

	/**
	 * Display the form.
	 *
	 * @param  mixed $product
	 * @return void
	 */
	public function display_form( $product ) {

		if ( is_numeric( $product ) ) {
			$product = wc_get_product( $product );
		}

		if ( ! is_a( $product, 'WC_Product' ) ) {
			return;
		}

		if ( ! $this->is_eligible( $product ) ) {
			return;
		}

		// Show already registered?
		$has_already_signed_up = false;
		if ( ! wc_bis_is_using_html_caching_for_users() && is_user_logged_in() ) {

			$has_already_signed_up = true;
			// Check for existing sign-ups for varitions with 'any' attributes.
			if ( $product->is_type( 'variation' ) ) {
				foreach ( $product->get_variation_attributes() as $attribute => $value ) {
					if ( '' === $value ) {
						$has_already_signed_up = false;
						break;
					}
				}
			}

			if ( $has_already_signed_up ) {
				$user   = wp_get_current_user();
				$args   = array(
					'product_id' => $product->get_id(),
					'user_id'    => $user->ID,
				);
				$exists = wc_bis_notification_exists( $args, array(), true );
				if ( empty( $exists ) ) {
					$has_already_signed_up = false;
				}
			}
		}

		if ( $has_already_signed_up ) {

			$link_attributes          = array();
			$link_attributes['href']  = wc_get_account_endpoint_url( 'backinstock' );
			$link_attributes['class'] = 'wc_bis_signup_form_subscribed_link';
			$header_signed_up_text    = wc_bis_build_shop_text( 'form_header_signed_up', '{manage_account_link}', $link_attributes );

			wc_get_template(
				'single-product/back-in-stock-registered.php',
				array(
					'product'                          => $product,
					'header_signed_up_text'            => $header_signed_up_text,
					'header_signed_up_link_attributes' => $link_attributes,
					'has_already_signed_up'            => $has_already_signed_up,
				)
			);

			// Exit.
			return;
		}

		// Form texts.
		$header_text  = wc_bis_build_shop_text( 'form_header' );
		$button_text  = wc_bis_build_shop_text( 'form_button' );
		$button_class = implode(
			' ',
			array_filter(
				array(
					'button',
					wc_bis_wp_theme_get_element_class_name( 'button' ),
					'wc_bis_send_form',
				)
			)
		);

		// Opt-in text.
		$opt_in_text = '';
		if ( wc_bis_is_opt_in_required() ) {
			$opt_in_text = wc_bis_build_shop_text( 'form_privacy' );
			$opt_in_text = wc_replace_policy_page_link_placeholders( $opt_in_text );
		}

		// Registration count texts.
		$show_count = (bool) apply_filters( 'woocommerce_bis_show_product_registrations_count', 'yes' === get_option( 'wc_bis_show_product_registrations_count', 'no' ), $product );
		$count_text = '';

		if ( $show_count ) {

			$count = wc_bis_get_notifications_count( $product->get_id(), true );
			if ( $count < (int) apply_filters( 'woocommerce_bis_show_product_registrations_count_threshold', 1, $product ) ) {
				$show_count = false;
			} else {
				$count_text = $count > 1 ? wc_bis_build_shop_text( 'form_signups_count_plural', '{customers_count}', $count ) : wc_bis_build_shop_text( 'form_signups_count' );
			}
		}

		wc_get_template(
			'single-product/back-in-stock-form.php',
			array(
				'product'      => $product,
				'header_text'  => $header_text,
				'button_text'  => $button_text,
				'button_class' => $button_class,
				'show_count'   => $show_count,
				'count_text'   => $count_text,
				'opt_in_text'  => $opt_in_text,
			)
		);
	}

	/**
	 * Whether a product is eligible for stock notification sign-ups.
	 *
	 * @since  1.2.0
	 *
	 * @param  mixed  $product
	 * @param  string $context singe or catalog.
	 * @return void
	 */
	public function is_eligible( $product, $context = 'single' ) {

		$is_eligible = false;

		if ( is_numeric( $product ) ) {
			$product = wc_get_product( $product );
		}

		if ( ! is_a( $product, 'WC_Product' ) ) {
			return false;
		}

		if ( ! $product->is_type( wc_bis_get_supported_types() ) ) {
			return false;
		}

		if ( ! $product->is_in_stock() ) {
			$is_eligible = true;
		}

		if ( 'single' === $context ) {
			if ( $is_eligible && $product->is_type( 'variable' ) && 'no' === get_option( 'woocommerce_hide_out_of_stock_items' ) ) {
				$is_eligible = false;
			}
		} elseif ( 'catalog' === $context ) {
			if ( $is_eligible && $product->is_type( 'variable' ) && $product->child_is_in_stock() ) {
				$is_eligible = false;
			}
		}

		if ( $is_eligible && $this->is_disabled( $product ) ) {
			$is_eligible = false;
		}

		/**
		 * Filter: woocommerce_bis_is_available_for_product
		 *
		 * @param  bool        $is_eligible
		 * @param  WC_Product  $product
		 * @param  string      $context
		 * @return bool
		 */
		return apply_filters( 'woocommerce_bis_is_available_for_product', $is_eligible, $product, $context );
	}

	/**
	 * Check if notification sign-ups are disabled for this product.
	 *
	 * @since  1.2.0
	 *
	 * @param  WC_Product $product
	 * @return bool
	 */
	public function is_disabled( $product ) {

		$allow_signups = get_option( 'wc_bis_allow_signups', 'yes' );

		if ( 'yes' === $product->get_meta( '_wc_bis_disabled', true ) || 'no' === $allow_signups ) {
			return true;
		}

		if ( $product->is_type( 'variation' ) ) {

			$parent_product = WC_BIS_Helpers::cache_get( 'variable_product_' . $product->get_parent_id() );
			if ( null === $parent_product ) {
				$parent_product = wc_get_product( $product->get_parent_id() );
				WC_BIS_Helpers::cache_set( 'variable_product_' . $product->get_parent_id(), $parent_product );
			}

			if ( is_a( $parent_product, 'WC_Product' ) && ( 'yes' === $parent_product->get_meta( '_wc_bis_disabled', true ) || 'no' === $allow_signups ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * If product is available for back in stock notifications, display a link during the loop to inform users they can sign-up to BIS.
	 *
	 * @since  1.2.0
	 *
	 * @param  string     $link
	 * @param  WC_Product $product
	 * @return string
	 */
	public function loop_add_to_cart_link_signup_prompt( $link, $product ) {
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return $link;
		}

		if ( ! wc_bis_is_loop_signup_prompt_enabled() ) {
			return $link;
		}

		if ( ! $this->is_eligible( $product, 'catalog' ) ) {
			return $link;
		}

		ob_start();
		$this->display_signup_prompt( $product );
		$signup_prompt = ob_get_clean();

		return $signup_prompt;
	}

	/**
	 * Returns the actual HTML markup to display the signup prompt.
	 *
	 * @since  1.2.0
	 *
	 * @param  mixed $product
	 * @return void
	 */
	public function display_signup_prompt( $product ) {

		if ( is_numeric( $product ) ) {
			$product = wc_get_product( $product );
		}

		if ( ! is_a( $product, 'WC_Product' ) ) {
			return;
		}

		if ( ! wc_bis_is_loop_signup_prompt_enabled() ) {
			return;
		}

		if ( ! $this->is_eligible( $product, 'catalog' ) ) {
			return;
		}

		$has_already_signed_up = false;

		if ( ! wc_bis_is_using_html_caching_for_users() && is_user_logged_in() ) {
			// Set it initially to true, to be more performant.
			$has_already_signed_up = true;

			$user        = wp_get_current_user();
			$product_ids = array( $product->get_id() );

			if ( $product->is_type( 'variable' ) ) {
				$product_ids = array_merge( $product_ids, $product->get_children() );
			}

			$args   = array(
				'product_id' => $product_ids,
				'user_id'    => $user->ID,
				'is_active'  => 'on',
				'count'      => true,
			);
			$exists = wc_bis_get_notifications( $args );
			if ( false === $exists ) {
				$has_already_signed_up = false;
			}
		}

		if ( ! $has_already_signed_up ) {

			// Hint: If the template is called with AJAX (ie Product Recommendations) the scripts should be enqueued manually on every page.
			if ( (bool) apply_filters( 'woocommerce_bis_should_enqueue_scripts', true ) ) {
				WC_BIS()->templates->enqueue_scripts();
			}

			$link_attributes = array();

			/**
			 * `woocommerce_bis_loop_enable_one_step_signup` filter.
			 *
			 * If the user hasn't singed up, the product is simple, and we don't have required opt in
			 * Then sign-up the user directly to that product.
			 *
			 * @since 1.2.0
			 *
			 * @param  bool
			 * @param  WC_Product  $product
			 * @return bool
			 */
			if ( ! wc_bis_is_opt_in_required() && (bool) apply_filters( 'woocommerce_bis_loop_enable_one_step_signup', false, $product ) ) {
				$link_attributes['data-bis-loop-product-id'] = $product->get_id();
			} else {
				$link_attributes['data-bis-loop-redirect-to'] = $product->get_permalink();
			}

			$link_attributes['href']  = '#';
			$link_attributes['class'] = 'js_wc_bis_loop_signup_prompt_trigger_redirect';
			$signup_prompt_html       = wc_bis_build_shop_text( 'loop_signup_prompt', '{prompt_link}', $link_attributes );

			wc_get_template(
				'loop/back-in-stock-signup-prompt.php',
				array(
					'product'                       => $product,
					'signup_prompt_html'            => $signup_prompt_html,
					'signup_prompt_link_attributes' => $link_attributes,
					'has_already_signed_up'         => $has_already_signed_up,
				)
			);

		} else {

			$link_attributes          = array();
			$link_attributes['href']  = wc_get_account_endpoint_url( 'backinstock' );
			$link_attributes['class'] = 'wc_bis_loop_signup_prompt_signed_up_link';
			$signup_prompt_html       = wc_bis_build_shop_text( 'loop_signup_prompt_signed_up', '{prompt_link}', $link_attributes );

			wc_get_template(
				'loop/back-in-stock-signup-prompt-registered.php',
				array(
					'product'                       => $product,
					'signup_prompt_html'            => $signup_prompt_html,
					'signup_prompt_link_attributes' => $link_attributes,
					'has_already_signed_up'         => $has_already_signed_up,
				)
			);
		}
	}

	/**
	 * Display a notice after clicking on the loop link, informing users that they can signup for bis notifications.
	 *
	 * @since  1.2.0
	 *
	 * @return void
	 */
	public function handle_signup_prompt_notice() {

		/**
		 * Hint: This security check is a noop. Exists only for tricking the PHPCS checking.
		 */

		// Discussed and decided that we'll ignore this semgrep rule, similarly to add_to_cart_action.
		$use_security = false;
		// nosemgrep: scanner.php.wp.security.csrf.nonce-flawed-logic
		if ( $use_security && isset( $_POST['security'] ) && ! wp_verify_nonce( wc_clean( $_POST['security'] ), 'wc-bis-sign-up-prompt-notice' ) ) {
			wc_add_notice( __( 'Session expired. Please reload the page and try again.', 'woocommerce' ), 'error' );
			return;
		}

		if ( ! isset( $_POST['wc_bis_loop_signup_prompt_posted'] ) ) {
			return;
		}

		// We need session for notices to work.
		if ( ! WC()->session->has_session() ) {
			// Generate a random customer ID.
			WC()->session->set_customer_session_cookie( true );
		}

		global $post;
		$product = wc_get_product( $post->ID );

		if ( ! is_a( $product, 'WC_Product' ) ) {
			return;
		}

		$button_text = get_option( 'wc_bis_form_button_text' );
		$button_text = $button_text ? $button_text : wc_bis_get_form_button_default_text();

		if ( is_user_logged_in() ) {

			if ( $product->has_options() ) {
				$notice = sprintf(
				/* translators: 1: Sign-up form button text  */
					esc_html__( 'To join the waitlist, please choose product options and click the "%1$s" button.', 'woocommerce' ),
					$button_text
				);
			} else {
				$notice = sprintf(
				/* translators: 1: Sign-up form button text  */
					esc_html__( 'To join the waitlist, please click the "%1$s" button.', 'woocommerce' ),
					$button_text
				);
			}
		} elseif ( $product->has_options() ) {

				$notice = sprintf(
				/* translators: 1: Sign-up form button text  */
					esc_html__( 'To join the waitlist, please: (1) Choose product options. (2) Enter your e-mail. (3) Click the "%1$s" button.', 'woocommerce' ),
					$button_text
				);
		} else {
			$notice = sprintf(
			/* translators: 1: Sign-up form button text  */
				esc_html__( 'To join the waitlist, please enter your e-mail and click the "%1$s" button.', 'woocommerce' ),
				$button_text
			);
		}

		wc_add_notice( $notice, 'notice' );
	}
}
