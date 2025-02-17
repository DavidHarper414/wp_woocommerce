const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const WooCommerceDependencyExtractionWebpackPlugin = require( '@woocommerce/dependency-extraction-webpack-plugin' );
const path = require( 'path' );

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
	...defaultConfig,
	cache: ( NODE_ENV !== 'development' && { type: 'memory' } ) || {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack-woo-ai'
		),
	},
	entry: {
		index: './src/index.ts',
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
			{
				test: /\.(png|jp(e*)g|svg|gif)$/,
				type: 'asset/resource',
			},
		],
	},
	resolve: {
		extensions: [ '.js', '.jsx', '.tsx', '.ts' ],
		fallback: {
			stream: false,
			path: false,
			fs: false,
		},
	},
	plugins: [
		...defaultConfig.plugins.filter(
			( plugin ) =>
				plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
		),
		new WooCommerceDependencyExtractionWebpackPlugin(),
	],
};
