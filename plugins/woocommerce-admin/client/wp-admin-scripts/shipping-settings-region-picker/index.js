/**
 * External dependencies
 */
import { render, createRoot } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { RegionPicker } from './region-picker';

const shippingZoneRegionPickerRoot = document.getElementById(
	'wc-shipping-zone-region-picker-root'
);

const options = window.shippingZoneMethodsLocalizeScript?.region_options ?? [];
const initialValues = window.shippingZoneMethodsLocalizeScript?.locations ?? [];

if ( shippingZoneRegionPickerRoot ) {
	if ( createRoot ) {
		createRoot( shippingZoneRegionPickerRoot ).render(
			<RegionPicker options={ options } initialValues={ initialValues } />
		);
	} else {
		render(
			<RegionPicker
				options={ options }
				initialValues={ initialValues }
			/>,
			shippingZoneRegionPickerRoot
		);
	}
}
