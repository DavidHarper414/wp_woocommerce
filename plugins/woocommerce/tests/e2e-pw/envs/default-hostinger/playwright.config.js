let config = require( '../../playwright.config.js' );
const { tags } = require( '../../fixtures/fixtures' );

const grepInvert = new RegExp(
	`${ tags.COULD_BE_LOWER_LEVEL_TEST }|${ tags.NON_CRITICAL }|${ tags.TO_BE_REMOVED }`
);

config = {
	...config.default,
	projects: [
		...config.setupProjects,
		{
			name: 'reset',
			testDir: `${ config.TESTS_ROOT_PATH }/fixtures`,
			testMatch: 'reset.setup.js',
		},
		{
			name: 'e2e-hostinger',
			testIgnore: [
				'**/api-tests/**',
				'**/js-file-monitor/**',
			],
			grepInvert,
			dependencies: [ 'reset', 'site setup' ],
		},
		{
			name: 'api-hostinger',
			testMatch: [ '**/api-tests/**' ],
			grepInvert,
			dependencies: [ 'reset', 'site setup' ],
		},
	],
};

module.exports = config;
