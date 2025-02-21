/**
 * External dependencies
 */
import { useEffect } from '@wordpress/element';

export * from './plugins';

/**
 * Get the URL params.
 *
 * @param {string} locationSearch - Querystring part of a URL, including the question mark (?).
 * @return {Object} - URL params.
 */
export function getUrlParams( locationSearch ) {
	if ( locationSearch ) {
		return locationSearch
			.substr( 1 )
			.split( '&' )
			.reduce( ( params, query ) => {
				const chunks = query.split( '=' );
				const key = chunks[ 0 ];
				let value = decodeURIComponent( chunks[ 1 ] );
				value = isNaN( Number( value ) ) ? value : Number( value );
				return ( params[ key ] = value ), params;
			}, {} );
	}
	return {};
}

/**
 * Get the current screen name.
 *
 * @return {string} - Screen name.
 */
export function getScreenName() {
	let screenName = '';
	const {
		page,
		path,
		post_type: postType,
	} = getUrlParams( window.location.search );
	if ( page ) {
		const currentPage = page === 'wc-admin' ? 'home_screen' : page;
		screenName = path
			? path.replace( /\//g, '_' ).substring( 1 )
			: currentPage;
	} else if ( postType ) {
		screenName = postType;
	}
	return screenName;
}

/**
 * Similar to filter, but return two arrays separated by a partitioner function
 *
 * @param {Array}    arr         - Original array of values.
 * @param {Function} partitioner - Function to return truthy/falsy values to separate items in array.
 *
 * @return {Array} - Array of two arrays, first including truthy values, and second including falsy.
 */
export const sift = ( arr, partitioner ) =>
	arr.reduce(
		( all, curr ) => {
			all[ !! partitioner( curr ) ? 0 : 1 ].push( curr );
			return all;
		},
		[ [], [] ]
	);

const timeFrames = [
	{ name: '0-2s', max: 2 },
	{ name: '2-5s', max: 5 },
	{ name: '5-10s', max: 10 },
	{ name: '10-15s', max: 15 },
	{ name: '15-20s', max: 20 },
	{ name: '20-30s', max: 30 },
	{ name: '30-60s', max: 60 },
	{ name: '>60s' },
];

/**
 * Returns time frame for a given time in milliseconds.
 *
 * @param {number} timeInMs - time in milliseconds
 *
 * @return {string} - Time frame.
 */
export const getTimeFrame = ( timeInMs ) => {
	for ( const timeFrame of timeFrames ) {
		if ( ! timeFrame.max ) {
			return timeFrame.name;
		}
		if ( timeInMs < timeFrame.max * 1000 ) {
			return timeFrame.name;
		}
	}
};

/**
 * Goes into fullscreen mode when the component is loaded
 *
 * @param {string[]} classes - classes to add to document.body
 */
export const useFullScreen = ( classes ) => {
	useEffect( () => {
		const hasToolbarClass =
			document.documentElement.classList.contains( 'wp-toolbar' );
		document.body.classList.remove( 'woocommerce-admin-is-loading' );
		document.body.classList.add( classes );
		document.body.classList.add( 'woocommerce-admin-full-screen' );
		document.body.classList.add( 'is-wp-toolbar-disabled' );
		if ( hasToolbarClass ) {
			document.documentElement.classList.remove( 'wp-toolbar' );
		}
		return () => {
			document.body.classList.remove( classes );
			document.body.classList.remove( 'woocommerce-admin-full-screen' );
			document.body.classList.remove( 'is-wp-toolbar-disabled' );
			if ( hasToolbarClass ) {
				document.documentElement.classList.add( 'wp-toolbar' );
			}
		};
	} );
};

/**
 * Create a proxy object to warn about deprecated properties.
 *
 * Your object (obj):
 * {
 * 	prop1: "test",
 * 	prop2: {
 * 		"prop3": "test"
 *  }
 * }
 *
 * messages object structure:
 * {
 *  prop1: {
 *   prop2: 'Deprecation message'
 * }
 *
 * Once proxied, when you access obj.prop1.prop2, you will see a warning in the console.
 *
 * @param {Object} obj      - Object to proxy
 * @param {Object} messages - Object containing deprecation messages
 * @param {string} basePath - Base path
 * @return {Proxy} proxied object
 */
export function createDeprecatedObjectProxy( obj, messages, basePath = '' ) {
	return new Proxy( obj, {
		get( target, prop, receiver ) {
			const fullPath = basePath ? `${ basePath }.${ prop }` : prop;

			// Traverse the messages object to check for a deprecation message
			const parts = fullPath.split( '.' );
			let current = messages;

			for ( const part of parts ) {
				if (
					current &&
					typeof current === 'object' &&
					part in current
				) {
					current = current[ part ];
					if ( typeof current === 'string' ) {
						console.warn( current ); // eslint-disable-line no-console
						break;
					}
				} else {
					break;
				}
			}

			const value = Reflect.get( target, prop, receiver );
			return value && typeof value === 'object'
				? createDeprecatedObjectProxy( value, messages, fullPath )
				: value;
		},
	} );
}
