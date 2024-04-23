const https = require( 'https' );

const generateWordpressPlaygroundBlueprint = ( runId, prNumber ) => {
	const defaultSchema = {
		$schema: 'https://playground.wordpress.net/blueprint-schema.json',

		landingPage: '/wp-admin/',

		preferredVersions: {
			php: '8.0',
			wp: 'latest',
		},

		phpExtensionBundles: [ 'kitchen-sink' ],

		steps: [
			{
				step: 'installPlugin',
				pluginZipFile: {
					resource: 'url',
					url: `https://playground.wordpress.net/plugin-proxy.php?org=woocommerce&repo=woocommerce&workflow=Build%20Live%20Branch&artifact=plugins-${ runId }&pr=${ prNumber }`,
				},
				options: {
					activate: true,
				},
			},

			{
				step: 'installPlugin',
				pluginZipFile: {
					resource: 'url',
					url: 'https://github.com/woocommerce/wc-smooth-generator/releases/download/1.1.0/wc-smooth-generator.zip',
				},
				options: {
					activate: true,
				},
			},

			{
				step: 'login',
				username: 'admin',
				password: 'password',
			},
		],
		plugins: [],
	};

	return defaultSchema;
};

async function run( { github, context, core } ) {
	const commentInfo = {
		owner: context.repo.owner,
		repo: context.repo.repo,
		issue_number: context.issue.number,
	};

	const comments = ( await github.rest.issues.listComments( commentInfo ) )
		.data;

	for ( const currentComment of comments ) {
		if (
			currentComment.user.type === 'Bot' &&
			currentComment.body.includes( 'Test using WordPress Playground' )
		) {
			return;
		}
	}

	const defaultSchema = generateWordpressPlaygroundBlueprint(
		context.runId,
		context.issue.number
	);

	const url = `https://playground.wordpress.net/#${ Buffer.from(
		JSON.stringify( defaultSchema )
	).toString( 'base64' ) }`;

	commentInfo.body = `
## Test using WordPress Playground
The changes in this pull request can be previewed and tested using a [WordPress Playground](https://developer.wordpress.org/playground/) instance.
[WordPress Playground](https://developer.wordpress.org/playground/) is an experimental project that creates a full WordPress instance entirely within the browser.

[Test this pull request with WordPress Playground](${ url }).
`;

	await github.rest.issues.createComment( commentInfo );
}

module.exports = { run };
