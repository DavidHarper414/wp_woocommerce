/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { StepProps } from '~/settings-payments/onboarding/types';

export default function Step( { id, children }: StepProps ): React.ReactNode {
	return (
		<div className="settings-payments-onboarding-modal__step" id={ id }>
			{ children }
		</div>
	);
}
