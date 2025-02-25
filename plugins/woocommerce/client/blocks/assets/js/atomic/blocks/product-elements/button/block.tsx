/**
 * External dependencies
 */
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { useStyleProps } from '@woocommerce/base-hooks';
import {
	useInnerBlockLayoutContext,
	useProductDataContext,
} from '@woocommerce/shared-context';
import { withProductDataContext } from '@woocommerce/shared-hocs';

/**
 * Internal dependencies
 */
import { AddToCartButton } from './components/add-to-cart-button';
import './style.scss';
import type {
	BlockAttributes,
	AddToCartButtonPlaceholderAttributes,
} from './types';

const AddToCartButtonPlaceholder = ( {
	className,
	style,
	isLoading,
}: AddToCartButtonPlaceholderAttributes ): JSX.Element => {
	return (
		<button
			className={ clsx(
				'wp-block-button__link',
				'wp-element-button',
				'add_to_cart_button',
				'wc-block-components-product-button__button',
				{
					'wc-block-components-product-button__button--placeholder':
						isLoading,
				},
				className
			) }
			style={ style }
			disabled={ true }
		>
			{ __( 'Add to cart', 'woocommerce' ) }
		</button>
	);
};

export const Block = ( props: BlockAttributes ): JSX.Element => {
	const { className, textAlign } = props;
	const styleProps = useStyleProps( props );
	const { parentClassName } = useInnerBlockLayoutContext();
	const { isLoading, product } = useProductDataContext();

	return (
		<div
			className={ clsx(
				className,
				'wp-block-button',
				'wc-block-components-product-button',
				{
					[ `${ parentClassName }__product-add-to-cart` ]:
						parentClassName,
					[ `align-${ textAlign }` ]: textAlign,
				}
			) }
		>
			{ product.id ? (
				<AddToCartButton
					product={ product }
					style={ styleProps.style }
					className={ styleProps.className }
				/>
			) : (
				<AddToCartButtonPlaceholder
					style={ styleProps.style }
					className={ styleProps.className }
					isLoading={ isLoading }
				/>
			) }
		</div>
	);
};

export default withProductDataContext( Block );
