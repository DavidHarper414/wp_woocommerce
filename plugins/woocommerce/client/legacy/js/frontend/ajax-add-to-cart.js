/**
 * This is an interim solution for handling AJAX add-to-cart functionality,
 * allowing features like the mini-cart drawer to open when products are added.
 * This will eventually be replaced by the blockified Add to Cart implementation
 * tracked in https://github.com/woocommerce/woocommerce/issues/53014
 *
 * The script:
 * 1. Captures the add-to-cart button click
 * 2. Serializes the product form data
 * 3. Submits the data via AJAX
 * 4. Triggers appropriate events for cart updates
 */
( function ( $ ) {
	function getFormData( $form ) {
		const formData = [];
		const elements = $form.find(
			'input:not([name="product_id"]), select, button, textarea'
		);

		elements.each( function () {
			const $element = $( this );
			const name = $element.attr( 'name' );
			let value = $element.val();

			if ( ! name ) {
				return;
			}

			if ( $element.is( ':checkbox' ) ) {
				value = $element.is( ':checked' ) ? value : '';
			}

			if ( Array.isArray( value ) ) {
				value.forEach( function ( val ) {
					formData.push( {
						name: name,
						value: val.replace( /\r?\n/g, '\r\n' ),
					} );
				} );
			} else {
				formData.push( {
					name: name,
					value: value.replace( /\r?\n/g, '\r\n' ),
				} );
			}
		} );

		return formData;
	}

	$( document ).on(
		'click',
		'.single_add_to_cart_button:not(.disabled)',
		function ( e ) {
			e.preventDefault();

			const $button = $( this );
			const $form = $button.closest( 'form.cart' );
			const formData = getFormData( $form );

			formData.forEach( function ( item ) {
				if ( item.name === 'add-to-cart' ) {
					item.name = 'product_id';
					item.value =
						$form.find( 'input[name=variation_id]' ).val() ||
						$button.val();
				}
			} );

			$( document.body ).trigger( 'adding_to_cart', [
				$button,
				formData,
			] );

			$.ajax( {
				type: 'POST',
				url: woocommerce_params.wc_ajax_url
					.toString()
					.replace( '%%endpoint%%', 'add_to_cart' ),
				data: formData,
				beforeSend: function () {
					$button.removeClass( 'added' ).addClass( 'loading' );
				},
				complete: function () {
					$button.addClass( 'added' ).removeClass( 'loading' );
				},
				success: function ( response ) {
					if ( response.error && response.product_url ) {
						window.location = response.product_url;
						return;
					}

					$( document.body ).trigger( 'added_to_cart', [
						response.fragments,
						response.cart_hash,
						$button,
					] );
				},
			} );

			return false;
		}
	);
} )( jQuery );
