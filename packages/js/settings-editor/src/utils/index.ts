/**
 * External dependencies
 */
import { getSetting } from '@woocommerce/settings';
import { sanitize } from 'dompurify';
export function isGutenbergVersionAtLeast( version: number ) {
	const adminSettings: { gutenberg_version?: string } = getSetting( 'admin' );
	if ( adminSettings.gutenberg_version ) {
		return parseFloat( adminSettings?.gutenberg_version ) >= version;
	}
	return false;
}

const ALLOWED_TAGS = [
	'a',
	'b',
	'em',
	'i',
	'strong',
	'p',
	'br',
	'code',
	'mark',
	'sub',
	'sup',
	'pre',
	'span',
	'ul',
	'ol',
	'li',
	'blockquote',
	'hr',
];
const ALLOWED_ATTR = [ 'target', 'href', 'rel', 'name', 'download', 'title' ];

export function sanitizeHTML( html: string ) {
	return sanitize( html, { ALLOWED_TAGS, ALLOWED_ATTR } );
}
