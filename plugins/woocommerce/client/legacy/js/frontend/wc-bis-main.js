/* global wc_bis_params */
;( function( $ ) {

	$( function() {
		// Init.
		$( 'body' ).wc_bis_form();
		$( 'body' ).wc_bis_loop_signup_prompt();
	} );

	/**
	 * BIS form controller.
	 */
	var BIS_Form = function() {

		this.$body              = $( 'body' );
		this.$variations_form   = this.$body.find( 'form.variations_form' );
		this.has_errors         = false;

		// Methods.
		this.handle_form        = this.handle_form.bind( this );

		// Events.
		this.$body.on( 'click', '#wc_bis_send_form', this.handle_form );
	};

	BIS_Form.prototype.parse_product_id = function( $container ) {
		var product_id = false;

		if ( $container.length ) {
			product_id = parseInt( $container.data( 'bis-product-id' ), 10 );
		}

		if ( ! product_id || 0 === product_id ) {
			window.console.error( 'BIS Error: Could not parse product id.' );
			this.has_errors = true;
		}

		return product_id;
	};

	BIS_Form.prototype.parse_variation_id = function() {
		var variation_id = false;

		if ( this.$variations_form.length ) {
			var $variation_add_to_cart_form = this.$variations_form.find( '.woocommerce-variation-add-to-cart' ).first();
			variation_id = parseInt( $variation_add_to_cart_form.find( 'input[name="variation_id"]' ).val(), 10 );

			if ( 0 === variation_id ) {
				window.console.error( 'BIS Error: Could not parse variation id.' );
				this.has_errors = true;
			}
		}

		return variation_id;
	};

	BIS_Form.prototype.parse_variation_attributes = function() {
		var attributes = [];

		if ( this.$variations_form.length ) {
			var $attribute_fields = this.$variations_form.find( '.variations select' );
			$attribute_fields.each( function( index, el ) {
				var $attribute_field = $( this );
				attributes.push( $attribute_field );
			} );
		}

		return attributes;
	};

	BIS_Form.prototype.add_hidden_input = function( name, value, $form ) {
		var $hidden_input = $( '<input/>' );
		$hidden_input.val( value );
		$hidden_input.prop( 'name', name );
		$form.append( $hidden_input );
	};

	BIS_Form.prototype.handle_form = function( event ) {
		event.preventDefault();
		this.has_errors = false;

		// Remove the old form if exists.
		var $old_form = this.$body.find( '> #wc_bis_product_live_form' );
		if ( $old_form.length ) {
			$old_form.remove();
		}

		// Get the container.
		var $this   = $( event.target ),
			$parent = $this.closest( '#wc_bis_product_form' );

		// Check if email is empty.
		var $email_input = $parent.find( '#wc_bis_email' );
		if ( $email_input.length && '' === $email_input.val() ) {
			this.has_errors = true;
		}

		// Create form in body.
		var $form   = $( '<form/>' ),
			$inputs = $parent.find( ':input' );

		// Set form props.
		$form.prop( 'method', 'post' );
		$form.prop( 'id', 'wc_bis_product_live_form' );
		$form.append( $inputs.clone() );

		// Add special inputs.
		this.add_hidden_input( 'wc_bis_product_live_form', true, $form );
		this.add_hidden_input( 'security', wc_bis_params.registration_form_nonce, $form );

		// Parse data.
		var product_id = this.parse_product_id( $parent );
		// Add product ID to the form.
		this.add_hidden_input( 'wc_bis_product_id', product_id, $form );

		// Handle variations.
		var variation_id = this.parse_variation_id();
		if ( variation_id ) {

			// Add variation ID to the form.
			this.add_hidden_input( 'wc_bis_variation_id', variation_id, $form );

			// Add attributes to the form.
			var attribute_fields = this.parse_variation_attributes();
			for ( var i = attribute_fields.length - 1; i >= 0; i-- ) {
				this.add_hidden_input( attribute_fields[i].prop( 'name' ), attribute_fields[i].val(), $form );
			}
		}

		// Attach and send.
		if ( ! this.has_errors ) {
			$form.hide();
			this.$body.append( $form );
			$form.submit();
		}
	};

	/**
	 * Function to call wc_bis_form on jquery selector.
	 */
	$.fn.wc_bis_form = function() {
		new BIS_Form();
		return this;
	};

	/**
	 * BIS Loop Sign-up Prompt controller.
	 */
	var BIS_Loop_Signup_Prompt = function() {
		this.$body = $( 'body' );

		// Methods.
		this.handle_redirect = this.handle_redirect.bind( this );

		// Events.
		this.$body.on( 'click', '.js_wc_bis_loop_signup_prompt_trigger_redirect', this.handle_redirect );
	};

	BIS_Loop_Signup_Prompt.prototype.handle_redirect = function( event ) {
		event.preventDefault();
		this.has_errors = false;

		// Remove the old form if exists.
		var $old_form = this.$body.find( '> #wc_bis_loop_signup_live_form' );
		if ( $old_form.length ) {
			$old_form.remove();
		}

		// Get the link clicked.
		var $this = $( event.target );

		// Create form in body.
		var $form = $( '<form/>' );

		// Set form props.
		$form.prop( 'method', 'post' );
		$form.prop( 'id', 'wc_bis_loop_signup_live_form' );
		$form.prop( 'action', '' );
		this.add_hidden_input( 'wc_bis_loop_signup_form', true, $form ); // Will be used for further filtering if needed.

		// Parse product ID if needed.
		var product_id  = this.parse_product_id( $this );
		var redirect_to = this.parse_redirect_url( $this );

		if ( product_id ) {

			// Remove the old form if exists.
			$old_form = this.$body.find( '> #wc_bis_product_live_form' );
			if ( $old_form.length ) {
				$old_form.remove();
			}

			// Replicate a product sign-up form.
			this.add_hidden_input( 'wc_bis_product_id', product_id, $form );
			// Add special inputs.
			this.add_hidden_input( 'wc_bis_product_live_form', true, $form );
			this.add_hidden_input( 'security', wc_bis_params.registration_form_nonce, $form );

		} else if ( redirect_to.length ) {

			$form.prop( 'action', redirect_to );
			this.add_hidden_input( 'wc_bis_loop_signup_prompt_posted', true, $form );
		}

		// Attach and send.
		if ( ! this.has_errors ) {
			$form.hide();
			this.$body.append( $form );
			$form.submit();
		}
	};

	BIS_Loop_Signup_Prompt.prototype.parse_product_id = function( $container ) {
		var product_id = false;

		if ( 'undefined' === typeof $container.data( 'bis-loop-product-id' ) ) {
			return false;
		}

		if ( $container.length ) {
			product_id = parseInt( $container.data( 'bis-loop-product-id' ), 10 );
		}

		if ( ! product_id || 0 === product_id ) {
			window.console.error( 'BIS Error: Could not parse product id.' );
			this.has_errors = true;
		}

		return product_id;
	};

	BIS_Loop_Signup_Prompt.prototype.parse_redirect_url = function( $container ) {
		var redirect_to = false;

		if ( 'undefined' === typeof $container.data( 'bis-loop-redirect-to' ) ) {
			return false;
		}

		if ( $container.length ) {
			redirect_to = $container.data( 'bis-loop-redirect-to' );
		}

		if ( ! redirect_to || ! redirect_to.length ) {
			window.console.error( 'BIS Error: Could not parse redirect url.' );
			this.has_errors = true;
		}

		return redirect_to;
	};

	BIS_Loop_Signup_Prompt.prototype.add_hidden_input = function( name, value, $form ) {
		var $hidden_input = $( '<input/>' );
		$hidden_input.val( value );
		$hidden_input.prop( 'name', name );
		$form.append( $hidden_input );
	};

	/**
	 * Function to call wc_bis_loop_signup_prompt on jquery selector.
	 */
	$.fn.wc_bis_loop_signup_prompt = function() {
		new BIS_Loop_Signup_Prompt();
		return this;
	};

} )( jQuery );
