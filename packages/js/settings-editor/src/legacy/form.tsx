/**
 * External dependencies
 */
import { createElement, useRef } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DataForm } from '@wordpress/dataviews';
import { getNewPath } from '@woocommerce/navigation';

/**
 * Internal dependencies
 */
import { useSettingsForm } from '../hooks/use-settings-form';
import { CustomView } from '../components/custom-view';

export const Form = ( {
	settings,
	settingsData,
	settingsPage,
	activeSection,
}: {
	settings: SettingsField[];
	settingsData: SettingsData;
	settingsPage: SettingsPage;
	activeSection: string;
} ) => {
	const { data, fields, form, updateField } = useSettingsForm( settings );
	const formRef = useRef< HTMLFormElement >( null );

	const getFormData = () => {
		if ( ! formRef.current ) {
			return {};
		}
		const formElements = formRef.current.querySelectorAll<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>( 'input, select, textarea' );

		const formData: Record< string, string > = {};

		formElements.forEach( ( input ) => {
			// Avoid generic Gutenberg input ids. This will require upstream fixes.
			if ( input.id.startsWith( 'inspector-' ) ) {
				return;
			}

			formData[ input.name || input.id ] = input.value;
		} );

		return formData;
	};

	const handleSubmit = async (
		event: React.FormEvent< HTMLFormElement >
	) => {
		event.preventDefault();

		const query: Record< string, string > = {
			page: 'wc-settings',
		};
		if ( settingsPage.slug !== 'general' ) {
			query.tab = settingsPage.slug;
		}
		if ( activeSection !== 'default' ) {
			query.section = activeSection;
		}

		const formData = getFormData();
		formData.save = 'Save changes';
		formData._wpnonce = settingsData._wpnonce;
		formData._w_http_referer = '/wp-admin/' + getNewPath( query );

		const form = new FormData();
		for ( const [ key, value ] of Object.entries( formData ) ) {
			form.append( key, value );
		}

		const response = await fetch(
			`/?rest_route=/wc-admin/settings&${ new URLSearchParams(
				query
			).toString() }`,
			{
				method: 'POST',
				body: form,
				credentials: 'same-origin', // Include cookies for nonce validation
				headers: {
					'X-WP-Nonce': settingsData._wpnonce,
				},
			}
		);

		console.log( response );
	};

	return (
		<form ref={ formRef } id="mainform" onSubmit={ handleSubmit }>
			{ settingsData.start && (
				<CustomView html={ settingsData.start.content } />
			) }
			{ settingsPage.start && (
				<CustomView html={ settingsPage.start.content } />
			) }
			<div className="woocommerce-settings-content">
				<DataForm
					fields={ fields }
					form={ form }
					data={ data }
					onChange={ updateField }
				/>
			</div>
			<div className="woocommerce-settings-content-footer">
				<Button variant="primary" type="submit">
					{ __( 'Save', 'woocommerce' ) }
				</Button>
			</div>
			{ settingsPage.end && (
				<CustomView html={ settingsPage.end.content } />
			) }
		</form>
	);
};
