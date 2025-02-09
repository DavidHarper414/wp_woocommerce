/**
 * Returns an array of allowed block names excluding the specified blocks.
 *
 * @param excludedBlocks Array of block names to exclude from the list.
 * @return Array of allowed block names.
 */
export const getAllowedBlocks = ( excludedBlocks: string[] = [] ) => {
	const allBlocks = window.wp.data.select( 'core/blocks' ).getBlockTypes();

	return allBlocks
		.map( ( block ) => block.name )
		.filter( ( name ) => ! excludedBlocks.includes( name ) );
};
