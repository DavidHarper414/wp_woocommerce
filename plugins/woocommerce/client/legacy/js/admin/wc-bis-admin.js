/* global wc_bis_admin_params, woocommerce_admin_meta_boxes */
;( function( $, window, document ) {

	/**
	 * Document ready.
	 */
	$( function() {

		// Auto-select the menu item after document load.
		var $bis_page = $( '#wpcontent #wpbody .wrap.woocommerce-bis-notifications' );
		if ( $bis_page.length ) {
			var $menu_item = $( '#adminmenu li.toplevel_page_woocommerce .wp-submenu li a[href*="bis_dashboard"]' );
			if ( $menu_item.length ) {
				$menu_item.parent().addClass( 'current' );
			}
		}

		// Delete confirmations.
		$( '.woocommerce-bis-notifications #delete-action' ).on( 'click', function( e ) {
			if ( ! window.confirm( wc_bis_admin_params.i18n_wc_delete_notification_warning ) ) {
				e.preventDefault();
				return false;
			}
		} );

		$( '#bis-notifications-table #doaction' ).on( 'click', function( e ) {

			var value = $( '#bulk-action-selector-top' ).val();

			if ( value === 'delete' && ! window.confirm( wc_bis_admin_params.i18n_wc_bulk_delete_notifications_warning ) ) {
				e.preventDefault();
				return false;
			}
		} );

		$( '#bis-notifications-table #doaction2' ).on( 'click', function( e ) {

			var value = $( '#bulk-action-selector-bottom' ).val();

			if ( value === 'delete' && ! window.confirm( wc_bis_admin_params.i18n_wc_bulk_delete_notifications_warning ) ) {
				e.preventDefault();
				return false;
			}
		} );

		$( '#bis-notifications-table .column-id .row-actions .delete a' ).on( 'click', function( e ) {
			if ( ! window.confirm( wc_bis_admin_params.i18n_wc_delete_notification_warning ) ) {
				e.preventDefault();
				return false;
			}
		} );

		// Setup export modal.
		BIS_Export_Modal.init();

		// Notification CRUD.
		var $notification_create_panel = $( '.notification-data--create' );
		if ( $notification_create_panel.length ) {

			var $search_product_select = $notification_create_panel.find( '.sw-select2-search--products' ),
				$container             = $notification_create_panel.find( '.notification-data__product-data' );

			$search_product_select.on( 'change', function() {

				var product_id = parseInt( $( this ).val(), 10 );
				if ( product_id > 0 ) {

					$container.block( {
						message: null,
						overlayCSS: {
							background: '#fff',
							opacity:    0.6
						}
					} );

					$.ajax( {
						type: 'POST',
						url: wc_bis_admin_params.wc_ajax_url,
						data: {
							action           : 'wc_bis_new_notification_get_product_data_html',
							product_id       : product_id,
							security         : wc_bis_admin_params.new_notification_product_data_nonce
						},
						dataType: 'json',
						success: function( response ) {

							if ( response.result && 'success' === response.result ) {
								$container.html( response.html );
							}
						},
						complete: function() {
							$container.unblock();
						}

					} ).fail( function( response ) {
						window.console.log( response );
					} );
				}
			} );
		}

		// Product data metabox.
		var $product_data = $( 'div#woocommerce-product-data' );
		if ( $product_data.length ) {
			// ...
		}

		// Settings.

		// The order is important here, as wc_bis_account_required is triggered by wc_bis_opt_in_required.
		$( 'input#wc_bis_opt_in_required' ).change( function() {
			var $this = $( this );

			if ( $this.is( ':checked' ) ) {
				$( 'table.form-table .opt_in_required' ).closest( 'tr' ).show();
			} else {
				$( 'table.form-table .opt_in_required' ).closest( 'tr' ).hide();
			}

		} ).trigger( 'change' );

		$( 'input#wc_bis_account_required' ).change( function() {
			var $this = $( this );

			if ( $this.is( ':checked' ) ) {
				$( 'table.form-table .account_required_field' ).closest( 'tr' ).hide();
				// Hide the opt-in required fields.
				$( 'table.form-table .opt_in_required' ).closest( 'tr' ).hide();
			} else {
				$( 'table.form-table .account_required_field' ).closest( 'tr' ).show();

				// Check if opt-in required is checked and if yes, display the row.
				if ( $( 'input#wc_bis_opt_in_required' ).is( ':checked' ) ) {
					$( 'table.form-table .opt_in_required' ).closest( 'tr' ).show();
				}
			}

		} ).trigger( 'change' );

		$( 'input#wc_bis_double_opt_in_required' ).change( function() {
			var $this = $( this );

			if ( $this.is( ':checked' ) ) {
				$( 'table.form-table .double_opt_in_required' ).closest( 'tr' ).show();
			} else {
				$( 'table.form-table .double_opt_in_required' ).closest( 'tr' ).hide();
			}

		} ).trigger( 'change' );

		$( 'input#wc_bis_show_product_registrations_count' ).change( function() {
			var $this = $( this );

			if ( $this.is( ':checked' ) ) {
				$( 'table.form-table .product_registrations_text' ).closest( 'tr' ).show();
			} else {
				$( 'table.form-table .product_registrations_text' ).closest( 'tr' ).hide();
			}

		} ).trigger( 'change' );

		$( 'input#wc_bis_loop_signup_prompt_status' ).change( function() {
			var $this = $( this );

			if ( $this.is( ':checked' ) ) {
				$( 'table.form-table .loop_signup_prompt_text' ).closest( 'tr' ).show();
			} else {
				$( 'table.form-table .loop_signup_prompt_text' ).closest( 'tr' ).hide();
			}

		} ).trigger( 'change' );

	} );

	/**
	 * Handles the Notifications export process.
	 */
	var Notifications_Export_Form = function( $form ) {

		// Props.
		this.$form        = $form;
		this.is_exporting = false;
		this.canceled     = false;

		// Methods.
		this.processStep  = this.processStep.bind( this );
		this.onSubmit     = this.onSubmit.bind( this );

		// Initial state.
		this.$form.find('.woocommerce-exporter-progress').val( 0 );

		// Events.
		$form.on( 'click', '.woocommerce-exporter-button', this.onSubmit );
	};

	/**
	 * Handle export button submission.
	 */
	Notifications_Export_Form.prototype.onSubmit = function( event ) {
		event.preventDefault();

		var currentDate    = new Date(),
			day            = currentDate.getDate(),
			month          = currentDate.getMonth() + 1,
			year           = currentDate.getFullYear(),
			timestamp      = currentDate.getTime(),
			filename       = 'wc-bis-notifications-export-' + day + '-' + month + '-' + year + '-' + timestamp + '.csv';

		this.$form.addClass( 'woocommerce-exporter__exporting' );
		this.$form.find('.woocommerce-exporter-button').prop( 'disabled', true );
		this.$form.find('.woocommerce-exporter-progress').val( 0 );
		this.processStep( 1, [], '', filename );
	};


	Notifications_Export_Form.prototype.cancel = function( step, data, columns, filename ) {
		this.is_exporting = false;
		this.canceled     = true;
	};

	/**
	 * Process the current export step.
	 */
	Notifications_Export_Form.prototype.processStep = function( step, data, columns, filename ) {

		var filters,
			export_meta    = $( '#woocommerce-exporter-meta:checked' ).length ? 1: 0,
			export_filters = $( '#woocommerce-exporter-filtered:checked' ).length ? 1: 0;

		if ( export_filters ) {
			filters = get_table_filters();
		}

		$.ajax( {
			type: 'POST',
			url: wc_bis_admin_params.wc_ajax_url,
			data: {
				form             : data,
				action           : 'woocommerce_bis_do_ajax_notifications_export',
				step             : step,
				export_meta      : export_meta,
				export_filters   : export_filters,
				date_filter      : export_filters && filters ? filters.date : false,
				customer_filter  : export_filters && filters ? filters.customer : false,
				product_filter   : export_filters && filters ? filters.product : false,
				status_filter    : export_filters && filters ? filters.status : false,
				filename         : filename,
				security         : wc_bis_admin_params.export_notifications_nonce
			},
			dataType: 'json',
			success: function( response ) {

				if ( response.success ) {

					if ( 'done' === response.data.step ) {
						this.is_exporting = false;
						window.location   = response.data.url;
						this.$form.find('.woocommerce-exporter-progress').val( response.data.percentage );

						setTimeout( function() {
							this.$form.removeClass( 'woocommerce-exporter__exporting' );
							this.$form.find('.woocommerce-exporter-button').prop( 'disabled', false );
							this.$form.find('.woocommerce-exporter-progress').val( 0 );
						}.bind( this ), 2000 );

					} else {

						this.is_exporting = true;
						this.$form.find('.woocommerce-exporter-button').prop( 'disabled', true );
						this.$form.find('.woocommerce-exporter-progress').val( response.data.percentage );

						if ( this.canceled ) {

							this.canceled     = false;
							this.is_exporting = false;

							setTimeout( function() {
								this.$form.removeClass( 'woocommerce-exporter__exporting' );
								this.$form.find('.woocommerce-exporter-progress').val( 0 );
								this.$form.find('.woocommerce-exporter-button').prop( 'disabled', false );
							}.bind( this ), 2000 );

							// Quit.
							return;
						}

						this.processStep( parseInt( response.data.step, 10 ), [], '', filename );
					}
				}

			}.bind( this )

		} ).fail( function( response ) {
			window.console.log( response );
		} );
	};

	/**
	 * Generate export modal.
	 */
	var BIS_Export_Modal = {

		view: false,

		export_form: false,

		init: function() {

			// Hook events.
			$( '.woocommerce-bis-notifications' )
				// Manual redeem.
				.on( 'click', '.woocommerce-bis-exporter-button', this.open.bind( this ) );
		},

		open: function( event ) {
			event.preventDefault();

			var WC_BIS_Backbone_Modal = $.WCBackboneModal.View.extend( {
				closeButton: this.cancel_export.bind( this )
			} );

			this.view = new WC_BIS_Backbone_Modal( {
				target: 'wc-bis-export-notifications',
				string: {
					action: wc_bis_admin_params.i18n_export_modal_title
				}
			} );

			this.populate_form.call( this );

			return false;
		},

		cancel_export: function( event ) {

			if ( false !== this.export_form && ! this.export_form.canceled ) {
				this.export_form.cancel();
			}

			event.preventDefault();
			$( document.body ).trigger( 'wc_backbone_modal_before_remove', this.view._target );
			this.view.undelegateEvents();
			$( document ).off( 'focusin' );
			$( document.body ).css( {
				'overflow': 'auto'
			} );
			this.view.remove();
			$( document.body ).trigger( 'wc_backbone_modal_removed', this.view._target );
		},

		populate_form: function() {

			this.block( this.view.$el.find( '.wc-backbone-modal-content' ) );

			var data = {
				action:    'wc_bis_modal_export_notifications_html',
				dataType:  'json',
				security:  wc_bis_admin_params.modal_export_notifications_nonce
			};

			$.post( wc_bis_admin_params.wc_ajax_url, data, function( response ) {

				if ( response.result && 'success' === response.result ) {

					var $form = this.view.$el.find( 'form' );
					$form.html( response.html );

					var $export_container = $form.find( '.woocommerce-exporter' );
					this.export_form      = new Notifications_Export_Form( $export_container );

				} else {
					window.console.error( response.result );
				}

				this.unblock( this.view.$el.find( '.wc-backbone-modal-content' ) );

			}.bind( this ) );

		},

		block: function( $target, params ) {
			if ( ! $target || $target === 'undefined' ) {
				return;
			}

			var defaults = {
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity:    0.6
				}
			};

			var opts = $.extend( {}, defaults, params || {} );
			$target.block( opts );

		},

		unblock: function( $target ) {
			if ( ! $target || $target === 'undefined' ) {
				return;
			}

			$target.unblock();
		}
	};

	/**
	 * Function to call Notifications_Export_Form on jquery selector.
	 */
	$.fn.wc_bis_notifications_export_form = function() {
		new Notifications_Export_Form( this );
		return this;
	};

	/**
	 * Parse GET params from current URL.
	 */
	function get_query_params( qs ) {
		qs = qs.split( '+' ).join( ' ' );

		var params = {},
			tokens,
			re     = /[?&]?([^=]+)=([^&]*)/g;

		while ( tokens = re.exec( qs ) ) {
			params[ decodeURIComponent( tokens[ 1 ] ) ] = decodeURIComponent( tokens[ 2 ] );
		}

		return params;
	}

	/**
	 * Parse active filters from list table.
	 */
	function get_table_filters() {

		var query_search = document.location.search,
			params       = get_query_params( query_search );

		var filters = {
			'date'    : params.m && 0 != params.m ? parseInt( params.m, 10 ) : false,
			'customer': params.bis_customer_filter ? parseInt( params.bis_customer_filter, 10 ) : false,
			'product' : params.bis_product_filter ? parseInt( params.bis_product_filter, 10 ) : false,
			'search'  : params.s ? params.s : false,
			'status'  : params.status ? params.status : false,
		};

		return filters;
	}

} )( jQuery, window, document );
