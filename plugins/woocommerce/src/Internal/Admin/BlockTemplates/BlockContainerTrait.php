<?php

namespace Automattic\WooCommerce\Internal\Admin\BlockTemplates;

use Automattic\WooCommerce\Admin\BlockTemplates\BlockInterface;
use Automattic\WooCommerce\Admin\BlockTemplates\ContainerInterface;

/**
 * Trait for block containers.
 */
trait BlockContainerTrait {
	/**
	 * The inner blocks.
	 *
	 * @var BlockInterface[]
	 */
	private $inner_blocks = [];

	// phpcs doesn't take into account exceptions thrown by called methods.
	// phpcs:disable Squiz.Commenting.FunctionCommentThrowTag.WrongNumber

	/**
	 * Add a block to the block container.
	 *
	 * @param BlockInterface $block The block.
	 *
	 * @throws \ValueError If the block configuration is invalid.
	 * @throws \ValueError If a block with the specified ID already exists in the template.
	 * @throws \UnexpectedValueException If the block container is not the parent of the block.
	 */
	protected function &add_inner_block( BlockInterface $block ): BlockInterface {
		if ( ! $block instanceof BlockInterface ) {
			throw new \UnexpectedValueException( 'The block must return an instance of BlockInterface.' );
		}

		if ( $block->get_parent() !== $this ) {
			throw new \UnexpectedValueException( 'The block container is not the parent of the block.' );
		}

		$root_template = $block->get_root_template();
		$root_template->cache_block( $block );
		$this->inner_blocks[] = &$block;
		return $block;
	}

	// phpcs:enable Squiz.Commenting.FunctionCommentThrowTag.WrongNumber

	/**
	 * Checks if a block is a descendant of the block container.
	 *
	 * @param BlockInterface $block The block.
	 */
	private function is_block_descendant( BlockInterface $block ): bool {
		$parent = $block->get_parent();

		if ( $parent === $this ) {
			return true;
		}

		if ( ! $parent instanceof BlockInterface ) {
			return false;
		}

		return $this->is_block_descendant( $parent );
	}

	/**
	 * Remove a block from the block container.
	 *
	 * @param string $block_id The block ID.
	 *
	 * @throws \UnexpectedValueException If the block container is not an ancestor of the block.
	 */
	public function remove_block( string $block_id ) {
		$root_template = $this->get_root_template();

		$block = $root_template->get_block( $block_id );

		if ( ! $block ) {
			return;
		}

		if ( ! $this->is_block_descendant( $block ) ) {
			throw new \UnexpectedValueException( 'The block container is not an ancestor of the block.' );
		}

		// If the block is a container, remove all of its blocks.
		if ( $block instanceof ContainerInterface ) {
			$block->remove_blocks();
		}

		// Remove block from root template's cache.
		$root_template = $this->get_root_template();
		$root_template->uncache_block( $block->get_id() );

		$parent = $block->get_parent();
		$parent->remove_inner_block( $block );

		// Detach block from parent and root template.
		$block->detach();

	}

	/**
	 * Remove all blocks from the block container.
	 */
	public function remove_blocks() {
		array_map(
			function ( BlockInterface $block ) {
				$this->remove_block( $block->get_id() );
			},
			$this->inner_blocks
		);
	}

	/**
	 * Remove a block from the block container's inner blocks. This is an internal method and should not be called directly
	 * except for from the BlockContainerTrait's remove_block() method.
	 *
	 * @param BlockInterface $block The block.
	 */
	public function remove_inner_block( BlockInterface $block ) {
		$this->inner_blocks = array_filter(
			$this->inner_blocks,
			function ( BlockInterface $inner_block ) use ( $block ) {
				return $inner_block !== $block;
			}
		);
	}



	/**
	 * Get the inner blocks sorted by order.
	 */
	private function get_inner_blocks_sorted_by_order(): array {
		$sorted_inner_blocks = $this->inner_blocks;

		usort(
			$sorted_inner_blocks,
			function( BlockInterface $a, BlockInterface $b ) {
				return $a->get_order() <=> $b->get_order();
			}
		);

		return $sorted_inner_blocks;
	}

	/**
	 * Get the inner blocks as a formatted template.
	 */
	public function get_formatted_template(): array {
		$arr = [
			$this->get_name(),
			$this->get_attributes(),
		];

		$inner_blocks = $this->get_inner_blocks_sorted_by_order();

		if ( ! empty( $inner_blocks ) ) {
			$arr[] = array_map(
				function( BlockInterface $block ) {
					return $block->get_formatted_template();
				},
				$inner_blocks
			);
		}

		return $arr;
	}
}
