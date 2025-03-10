/**
 * External dependencies
 */
import React, { ReactNode } from 'react';

/**
 * Props for the Onboarding Sidebar component.
 */
export interface OnboardingSidebarProps {
	steps: {
		key: string;
		label: string;
		isCompleted?: boolean;
		isActive?: boolean;
		content?: React.ReactNode;
	}[];
}

/**
 * Props for the Onboarding Modal component.
 */
export interface OnboardingModalProps {
	isOpen: boolean;
	setIsOpen: ( isOpen: boolean ) => void;
	children: ReactNode;
}

/**
 * Props for the WooPayments onboarding modal.
 */
export interface WooPaymentsModalProps {
	isOpen: boolean;
	setIsOpen: ( isOpen: boolean ) => void;
	currentStep?: number;
}

/**
 * Sidebar navigation item props
 */
export interface SidebarItemProps {
	label: string;
	isCompleted?: boolean;
	isActive?: boolean;
}