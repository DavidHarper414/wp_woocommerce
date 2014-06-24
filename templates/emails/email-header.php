<?php
/**
 * Email Header
 *
 * @author 		WooThemes
 * @package 	WooCommerce/Templates/Emails
 * @version     2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// Load colours
$bg              = apply_filters( 'woocommerce_email_background_color', get_option( 'woocommerce_email_background_color' ) );
$body            = apply_filters( 'woocommerce_email_body_background_color', get_option( 'woocommerce_email_body_background_color' ) );
$base            = apply_filters( 'woocommerce_email_base_color', get_option( 'woocommerce_email_base_color' ) );
$base_text       = apply_filters( 'woocommerce_email_base_text_color', wc_light_or_dark( $base, '#202020', '#ffffff' ) );
$text            = apply_filters( 'woocommerce_email_text_color', get_option( 'woocommerce_email_text_color' ) );

$bg_darker_10    = wc_hex_darker( $bg, 10 );
$base_lighter_20 = wc_hex_lighter( $base, 20 );
$text_lighter_20 = wc_hex_lighter( $text, 20 );

// Load border setting
$rounded_corners = apply_filters( 'woocommerce_email_rounded_corners', '6px' );

// Load font settings
$font_size_base  = floatval( apply_filters( 'woocommerce_email_font_size_base', '1' ) );
$font_family     = apply_filters( 'woocommerce_email_font_family', '"Helvetica Neue", "Helvetica", Arial, sans-serif' );

// Load header image
$header_img      = apply_filters( 'woocommerce_email_header_image', get_option( 'woocommerce_email_header_image' ) );

// Load width
$width           = floatval( apply_filters( 'woocommerce_email_width', get_option( 600 ) ) );

// For gmail compatibility, including CSS styles in head/body are stripped out therefore styles need to be inline. These variables contain rules which are added to the template inline. !important; is a gmail hack to prevent styles being stripped if it doesn't like something.
$wrapper = "
	background-color: " . esc_attr( $bg ) . ";
	width:100%;
	-webkit-text-size-adjust:none !important;
	margin:0;
	padding: 70px 0 70px 0;
";
$template_container = "
	-webkit-box-shadow:0 0 0 3px rgba(0,0,0,0.025) !important;
	box-shadow:0 0 0 3px rgba(0,0,0,0.025) !important;
	-webkit-border-radius:" . $rounded_corners . " !important;
	border-radius:" . $rounded_corners . " !important;
	background-color: " . esc_attr( $body ) . ";
	border: 1px solid $bg_darker_10;
	-webkit-border-radius:" . $rounded_corners . " !important;
	border-radius:" . $rounded_corners . " !important;
";
$template_header = "
	background-color: " . esc_attr( $base ) .";
	color: $base_text;
	-webkit-border-top-left-radius:" . $rounded_corners . " !important;
	-webkit-border-top-right-radius:" . $rounded_corners . " !important;
	border-top-left-radius:" . $rounded_corners . " !important;
	border-top-right-radius:" . $rounded_corners . " !important;
	border-bottom: 0;
	font-family:" . $font_family . ";
	font-weight:bold;
	line-height:100%;
	vertical-align:middle;
";
$body_content = "
	background-color: " . esc_attr( $body ) . ";
	-webkit-border-radius:" . $rounded_corners . " !important;
	border-radius:" . $rounded_corners . " !important;
";
$body_content_inner = "
	color: $text_lighter_20;
	font-family:" . $font_family . ";
	font-size:" . $font_size_base * 14 . "px;
	line-height:150%;
	text-align:left;
";
$header_content_h1 = "
	color: " . esc_attr( $base_text ) . ";
	margin:0;
	padding: 28px 24px;
	text-shadow: 0 1px 0 $base_lighter_20;
	display:block;
	font-family:" . $font_family . ";
	font-size:" . $font_size_base * 30 . "px;
	font-weight:bold;
	text-align:left;
	line-height: 150%;
";
?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title><?php echo get_bloginfo( 'name' ); ?></title>
	</head>
    <body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">
    	<div style="<?php echo $wrapper; ?>">
        	<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
            	<tr>
                	<td align="center" valign="top">
                		<?php
                			if ( $header_img ) {
                				echo '<p style="margin-top:0;"><img src="' . esc_url( $header_img ) . '" alt="' . get_bloginfo( 'name' ) . '" /></p>';
                			}
                		?>
                    	<table border="0" cellpadding="0" cellspacing="0" width="<?php echo $width; ?>" id="template_container" style="<?php echo $template_container; ?>">
                        	<tr>
                            	<td align="center" valign="top">
                                    <!-- Header -->
                                	<table border="0" cellpadding="0" cellspacing="0" width="<?php echo $width; ?>" id="template_header" style="<?php echo $template_header; ?>" bgcolor="<?php echo $base; ?>">
                                        <tr>
                                            <td>
                                            	<h1 style="<?php echo $header_content_h1; ?>"><?php echo $email_heading; ?></h1>

                                            </td>
                                        </tr>
                                    </table>
                                    <!-- End Header -->
                                </td>
                            </tr>
                        	<tr>
                            	<td align="center" valign="top">
                                    <!-- Body -->
                                	<table border="0" cellpadding="0" cellspacing="0" width="<?php echo $width; ?>" id="template_body">
                                    	<tr>
                                            <td valign="top" style="<?php echo $body_content; ?>">
                                                <!-- Content -->
                                                <table border="0" cellpadding="20" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td valign="top">
                                                            <div style="<?php echo $body_content_inner; ?>">
