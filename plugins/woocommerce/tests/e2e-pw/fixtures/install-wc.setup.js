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
		await wcbtApi.fetch(
			'/wp-json/wc-admin-test-helper/live-branches/deactivate/v1',
			{ method: 'GET' }
		);
		console.log( 'WC deactivated.' );
	} catch ( err ) {
		console.error( 'Error deactivating WooCommerce:', err );
	}

	const wcVersion = process.env.WC_VERSION || 'latest';
	let resolvedVersion = '';

	// Install WC
	if ( wcVersion === 'latest' ) {
		try {
			const latestResponse = await wcbtApi.fetch(
				'/wp-json/wc-admin-test-helper/live-branches/install/latest/v1',
				{
					method: 'POST',
					data: { include_pre_releases: true },
				}
			);

			if ( ! latestResponse.ok() ) {
				throw new Error(
					`Failed to install latest WC: ${ latestResponse.status() } ${ await latestResponse.text() }`
				);
			}

			resolvedVersion = ( await latestResponse.json() )?.version || '';
			if ( ! resolvedVersion ) {
				console.error( 'Error: latestResponse.version is undefined.' );
			} else {
				console.log( `Latest version installed: ${ resolvedVersion }` );
			}
		} catch ( err ) {
			console.error( 'Error installing latest WC:', err );
		}
	} else {
		try {
			const downloadUrl = `https://github.com/woocommerce/woocommerce/releases/download/${ wcVersion }/woocommerce.zip`;
			const response = await wcbtApi.fetch(
				'/wp-json/wc-admin-test-helper/live-branches/install/v1',
				{
					method: 'POST',
					data: {
						pr_name: wcVersion,
						download_url: downloadUrl,
						version: wcVersion,
					},
				}
			);

			if ( ! response.ok() ) {
				throw new Error(
					`Failed to install WC ${ wcVersion }: ${ response.status() } ${ await response.text() }`
				);
			}

			resolvedVersion = wcVersion;
			console.log( `WooCommerce ${ wcVersion } installed.` );
		} catch ( err ) {
			console.error( `Error installing WC version ${ wcVersion }:`, err );
		}
	}

	// Activate WC
	if ( resolvedVersion ) {
		try {
			const activationResponse = await wcbtApi.fetch(
				'/wp-json/wc-admin-test-helper/live-branches/activate/v1',
				{
					method: 'POST',
					data: {
						version: resolvedVersion,
					},
				}
			);

			if ( ! activationResponse.ok() ) {
				throw new Error(
					`Failed to activate WC ${ resolvedVersion }: ${ activationResponse.status() } ${ await activationResponse.text() }`
				);
			}

			console.log( `WooCommerce ${ resolvedVersion } activated.` );
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

	console.log( 'Installing with WC Beta Tester is finished.' );
} );
