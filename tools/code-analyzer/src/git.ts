/**
 * External dependencies
 */
import { CliUx } from '@oclif/core';
import { execSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFileSync } from 'fs';

/**
 * Fetch branches from origin.
 *
 * @param {string}   branch branch/commit hash.
 * @param {Function} error  error print method.
 * @return {boolean} Promise.
 */
export const fetchBranch = (
	branch: string,
	error: ( s: string ) => void
): boolean => {
	CliUx.ux.action.start( `Fetching ${ branch }` );
	const branches = execSync( 'git branch', {
		encoding: 'utf-8',
	} );

	const branchExistsLocally = branches.includes( branch );

	if ( branchExistsLocally ) {
		CliUx.ux.action.stop();
		return true;
	}

	try {
		// Fetch branch.
		execSync( `git fetch origin ${ branch }` );
		// Create branch.
		execSync( `git branch ${ branch } origin/${ branch }` );
	} catch ( e ) {
		error( `Unable to fetch ${ branch }` );
		return false;
	}

	CliUx.ux.action.stop();
	return true;
};

/**
 * Generate a patch file into the temp directory and return its contents
 *
 * @param {string}   source  The GitHub repository.
 * @param {string}   compare Branch/commit hash to compare against the base.
 * @param {string}   base    Base branch/commit hash.
 * @param {Function} error   error print method.
 * @return {string} patch string.
 */
export const generatePatch = (
	source: string,
	compare: string,
	base: string,
	error: ( s: string ) => void
): string => {
	const filename = `${ source }-${ base }-${ compare }.patch`.replace(
		/\//g,
		'-'
	);
	const filepath = join( tmpdir(), filename );

	fetchBranch( base, error );
	fetchBranch( compare, error );

	CliUx.ux.action.start( 'Generating patch for ' + compare );

	try {
		const diffCommand = `git diff ${ base }...${ compare } > ${ filepath }`;
		execSync( diffCommand );
	} catch ( e ) {
		error(
			'Unable to create diff. Check that git origin, base branch, and compare branch all exist.'
		);
	}

	const content = readFileSync( filepath ).toString();

	CliUx.ux.action.stop();
	return content;
};

export const getSchema = (
	branch: string,
	error: ( s: string ) => void
): {
	schema: string;
	OrdersTableDataStore: string;
	ProductAttributesLookup: string;
} | void => {
	try {
		// Make sure the branch is available.
		fetchBranch( branch, error );
		// Start spinner.
		CliUx.ux.action.start( `Gathering schema from ${ branch }` );
		// Save the current branch for later.
		const currentBranch = execSync( 'git rev-parse --abbrev-ref HEAD' );
		// Checkout branch to compare
		execSync( `git checkout ${ branch }` );

		const getSchemaPath =
			'wp-content/plugins/woocommerce/bin/wc-get-schema.php';
		// Get the schema from wp cli
		const schema = execSync(
			`wp-env run cli "wp eval-file '${ getSchemaPath }'"`,
			{
				cwd: 'plugins/woocommerce',
				encoding: 'utf-8',
			}
		);

		const OrdersTableDataStore = execSync(
			'wp-env run cli "wp eval \'echo (new Automattic\\WooCommerce\\Internal\\DataStores\\Orders\\OrdersTableDataStore)->get_database_schema();\'"',
			{
				cwd: 'plugins/woocommerce',
				encoding: 'utf-8',
			}
		);
		const ProductAttributesLookup = execSync(
			'wp-env run cli "wp eval \'echo (new Automattic\\WooCommerce\\Internal\\ProductAttributesLookup\\DataRegenerator)->get_table_creation_sql();\'"',
			{
				cwd: 'plugins/woocommerce',
				encoding: 'utf-8',
			}
		);
		// Return to the current branch.
		execSync( `git checkout ${ currentBranch }` );

		CliUx.ux.action.stop();
		return {
			schema,
			OrdersTableDataStore,
			ProductAttributesLookup,
		};
	} catch ( e ) {
		error( `Unable to get schema for branch ${ branch }. \n${ e }` );
	}
};

/**
 * Generate a schema for each branch being compared.
 *
 * @param {string}   source  The GitHub repository.
 * @param {string}   compare Branch/commit hash to compare against the base.
 * @param {string}   base    Base branch/commit hash.
 * @param {Function} error   error print method.
 * @return {Object|void>} diff object.
 */
export const generateSchemaDiff = (
	source: string,
	compare: string,
	base: string,
	error: ( s: string ) => void
): {
	schema: { base: string; compare: string; areEqual: boolean };
	OrdersTableDataStore: { base: string; compare: string; areEqual: boolean };
	ProductAttributesLookup: {
		base: string;
		compare: string;
		areEqual: boolean;
	};
} | void => {
	const baseSchema = getSchema( base, error );
	const compareSchema = getSchema( compare, error );
	if ( ! baseSchema || ! compareSchema ) {
		return;
	}
	return {
		schema: {
			base: baseSchema.schema,
			compare: compareSchema.schema,
			areEqual: baseSchema.schema === compareSchema.schema,
		},
		OrdersTableDataStore: {
			base: baseSchema.OrdersTableDataStore,
			compare: compareSchema.OrdersTableDataStore,
			areEqual:
				baseSchema.OrdersTableDataStore ===
				compareSchema.OrdersTableDataStore,
		},
		ProductAttributesLookup: {
			base: baseSchema.ProductAttributesLookup,
			compare: compareSchema.ProductAttributesLookup,
			areEqual:
				baseSchema.ProductAttributesLookup ===
				compareSchema.ProductAttributesLookup,
		},
	};
};
