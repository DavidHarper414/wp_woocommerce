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
	const formRef = useRef( null );

	const getFormData = (): Record< string, string > => {
		if ( ! formRef.current ) {
			return {};
		}

		const formElements = (
			formRef.current as HTMLFormElement
		 ).querySelectorAll( 'input, select, textarea' );

		const data = {};
		formElements.forEach( ( input ) => {
			// Avoid generic Gutenberg input ids. This will require upstream fixes.
			if ( input.id.startsWith( 'inspector-' ) ) {
				return;
			}

			const value = ( input as HTMLInputElement ).value;
			// Need to type data as Record<string, string> to allow string indexing
			( data as Record< string, string > )[
				( input as HTMLInputElement ).name ||
					( input as HTMLInputElement ).id
			] = value;
		} );

		return data;
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		const query: Record< string, string > = {
			page: 'wc-settings',
			tab: settingsPage.slug,
		};
		if ( activeSection !== 'default' ) {
			query.section = activeSection;
		}

		const formData = getFormData();
		formData.save = 'Save changes';
		formData._wpnonce = settingsData._wpnonce;
		formData._w_http_referer = '/wp-admin/' + getNewPath( query );

		// eslint-disable-next-line no-console
		console.log(
			'tab: ',
			settingsPage.slug,
			'section: ',
			activeSection,
			formData
		);
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
				<Button
					variant="primary"
					type="submit"
					className="woocommerce-save-button"
				>
					{ __( 'Save', 'woocommerce' ) }
				</Button>
			</div>
			{ settingsPage.end && (
				<CustomView html={ settingsPage.end.content } />
			) }
		</form>
	);
};
