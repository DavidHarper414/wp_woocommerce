( function ( $ ) {
	$( document ).on(
		'click',
		'.woo-subscription-expiring-notice,.woo-subscription-expired-notice',
		function () {
			const notice_id = this.id;
			if ( ! notice_id ) {
				return;
			}

			const data = {
				notice_id,
			};

			window.wp.apiFetch( {
				path: `/wc-admin/notice/dismiss`,
				method: 'POST',
				data,
			} );
		}
	);
} )( window.jQuery );
