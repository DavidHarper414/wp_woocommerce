/**
 * Internal dependencies
 */
import { getAdminSetting } from '../admin-settings'; // Adjust the import path

describe( 'getAdminSetting', () => {
	let consoleWarnSpy;

	beforeEach( () => {
		consoleWarnSpy = jest
			.spyOn( console, 'warn' )
			.mockImplementation( () => {} );
		window.deprecatedWcSettings = {}; // Reset before each test
	} );

	afterEach( () => {
		consoleWarnSpy.mockRestore();
		delete window.deprecatedWcSettings;
	} );

	it( 'should log a warning if the deprecated setting exists under "admin.name"', () => {
		window.deprecatedWcSettings = {
			'admin.testSetting': 'This setting is deprecated',
		};

		getAdminSetting( 'testSetting' ); // Should find 'admin.testSetting'

		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'This setting is deprecated'
		);
	} );

	it( 'should log a default warning message if "admin.name" exists but is falsy', () => {
		window.deprecatedWcSettings = {
			'admin.testSetting': null,
		};

		getAdminSetting( 'testSetting' );

		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'Deprecated: testSetting has been deprecated. This value will be removed soon.'
		);
	} );

	it( 'should not log a warning if the setting does not exist under "admin.name"', () => {
		window.deprecatedWcSettings = {
			testSetting: 'This setting should not trigger a warning', // Wrong key format
		};

		getAdminSetting( 'testSetting' ); // Does not match 'admin.testSetting'

		expect( consoleWarnSpy ).not.toHaveBeenCalled();
	} );

	it( 'should not log a warning if deprecatedWcSettings is empty', () => {
		getAdminSetting( 'testSetting' ); // No settings defined

		expect( consoleWarnSpy ).not.toHaveBeenCalled();
	} );
} );
