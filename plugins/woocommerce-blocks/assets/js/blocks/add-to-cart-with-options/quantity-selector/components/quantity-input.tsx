export const QuantityInput = ( {
	isSiteEditor,
}: {
	isSiteEditor: boolean;
} ) => {
	return (
		<div className="quantity">
			<input
				style={
					// In the post editor, the editor isn't in an iframe, so WordPress styles are applied. We need to remove them.
					! isSiteEditor
						? {
								backgroundColor: '#ffffff',
								lineHeight: 'normal',
								minHeight: 'unset',
								boxSizing: 'unset',
								borderRadius: 'unset',
						  }
						: {}
				}
				type="number"
				value="1"
				className="input-text qty text"
				readOnly
			/>
		</div>
	);
};
