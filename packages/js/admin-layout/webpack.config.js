/**
 * Internal dependencies
 */
const { webpackConfig } = require( '@woocommerce/internal-style-build' );

/**
 * External dependencies
 */
const path = require( 'path' );

module.exports = {
	mode: process.env.NODE_ENV || 'development',
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../../node_modules/.cache/webpack-admin-layout'
		),
	},
	entry: {
		'build-style': __dirname + '/src/style.scss',
	},
	output: {
		path: __dirname,
	},
	module: {
		parser: webpackConfig.parser,
		rules: webpackConfig.rules,
	},
	plugins: webpackConfig.plugins,
};
