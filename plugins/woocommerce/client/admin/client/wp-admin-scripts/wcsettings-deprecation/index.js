if (
	window.wcSettings &&
	window.deprecatedWcSettings &&
	Object.keys( window.deprecatedWcSettings ).length > 0
) {
	// Function to check if a property or any of its parents is deprecated
	function getDeprecationMessage( fullPath ) {
		const parts = fullPath.split( '.' );
		while ( parts.length ) {
			const checkPath = parts.join( '.' );
			if ( window.deprecatedWcSettings.hasOwnProperty( checkPath ) ) {
				return (
					window.deprecatedWcSettings[ checkPath ] ||
					`Deprecated: ${ checkPath } has been deprecated. This value will be removed soon. Please use a datastore instead.`
				);
			}
			parts.pop(); // Move up one level
		}
		return null;
	}

	// Function to create a Proxy with deprecation warnings
	function createDeprecationProxy( obj, path = '' ) {
		return new Proxy( obj, {
			get( target, prop, receiver ) {
				const fullPath = path ? `${ path }.${ prop }` : prop;

				const warningMessage = getDeprecationMessage( fullPath );
				if ( warningMessage ) {
					console.warn( warningMessage );
				}

				const value = Reflect.get( target, prop, receiver );

				// If the value is an object, wrap it in a Proxy recursively
				return value !== null && typeof value === 'object'
					? createDeprecationProxy( value, fullPath )
					: value;
			},
		} );
	}

	wcSettings = createDeprecationProxy( wcSettings );
}
