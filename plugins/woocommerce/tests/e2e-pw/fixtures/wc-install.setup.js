/**
 * Internal dependencies
 */
import { test as setup } from './fixtures';
import { ADMIN_STATE_PATH } from '../playwright.config';

setup.use( { storageState: ADMIN_STATE_PATH } );

setup( 'Install WC using WC Beta Tester', async ( { page } ) => {
	setup.skip(
		! process.env.INSTALL_WC,
		'Skipping installing WC using WC Beta Tester; INSTALL_WC not found.'
	);
	console.log( 'INSTALL_WC is enabled. Running installation script...' );
	await page.goto( './wp-admin/site-editor.php' );

	// deactivate WC first
	try {
		await page.evaluate( async () => {
			return await wp.apiFetch( {
				path: '/wc-admin-test-helper/live-branches/deactivate/v1',
				method: 'GET',
			} );
		} );
	} catch ( err ) {
		console.error( 'Error executing wp.apiFetch (deactivate):', err );
	}

	const wcVersion = process.env.WC_VERSION || 'latest';
	let resolvedVersion = '';

	// install WC
	if ( wcVersion === 'latest' ) {
		try {
			const latestResponse = await page.evaluate( async () => {
				return await wp.apiFetch( {
					path: '/wc-admin-test-helper/live-branches/install/latest/v1',
					method: 'POST',
					data: { include_pre_releases: true },
				} );
			} );
			resolvedVersion = latestResponse?.version || '';
			if ( ! resolvedVersion ) {
				console.error( 'Error: latestResponse.version is undefined.' );
			}
		} catch ( err ) {
			console.error(
				'Error executing wp.apiFetch (install latest):',
				err
			);
		}
	} else {
		try {
			await page.evaluate( async ( selectedVersion ) => {
				return await wp.apiFetch( {
					path: '/wc-admin-test-helper/live-branches/install/v1',
					method: 'POST',
					data: {
						pr_name: selectedVersion,
						download_url: `https://github.com/woocommerce/woocommerce/releases/download/${ selectedVersion }/woocommerce.zip`,
						version: selectedVersion,
					},
				} );
			}, wcVersion );
			resolvedVersion = wcVersion;
		} catch ( err ) {
			console.error(
				'Error executing wp.apiFetch (install specific version):',
				err
			);
		}
	}

	if ( resolvedVersion ) {
		try {
			await page.evaluate( async ( installedVersion ) => {
				return await wp.apiFetch( {
					path: '/wc-admin-test-helper/live-branches/activate/v1',
					method: 'POST',
					data: { version: installedVersion },
				} );
			}, resolvedVersion );
		} catch ( err ) {
			console.error( 'Error executing wp.apiFetch (activate):', err );
		}
	} else {
		console.error(
			'Error: resolvedVersion is undefined. Skipping activation.'
		);
	}
	console.log( 'INSTALL_WC: Installing with WC Beta Tester is finished.' );
} );
