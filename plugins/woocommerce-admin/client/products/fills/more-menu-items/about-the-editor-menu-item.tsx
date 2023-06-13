/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuItem } from '@wordpress/components';
import { info, Icon } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { recordEvent } from '@woocommerce/tracks';

/**
 * Internal dependencies
 */
import BlockEditorGuide from '~/products/tour/block-editor/block-editor-guide';

export const AboutTheEditorMenuItem = ( {
	onClose,
}: {
	onClose: () => void;
} ) => {
	const [ isGuideOpen, setIsGuideOpen ] = useState( false );
	return (
		<>
			<MenuItem
				onClick={ () => {
					recordEvent(
						'block_product_editor_about_the_editor_menu_item_clicked'
					);
					setIsGuideOpen( true );
				} }
				icon={ <Icon icon={ info } /> }
				iconPosition="right"
			>
				{ __( 'About the editor…', 'woocommerce' ) }
			</MenuItem>
			{ isGuideOpen && (
				<BlockEditorGuide
					onCloseGuide={ () => {
						setIsGuideOpen( false );
						onClose();
					} }
				/>
			) }
		</>
	);
};
