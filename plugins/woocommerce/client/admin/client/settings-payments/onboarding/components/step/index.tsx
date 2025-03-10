/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { StepContentProps } from '~/settings-payments/onboarding/types';

export default function Step( {
	id,
	children,
	onFinish,
}: {
	id: string;
	children:
		| React.ReactNode
		| ( ( props: StepContentProps ) => React.ReactNode );
	onFinish?: () => void;
} ): React.ReactNode {
	return (
		<div className="settings-payments-onboarding-modal__step" id={ id }>
			{ typeof children === 'function'
				? children( { onFinish } )
				: children }
		</div>
	);
}
