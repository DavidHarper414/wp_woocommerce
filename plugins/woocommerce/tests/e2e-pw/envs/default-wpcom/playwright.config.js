let config = require( '../../playwright.config.js' );
const { devices } = require( '@playwright/test' );

config = {
	...config,
	projects: [
		{
			name: 'default',
			use: { ...devices[ 'Desktop Chrome' ] },
			testMatch: '**.spec.js',
		},
	],
};

module.exports = config;
