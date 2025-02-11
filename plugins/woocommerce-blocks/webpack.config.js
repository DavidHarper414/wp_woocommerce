/**
 * Internal dependencies
 */
const { NODE_ENV, getAlias } = require( './bin/webpack-helpers.js' );
const {
	getCoreConfig,
	getMainConfig,
	getFrontConfig,
	getPaymentsConfig,
	getExtensionsConfig,
	getSiteEditorConfig,
	getStylingConfig,
	getInteractivityAPIConfig,
	getCartAndCheckoutFrontendConfig,
} = require( './bin/webpack-configs.js' );

/**
 * External dependencies
 */
const path = require( 'path' );

// Only options shared between all configs should be defined here.
const sharedConfig = {
	mode: NODE_ENV,
	performance: {
		hints: false,
	},
	stats: {
		all: false,
		assets: true,
		builtAt: true,
		colors: true,
		errors: true,
		hash: true,
		timings: true,
	},
	watchOptions: {
		ignored: /node_modules/,
	},
	devtool: NODE_ENV === 'development' ? 'source-map' : false,
};

const CartAndCheckoutFrontendConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack1'
		),
	},
	...getCartAndCheckoutFrontendConfig( { alias: getAlias() } ),
};

// Core config for shared libraries.
const CoreConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack2'
		),
	},
	...getCoreConfig( { alias: getAlias() } ),
};

// Main Blocks config for registering Blocks and for the Editor.
const MainConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack3'
		),
	},

	...getMainConfig( {
		alias: getAlias(),
	} ),
};

// Frontend config for scripts used in the store itself.
const FrontendConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack4'
		),
	},
	...getFrontConfig( { alias: getAlias() } ),
};

/**
 * Config for building experimental extension scripts.
 */
const ExtensionsConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack5'
		),
	},
	...getExtensionsConfig( { alias: getAlias() } ),
};

/**
 * Config for building the payment methods integration scripts.
 */
const PaymentsConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack6'
		),
	},
	...getPaymentsConfig( { alias: getAlias() } ),
};

/**
 * Config to generate the CSS files.
 */
const StylingConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack7'
		),
	},
	...getStylingConfig( { alias: getAlias() } ),
};

/**
 * Config to generate the Interactivity API runtime.
 */
const InteractivityConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack8'
		),
	},
	...getInteractivityAPIConfig( { alias: getAlias() } ),
};

/**
 * Config to generate the site editor scripts.
 */
const SiteEditorConfig = {
	...sharedConfig,
	cache: {
		type: 'filesystem',
		cacheDirectory: path.resolve(
			__dirname,
			'../../node_modules/.cache/webpack9'
		),
	},
	...getSiteEditorConfig( { alias: getAlias() } ),
};

module.exports = [
	CartAndCheckoutFrontendConfig,
	CoreConfig,
	MainConfig,
	FrontendConfig,
	ExtensionsConfig,
	PaymentsConfig,
	SiteEditorConfig,
	StylingConfig,
	InteractivityConfig,
];
