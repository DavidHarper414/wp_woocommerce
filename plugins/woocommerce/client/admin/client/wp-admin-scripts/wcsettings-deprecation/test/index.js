/**
 * Internal dependencies
 */
import {
	getWcSettingsDeprecationMessage,
	createWcSettingsDeprecationProxy,
} from '../index';

describe( 'Deprecation Proxy', () => {
	let originalWcSettings;
	let originalDeprecatedWcSettings;

	beforeEach( () => {
		originalWcSettings = global.wcSettings;
		originalDeprecatedWcSettings = global.deprecatedWcSettings;

		global.wcSettings = {
			someSetting: 'value',
			nested: {
				deepSetting: 'deepValue',
			},
		};

		global.deprecatedWcSettings = {
			someSetting: 'Deprecated: someSetting is deprecated.',
			'nested.deepSetting':
				'Deprecated: nested.deepSetting is deprecated.',
		};
	} );

	afterEach( () => {
		global.wcSettings = originalWcSettings;
		global.deprecatedWcSettings = originalDeprecatedWcSettings;
		jest.restoreAllMocks();
	} );

	test( 'getDeprecationMessage should return correct deprecation message', () => {
		expect( getWcSettingsDeprecationMessage( 'someSetting' ) ).toBe(
			'Deprecated: someSetting is deprecated.'
		);
		expect( getWcSettingsDeprecationMessage( 'nested.deepSetting' ) ).toBe(
			'Deprecated: nested.deepSetting is deprecated.'
		);
		expect( getWcSettingsDeprecationMessage( 'nonExistent' ) ).toBe( null );
	} );

	test( 'createDeprecationProxy should warn when accessing deprecated properties', () => {
		global.wcSettings = createWcSettingsDeprecationProxy(
			global.wcSettings
		);
		const consoleWarnSpy = jest
			.spyOn( console, 'warn' )
			.mockImplementation( () => {} );

		expect( global.wcSettings.someSetting ).toBe( 'value' );
		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'Deprecated: someSetting is deprecated.'
		);

		expect( global.wcSettings.nested.deepSetting ).toBe( 'deepValue' );
		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'Deprecated: nested.deepSetting is deprecated.'
		);

		expect( global.wcSettings.nested ).toBeInstanceOf( Object );

		consoleWarnSpy.mockRestore();
	} );

	test( 'createDeprecationProxy should not warn for non-deprecated properties', () => {
		global.wcSettings = createWcSettingsDeprecationProxy(
			global.wcSettings
		);
		const consoleWarnSpy = jest
			.spyOn( console, 'warn' )
			.mockImplementation( () => {} );

		expect( global.wcSettings.nonDeprecatedSetting ).toBeUndefined();
		expect( consoleWarnSpy ).not.toHaveBeenCalled();

		consoleWarnSpy.mockRestore();
	} );
} );
