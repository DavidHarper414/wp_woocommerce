/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { Button, Icon } from '@wordpress/components';
import { recordEvent } from '@woocommerce/tracks';

/**
 * Internal dependencies
 */
import './banner.scss';
import {
	refundPolicyTitle,
	supportTitle,
	paymentTitle,
} from '../footer/footer';
import trustProducts from '../../assets/images/trust-products.svg';
import supportEcosystem from '../../assets/images/support-ecosystem.svg';
import moneyBack from '../../assets/images/money-back.svg';
import getHelp from '../../assets/images/get-help.svg';

const SLIDES = [
	{ imageUrl: moneyBack, title: refundPolicyTitle },
	{ imageUrl: getHelp, title: supportTitle },
	{ imageUrl: trustProducts, title: paymentTitle },
	{
		imageUrl: supportEcosystem,
		title: __( 'Support the ecosystem', 'woocommerce' ),
	},
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

		recordEvent( 'marketplace_features_banner_dismissed', {
			active_slide: activeIndex,
		} );
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
						<img
							src={ slide.imageUrl }
							alt=""
							className="woocommerce-marketplace__banner-image"
						/>
						<h3 className="woocommerce-marketplace__banner-title">
							{ slide.title }
						</h3>
					</div>
				) ) }
			</div>
			<Button className="dismiss-button" onClick={ handleDismiss }>
				<Icon icon="no-alt" />
			</Button>
		</div>
	);
}
