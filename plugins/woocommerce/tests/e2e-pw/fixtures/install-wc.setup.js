/**
 * Internal dependencies
 */
import { test as setup } from './fixtures';

setup( 'Install WC using WC Beta Tester', async ( { wcbtApi } ) => {
	setup.skip(
		! process.env.INSTALL_WC,
		'Skipping installing WC using WC Beta Tester; INSTALL_WC not found.'
	);
	console.log( 'INSTALL_WC is enabled. Running installation script...' );

	// Deactivate WC
	try {
		await wcbtApi.deactivateWC();
		console.log( 'WooCommerce plugin deactivated.' );
	} catch ( err ) {
		console.error( 'Error deactivating WooCommerce:', err );
	}

	const wcVersion = process.env.WC_VERSION || 'latest';
	let resolvedVersion = '';

	// Install WC
	if ( wcVersion === 'latest' ) {
		try {
			const latestResponse = await wcbtApi.installLatest();
			resolvedVersion = latestResponse?.version || '';
			if ( ! resolvedVersion ) {
				console.log( resolvedVersion );
				console.error( 'Error: latestResponse.version is undefined.' );
			} else {
				console.log( `Latest version installed: ${ resolvedVersion }` );
			}
		} catch ( err ) {
			console.error( 'Error installing latest WC:', err );
		}
	} else {
		try {
			await wcbtApi.installSpecificVersion( wcVersion );
			resolvedVersion = wcVersion;
			console.log( `${ wcVersion } installed.` );
		} catch ( err ) {
			console.error( `Error installing WC version ${ wcVersion }:`, err );
		}
	}

	// Activate WC
	if ( resolvedVersion ) {
		try {
			await wcbtApi.activateWC( resolvedVersion );
			console.log( `${ resolvedVersion } activated.` );
		} catch ( err ) {
			console.error(
				`Error activating WC version ${ resolvedVersion }:`,
				err
			);
		}
	} else {
		console.error(
			'Error: resolvedVersion is undefined. Skipping activation.'
		);
	}
	console.log( 'INSTALL_WC: Installing with WC Beta Tester is finished.' );
} );
