/**
 * External dependencies
 */
import { lazy, Suspense } from '@wordpress/element';
import { loadExperimentAssignment } from '@woocommerce/explat';

/**
 * Internal dependencies
 */
import { EmbeddedBodyProps } from '../embedded-body-layout/embedded-body-props';
import RecommendationsEligibilityWrapper from '../settings-recommendations/recommendations-eligibility-wrapper';

const PaymentRecommendationsChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "payment-recommendations" */ './payment-recommendations'
		)
);

const assignment = await loadExperimentAssignment(
	'woocommerce_payment_settings_2025_v1'
);

export const PaymentRecommendations: React.FC< EmbeddedBodyProps > = ( {
	page,
	tab,
	section,
} ) => {
	if (
		page === 'wc-settings' &&
		tab === 'checkout' &&
		( ! section || section === 'main' ) &&
		( assignment.variationName === 'control' ||
			! window.wcAdminFeatures?.[ 'reactify-classic-payments-settings' ] ) // don't show this on the new payment settings page.
	) {
		return (
			<RecommendationsEligibilityWrapper>
				<Suspense fallback={ null }>
					<PaymentRecommendationsChunk />
				</Suspense>
			</RecommendationsEligibilityWrapper>
		);
	}
	return null;
};
