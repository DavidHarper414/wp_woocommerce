/**
 * Internal dependencies
 */
import { getAdminSetting } from '../admin-settings'; // Adjust the import path

describe( 'getAdminSetting', () => {
	let consoleWarnSpy;
	const fallback = {
		onboarding: {
			profile: {
				name: 'tester',
			},
		},
		test: {},
	};

	const filter = ( value ) => value;

	beforeEach( () => {
		consoleWarnSpy = jest
			.spyOn( console, 'warn' )
			.mockImplementation( () => {} );
	} );

	afterEach( () => {
		consoleWarnSpy.mockRestore();
	} );

	it( 'should log a warning if the deprecated setting exists under "admin.name"', () => {
		const deprecatedWcSettings = {
			onboarding: {
				profile: 'This setting is deprecated',
			},
		};

		const onboarding = getAdminSetting(
			'onboarding',
			fallback,
			filter,
			deprecatedWcSettings
		);

		void onboarding.profile;

		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'This setting is deprecated'
		);
	} );

	it( 'should not log a warning if the setting does not exist under "admin.name"', () => {
		const deprecatedWcSettings = {
			onboarding: {
				profile: 'This setting is deprecated',
			},
		};

		getAdminSetting( 'test', fallback, filter, deprecatedWcSettings );

		expect( consoleWarnSpy ).not.toHaveBeenCalled();
	} );
} );
