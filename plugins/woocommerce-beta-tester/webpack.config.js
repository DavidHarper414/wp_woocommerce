const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const WooCommerceDependencyExtractionWebpackPlugin = require( '@woocommerce/dependency-extraction-webpack-plugin' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	cache: ( process.env.CI && { type: 'memory' } ) || {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack-beta-tester'
		),
	},
	entry: {
		...defaultConfig.entry,
		// Separate entry point for the live-branches page.
		'live-branches': './src/live-branches/index.tsx',
	},
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				include: [ path.resolve( __dirname, './src/' ) ],
			},
		],
	},
	resolve: {
		extensions: [ '.js', '.jsx', '.tsx', '.ts' ],
	},
	plugins: [
		...defaultConfig.plugins.filter(
			( plugin ) =>
				plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
		),
		new WooCommerceDependencyExtractionWebpackPlugin(),
	],
};
