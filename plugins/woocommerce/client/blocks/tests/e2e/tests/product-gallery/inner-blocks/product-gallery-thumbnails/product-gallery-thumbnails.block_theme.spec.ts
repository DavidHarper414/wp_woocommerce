/**
 * External dependencies
 */
import { test, expect } from '@woocommerce/e2e-utils';

test.describe( 'Product Gallery Thumbnails block', () => {
	test.beforeEach( async ( { admin, editor, requestUtils } ) => {
		const template = await requestUtils.createTemplate( 'wp_template', {
			slug: 'single-product',
			title: 'Custom Single Product',
			content: 'placeholder',
		} );

		await admin.visitSiteEditor( {
			postId: template.id,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await expect( editor.canvas.getByText( 'placeholder' ) ).toBeVisible();

		await editor.insertBlock( {
			name: 'woocommerce/product-gallery',
		} );
	} );

	test( 'renders as expected', async ( { page, editor } ) => {
		await test.step( 'in editor', async () => {
			const productGalleryBlock = editor.canvas.locator(
				'[data-type="woocommerce/product-gallery"]'
			);

			await expect(
				productGalleryBlock.locator(
					'[data-type="woocommerce/product-gallery-thumbnails"]'
				)
			).toBeVisible();

			await expect(
				productGalleryBlock.locator(
					`[data-type="woocommerce/product-gallery-thumbnails"]:left-of(
						[data-type="woocommerce/product-gallery-large-image"]
					)`
				)
			).toBeVisible();

			await editor.saveSiteEditorEntities( {
				isOnlyCurrentEntityDirty: true,
			} );
		} );

		await test.step( 'in frontend', async () => {
			await page.goto( '/product/v-neck-t-shirt/' );
			const productGalleryBlock = page.locator(
				'[data-block-name="woocommerce/product-gallery"]'
			);

			await expect(
				productGalleryBlock.locator(
					'[data-block-name="woocommerce/product-gallery-thumbnails"]'
				)
			).toBeVisible();

			await expect(
				productGalleryBlock.locator(
					`[data-block-name="woocommerce/product-gallery-thumbnails"]:left-of(
						[data-block-name="woocommerce/product-gallery-large-image"]
					)`
				)
			).toBeVisible();
		} );
	} );

	test.describe( 'settings', () => {
		test( 'updates thumbnail size', async ( { page, editor } ) => {
			const thumbnailsBlock =
				editor.canvas.getByLabel( 'Block: Thumbnails' );

			await editor.selectBlocks( thumbnailsBlock );

			await editor.openDocumentSettingsSidebar();
			const thumbnailSizeInput = page
				.getByLabel( 'Editor settings' )
				.getByRole( 'textbox', {
					name: 'Thumbnail Size',
				} );

			await thumbnailSizeInput.fill( '100' );
			await page.keyboard.press( 'Enter' );

			const thumbnailImages = thumbnailsBlock.locator(
				'.wc-block-product-gallery-thumbnails__image'
			);

			await expect( thumbnailImages ).toHaveCount( 4 );
			await expect( thumbnailImages.first() ).toHaveAttribute(
				'width',
				'100'
			);
			await expect( thumbnailImages.first() ).toHaveAttribute(
				'height',
				'100'
			);

			await thumbnailSizeInput.fill( '150' );
			await page.keyboard.press( 'Enter' );

			await expect( thumbnailImages.first() ).toHaveAttribute(
				'width',
				'150'
			);
			await expect( thumbnailImages.first() ).toHaveAttribute(
				'height',
				'150'
			);
		} );

		test( 'respects minimum and maximum values', async ( {
			page,
			editor,
		} ) => {
			const thumbnailsBlock =
				editor.canvas.getByLabel( 'Block: Thumbnails' );

			await editor.selectBlocks( thumbnailsBlock );

			await editor.openDocumentSettingsSidebar();
			const thumbnailSizeInput = page
				.getByLabel( 'Editor settings' )
				.getByRole( 'textbox', {
					name: 'Thumbnail Size',
				} );

			// Test minimum value (10px)
			await thumbnailSizeInput.fill( '5' );
			await page.keyboard.press( 'Enter' );

			const thumbnailImages = thumbnailsBlock.locator(
				'.wc-block-product-gallery-thumbnails__image'
			);

			await expect( thumbnailImages.first() ).toHaveAttribute(
				'width',
				'10'
			);
			await expect( thumbnailImages.first() ).toHaveAttribute(
				'height',
				'10'
			);

			// Test maximum value (300px)
			await thumbnailSizeInput.fill( '350' );
			await page.keyboard.press( 'Enter' );

			await expect( thumbnailImages.first() ).toHaveAttribute(
				'width',
				'300'
			);
			await expect( thumbnailImages.first() ).toHaveAttribute(
				'height',
				'300'
			);
		} );
	} );
} );
