# WooCommerce Docs Plugin

This is a work-in-progress plugin with the desired goal of consolidating documentation from various sources
into Wordpress posts.

Although this is called WooCommerce Docs, it should be able to be used with any Wordpress site and
a manifest conforming to the data structure (TBD) to create Wordpress posts from Markdown content.

## Development

Set up the monorepo as usual, now from this directory run `pnpm build` to build the webpack assets.
This plugin creates a top level menu called "WooCommerce Docs" that you can navigate to once
you've mounted the plugin in your development environment.

There is a basic script that generates a manifest.json file from a set of example docs. You can run it via:
`pnpm generate-manifest`.

To load the manifest as a source in the plugin go to the plugin page and add a manifest with url:

`http://your-local-wp-host/wp-content/plugins/woocommerce-docs/scripts/manifest.json`
