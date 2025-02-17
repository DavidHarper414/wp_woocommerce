/**
 * External dependencies
 */
import { Text } from '@woocommerce/experimental';
import interpolateComponents from '@automattic/interpolate-components';
import { Link } from '@woocommerce/components';
import { getAdminLink } from '@woocommerce/settings';
import { recordEvent } from '@woocommerce/tracks';

interface MarketplaceLinkProps {
	/**
	 * HTML element to use for the Text component
	 */
	as?: string;
	className?: string;
	/**
	 * The complete translatable string that includes {{sbLink}} and {{/sbLink}} placeholders
	 * Example: "Visit the {{sbLink}}Official WooCommerce Marketplace{{/sbLink}} to find more tax solutions"
	 */
	translatedString: string;

	eventName?: string;
	marketplaceUrl: string;
	/**
	 * Optional callback function to be called when the link is clicked
	 * If provided, this will be called instead of the default recordEvent behavior
	 */
	onClickCallback?: () => void;
}

/**
 * A component that renders a link to the WooCommerce Marketplace with tracking.
 */
export const MarketplaceLink: React.FC< MarketplaceLinkProps > = ( {
	as = '',
	className = '',
	translatedString,
	eventName = '',
	marketplaceUrl,
	onClickCallback,
} ) => (
	<Text as={ as } className={ className }>
		{ interpolateComponents( {
			mixedString: translatedString,
			components: {
				sbLink: (
					<Link
						onClick={ () => {
							if ( onClickCallback ) {
								onClickCallback();
							} else {
								recordEvent( eventName );
							}
							window.location.href =
								getAdminLink( marketplaceUrl );
							return false;
						} }
						href=""
						type="wc-admin"
					/>
				),
			},
		} ) }
	</Text>
);
