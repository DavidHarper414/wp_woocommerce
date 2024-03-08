/**
 * External dependencies
 */
import {
	createSlotFill,
	ToggleControl,
	RadioControl,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { OPTIONS_STORE_NAME } from '@woocommerce/data';
import { withSelect } from '@wordpress/data';
import classNames from 'classnames';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { SETTINGS_SLOT_FILL_CONSTANT } from '../settings/settings-slots';
import './style.scss';

const { Fill } = createSlotFill( SETTINGS_SLOT_FILL_CONSTANT );

const SiteVisibility = ( {
	woocommerce_coming_soon,
	woocommerce_store_pages_only,
	woocommerce_private_link,
	isLoading,
	placeholder = false,
} ) => {
	const [ comingSoon, setComingSoon ] = useState( woocommerce_coming_soon );
	const [ storePagesOnly, setStorePagesOnly ] = useState(
		woocommerce_store_pages_only
	);
	const [ privateLink, setPrivateLink ] = useState(
		woocommerce_private_link
	);

	useEffect( () => {
		setComingSoon( woocommerce_coming_soon );
		setStorePagesOnly( woocommerce_store_pages_only );
		setPrivateLink( woocommerce_private_link );
	}, [
		woocommerce_coming_soon,
		woocommerce_store_pages_only,
		woocommerce_private_link,
	] );

	if ( isLoading ) {
		return (
			<SiteVisibility
				woocommerce_lys_setting_coming_soon={ 'yes' }
				isLoading={ false }
				placeholder={ true }
			/>
		);
	}

	return (
		<div
			className={ classNames( 'site-visibility-settings-slotfill', {
				placeholder,
			} ) }
		>
			<input
				type="hidden"
				value={ comingSoon }
				name="woocommerce_coming_soon"
			/>
			<input
				type="hidden"
				value={ storePagesOnly }
				name="woocommerce_store_pages_only"
			/>
			<input
				type="hidden"
				value={ privateLink }
				name="woocommerce_private_link"
			/>
			<h2>{ __( 'Site Visibility', 'woocommerce' ) }</h2>
			<p className="site-visibility-settings-slotfill-description">
				{ __(
					"Set your site to coming soon or live you're ready to launch",
					'woocommerce'
				) }
			</p>
			<div className="site-visibility-settings-slotfill-section">
				<RadioControl
					onChange={ () => {
						setComingSoon( 'yes' );
					} }
					options={ [
						{
							label: 'Coming soon',
							value: 'yes',
						},
					] }
					selected={ comingSoon }
				/>
				<p className="site-visibility-settings-slotfill-section-description">
					{ __(
						'Your site is hidden from visitors behind a “Coming soon” landing page until it’s ready for viewing. You can customize your “Coming soon” landing page via the Editor.',
						'woocommerce'
					) }
				</p>
				<div
					className={ classNames(
						'site-visibility-settings-slotfill-section-content',
						{
							'is-hidden': comingSoon !== 'yes',
						}
					) }
				>
					<ToggleControl
						label={
							<>
								{ __(
									'Restrict to store pages only',
									'woocommerce'
								) }
								<p>
									{ __(
										'Hide store pages only behind a “Coming soon” page. The rest of your site will remain public.',
										'woocommerce'
									) }
								</p>
							</>
						}
						checked={ storePagesOnly === 'yes' }
						onChange={ () => {
							setStorePagesOnly(
								storePagesOnly === 'yes' ? 'no' : 'yes'
							);
						} }
					/>
					<ToggleControl
						label={
							<>
								{ __(
									'Share your site with a private link',
									'woocommerce'
								) }
								<p>
									{ __(
										'“Coming soon” sites are only visible to Admins and Shop managers. Enable “Share site” to let other users view your site.',
										'woocommerce'
									) }
								</p>
							</>
						}
						checked={ privateLink === 'yes' }
						onChange={ () => {
							setPrivateLink(
								privateLink === 'yes' ? 'no' : 'yes'
							);
						} }
					/>
				</div>
			</div>
			<div className="site-visibility-settings-slotfill-section">
				<RadioControl
					onChange={ () => {
						setComingSoon( 'no' );
					} }
					options={ [
						{
							label: 'Live',
							value: 'no',
						},
					] }
					selected={ comingSoon }
				/>
				<p className="site-visibility-settings-slotfill-section-description">
					{ __( 'Your site is visible to everyone.', 'woocommerce' ) }
				</p>
			</div>
		</div>
	);
};

const SiteVisibilityComponent = compose(
	withSelect( ( select ) => {
		const { getOption, hasFinishedResolution } =
			select( OPTIONS_STORE_NAME );

		return {
			woocommerce_coming_soon: getOption( 'woocommerce_coming_soon' ),
			woocommerce_store_pages_only: getOption(
				'woocommerce_store_pages_only'
			),
			woocommerce_private_link: getOption( 'woocommerce_private_link' ),
			isLoading:
				! hasFinishedResolution( 'getOption', [
					'woocommerce_coming_soon',
				] ) ||
				! hasFinishedResolution( 'getOption', [
					'woocommerce_store_pages_only',
				] ) ||
				! hasFinishedResolution( 'getOption', [
					'woocommerce_private_link',
				] ),
		};
	} )
)( SiteVisibility );

const SiteVisibilitySlotFill = () => {
	return (
		<Fill>
			<SiteVisibilityComponent />
		</Fill>
	);
};

export const registerSiteVisibilitySlotFill = () => {
	registerPlugin( 'woocommerce-admin-site-visibility-settings-slotfill', {
		scope: 'woocommerce-settings',
		render: SiteVisibilitySlotFill,
	} );
};
