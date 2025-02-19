/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { Button, Icon } from '@wordpress/components';
import { check, commentContent, shield, people } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './banner.scss';
import IconWithText from '../icon-with-text/icon-with-text';
import {
	refundPolicyTitle,
	supportTitle,
	paymentTitle,
} from '../footer/footer';

const SLIDES = [
	{ icon: check, title: refundPolicyTitle },
	{ icon: commentContent, title: supportTitle },
	{ icon: shield, title: paymentTitle },
	{ icon: people, title: __( 'Support the ecosystem', 'woocommerce' ) },
];

export default function ProductFeaturedBanner() {
	const [ activeIndex, setActiveIndex ] = useState( 0 );
	const [ isDismissed, setIsDismissed ] = useState( false );

	useEffect( () => {
		const interval = setInterval( () => {
			setActiveIndex( ( prev ) => ( prev + 1 ) % SLIDES.length );
		}, 5000 );

		return () => clearInterval( interval );
	}, [] );

	useEffect( () => {
		const dismissed = localStorage.getItem( 'wc_featuredBannerDismissed' );
		setIsDismissed( dismissed === 'true' );
	}, [] );

	const handleDismiss = () => {
		localStorage.setItem( 'wc_featuredBannerDismissed', 'true' );
		setIsDismissed( true );
	};

	if ( isDismissed ) return null;

	return (
		<div className="woocommerce-marketplace__banner">
			<div className="carousel-container">
				{ SLIDES.map( ( slide, index ) => (
					<div
						key={ index }
						className={ `carousel-slide ${
							index === activeIndex ? 'active' : ''
						}` }
						aria-hidden={ index !== activeIndex }
					>
						<IconWithText
							icon={ slide.icon }
							title={ slide.title }
						/>
					</div>
				) ) }
			</div>
			<Button className="dismiss-button" onClick={ handleDismiss }>
				<Icon icon="no-alt" />
			</Button>
		</div>
	);
}
