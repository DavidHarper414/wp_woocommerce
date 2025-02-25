/**
 * External dependencies
 */
import { useProductDataContext } from '@woocommerce/shared-context';
import { Disabled } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { isSiteEditorPage } from '@woocommerce/utils';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { AddToCartButton } from '../../../../atomic/blocks/product-elements/button/components/add-to-cart-button';
import { QuantityInput } from '../../quantity-selector/components/quantity-input';

// @todo add styles so the quantity selector has padding.
const CTA = () => {
	const { product } = useProductDataContext();
	const isSiteEditor = useSelect(
		( select ) => isSiteEditorPage( select( 'core/edit-site' ) ),
		[]
	);
	const {
		has_options: hasOptions,
		is_purchasable: isPurchasable,
		is_in_stock: isInStock,
		sold_individually: soldIndividually,
	} = product;

	if ( ! hasOptions && isPurchasable && isInStock ) {
		if ( soldIndividually ) {
			return (
				<input
					type="checkbox"
					value="1"
					className="wc-grouped-product-add-to-cart-checkbox"
				/>
			);
		}
		return (
			<div className="wc-block-add-to-cart-with-options__quantity-selector wc-block-add-to-cart-with-options__quantity-selector--stepper">
				<QuantityInput isSiteEditor={ isSiteEditor } />
			</div>
		);
	}

	return <AddToCartButton product={ product } />;
};

export default function ProductItemCTAEdit() {
	const blockProps = useBlockProps( {
		className:
			'wc-block-add-to-cart-with-options-grouped-product-selector-item-cta',
	} );

	return (
		<div { ...blockProps }>
			<Disabled>
				<CTA />
			</Disabled>
		</div>
	);
}
