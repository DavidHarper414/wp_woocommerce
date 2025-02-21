/**
 * Internal dependencies
 */
import { createDeprecatedObjectProxy } from '../../utils';
import { deprecatedAdminProperties } from '../../utils/admin-settings';

if (
	window.wcSettings &&
	deprecatedAdminProperties &&
	Object.keys( deprecatedAdminProperties ).length > 0
) {
	wcSettings = createDeprecatedObjectProxy( wcSettings, {
		admin: deprecatedAdminProperties,
	} );
}
