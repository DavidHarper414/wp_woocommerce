/**
 * External dependencies
 */
const path = require( 'path' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

/**
 * Internal dependencies
 */
const { sharedOptimizationConfig } = require( './webpack-shared-config' );

const entries = {
	// Blocks
	'woocommerce/product-button':
		'./assets/js/atomic/blocks/product-elements/button/frontend.tsx',
	'woocommerce/product-gallery':
		'./assets/js/blocks/product-gallery/frontend.tsx',
	'woocommerce/product-gallery-large-image':
		'./assets/js/blocks/product-gallery/inner-blocks/product-gallery-large-image/frontend.tsx',
	'woocommerce/product-collection':
		'./assets/js/blocks/product-collection/frontend.tsx',

	// Other
	'woocommerce/product-collection-notices':
		'./assets/js/blocks/product-collection/notices-frontend.ts',
};

module.exports = {
	entry: entries,
	optimization: sharedOptimizationConfig,
	name: 'interactivity-blocks-modules',
	experiments: {
		outputModule: true,
	},
	output: {
		devtoolNamespace: 'wc',
		filename: '[name].js',
		library: {
			type: 'module',
		},
		path: path.resolve( __dirname, '../build/' ),
		asyncChunks: false,
		chunkFormat: 'module',
		module: true,
	},
	resolve: {
		extensions: [ '.js', '.ts', '.tsx' ],
	},
	plugins: [
		new DependencyExtractionWebpackPlugin( {
			combineAssets: true,
			combinedOutputFile: './interactivity-blocks-frontend-assets.php',
		} ),
	],
	module: {
		rules: [
			{
				test: /\.(j|t)sx?$/,
				exclude: [ /[\/\\](node_modules|build|docs|vendor)[\/\\]/ ],
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@wordpress/babel-preset-default',
								{
									modules: false,
									targets: {
										browsers: [
											'extends @wordpress/browserslist-config',
										],
									},
								},
							],
						],
						cacheDirectory: path.resolve(
							__dirname,
							'../../../node_modules/.cache/babel-loader'
						),
						cacheCompression: false,
					},
				},
			},
			{
				test: /\.s[c|a]ss$/,
				use: {
					loader: 'ignore-loader',
				},
			},
		],
	},
};
