/**
 * External dependencies
 */
import { createElement, useMemo } from '@wordpress/element';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { sanitizeHTML } from '../../utils';

type InfoViewProps = {
	text: string;
	className?: string;
	css?: string;
};

export const InfoView = ( { text, className, css = '' }: InfoViewProps ) => {
	const styleObject = useMemo( () => {
		if ( ! css ) {
			return {};
		}

		return Object.fromEntries(
			css
				.split( ';' )
				.filter( ( style ) => style.trim() )
				.map( ( style ) => {
					const [ key, value ] = style
						.split( ':' )
						.map( ( str ) => str.trim() );
					// Convert kebab-case to camelCase
					const camelKey = key.replace( /-./g, ( x ) =>
						x[ 1 ].toUpperCase()
					);
					return [ camelKey, value ];
				} )
		);
	}, [ css ] );

	return (
		<div
			className={ clsx( 'woocommerce-settings-info-view', className ) }
			style={ styleObject }
			dangerouslySetInnerHTML={ {
				__html: sanitizeHTML( text ?? '' ),
			} }
		/>
	);
};
