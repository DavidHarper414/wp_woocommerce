/**
 * Internal dependencies
 */
import { createDeprecatedObjectProxy } from '../../utils';
import {
	deprecatedAdminProperties,
	isDevelopmentEnvironment,
} from '../../utils/admin-settings';

if (
	window.wcSettings &&
	deprecatedAdminProperties &&
	Object.keys( deprecatedAdminProperties ).length > 0 &&
	isDevelopmentEnvironment
) {
	wcSettings = createDeprecatedObjectProxy( wcSettings, {
		admin: deprecatedAdminProperties,
	} );
}
