/* global wc_bis_admin_params, woocommerce_admin_meta_boxes */
;( function( $, window, document ) {

	$( function( $ ) {

		function showTooltip( x, y, contents ) {
			$( '<div class="chart-tooltip">' + contents + '</div>' ).css( {
				top: y - 16,
				left: x + 20
			}).appendTo( 'body' ).fadeIn( 200 );
		}

		var prev_data_index = null;
		var prev_series_index = null;

		$( '.chart-placeholder' ).bind( 'plothover', function ( event, pos, item ) {

			if ( item ) {
				if ( prev_data_index !== item.dataIndex || prev_series_index !== item.seriesIndex ) {
					prev_data_index   = item.dataIndex;
					prev_series_index = item.seriesIndex;

					$( '.chart-tooltip' ).remove();

					if ( item.series.points.show || item.series.enable_tooltip ) {

						var y = item.series.data[ item.dataIndex ][ 1 ],
						    x = item.series.data[ item.dataIndex ][ 0 ],
							tooltip_content = '',
							current_date;

						// Fix placeholder for displaying zeros.
						if ( 0.1 == y ) {
							y = 0;
						}

						if ( item.series.replace_tooltip ) {
							tooltip_content = item.series.replace_tooltip.replace( '%notifications%', y );
							current_date = new Date( parseInt( x, 10 ) );
							tooltip_content = tooltip_content.replace( '%date%', current_date.getFullYear() + "/" + ( current_date.getMonth() + 1 ) + "/" + current_date.getDate() );
						}

						showTooltip( item.pageX, item.pageY, tooltip_content );
					}
				}
			} else {
				$( '.chart-tooltip' ).remove();
				prev_data_index = null;
			}

		} );

		// Table date range filter.
		var $table_most_subscribed = $( 'table#wc_bis_most_subscribed' );
		if ( $table_most_subscribed.length ) {

			var $tbody      = $table_most_subscribed.find( 'tbody' ),
				$date_range = $table_most_subscribed.find( '.date_range' ),
				$ranges     = $date_range.find( 'a' );

			$date_range.on( 'click', 'a', function( e ) {
				e.preventDefault();

				var $this = $( this );
				if ( $this.hasClass( 'active' ) ) {
					return;
				}

				$ranges.removeClass( 'active' );
				var range = false;
				if ( $this.data( 'range' ) ) {
					$this.addClass( 'active' );
					range = $this.data( 'range' );
					$table_most_subscribed.block({
						message: null,
						overlayCSS: {
							background: '#fff',
							opacity:    0.6
						}
					});
				}

				$.ajax( {
					type: 'POST',
					url: wc_bis_admin_params.wc_ajax_url,
					data: {
						date_range: range,
						action    : 'woocommerce_bis_get_most_subscribed_date_range_results',
						security  : wc_bis_admin_params.dashboard_most_subscribed_date_range
					},
					dataType: 'json',
					success: function( response ) {

						if ( response.result == 'success' ) {

							var row_template = wp.template( 'most_subscribed_row' ),
								i;

							$tbody.html( '' );
							if ( response.products.length ) {
								for ( i = 0; i < response.products.length; i++ ) {

									var product_row = row_template( {
										url: response.products[ i ].url,
										name: response.products[ i ].name,
										total: response.products[ i ].total
									} );

									$tbody.html( $tbody.html() + product_row );
								}
							} else {
								$tbody.html( '<tr><td colspan="2" class="empty">' + wc_bis_admin_params.i18n_dashboard_table_no_results + '</td></tr>' );
							}
						} else {
							console.error( response );
						}
					},
					complete: function() {
						$table_most_subscribed.unblock();
					}
				} );

			} );
		}

	} );

} )( jQuery, window, document );

