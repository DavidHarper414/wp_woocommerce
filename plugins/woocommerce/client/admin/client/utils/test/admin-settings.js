/**
 * Internal dependencies
 */
import { getAdminSetting } from '../admin-settings';

describe( 'getAdminSetting', () => {
	let consoleWarnSpy;
	beforeEach( () => {
		consoleWarnSpy = jest
			.spyOn( console, 'warn' )
			.mockImplementation( () => {} );
		window.deprecatedWcSettings = {
			testSetting: 'This setting is deprecated',
		};
	} );

	afterEach( () => {
		consoleWarnSpy.mockRestore();
		delete window.deprecatedWcSettings;
	} );

	it( 'should log a warning if the setting is deprecated', () => {
		getAdminSetting( 'testSetting' );

		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'This setting is deprecated'
		);
	} );

	it( 'should log a default warning message if deprecated setting has a falsy value', () => {
		window.deprecatedWcSettings.testSetting = '';

		getAdminSetting( 'testSetting' );

		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'Deprecated: testSetting has been deprecated. This value will be removed soon.'
		);
	} );

	it( 'should not log a warning if the setting is not listed in deprecatedWcSettings', () => {
		getAdminSetting( 'nonExistentSetting' ); // A setting that is not in deprecatedWcSettings

		expect( consoleWarnSpy ).not.toHaveBeenCalled();
	} );
} );
