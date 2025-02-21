document.addEventListener( 'click', function ( event ) {
	if ( event.target.classList.contains( 'single_add_to_cart_button' ) ) {
		document.cookie = 'open_mini_cart_drawer=true; path=/';
	}
} );
