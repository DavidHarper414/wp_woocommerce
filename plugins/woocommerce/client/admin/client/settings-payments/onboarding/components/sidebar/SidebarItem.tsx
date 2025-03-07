/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * Sidebar navigation item props
 */
interface SidebarItemProps {
	label: string;
	isCompleted?: boolean;
	isActive?: boolean;
}

/**
 * Sidebar navigation item component
 */
export default function SidebarItem( {
	label,
	isCompleted,
	isActive,
}: SidebarItemProps ): React.ReactNode {
	return (
		<div
			className={ `woopayments_onboarding_modal__sidebar_item ${
				isActive ? 'is-active' : ''
			} ${ isCompleted ? 'is-completed' : '' }` }
		>
			<span className="woopayments_onboarding_modal__sidebar_item_icon">
				{ isCompleted ? (
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M12 18.5C10.2761 18.5 8.62279 17.8152 7.40381 16.5962C6.18482 15.3772 5.5 13.7239 5.5 12C5.5 10.2761 6.18482 8.62279 7.40381 7.40381C8.62279 6.18482 10.2761 5.5 12 5.5C13.7239 5.5 15.3772 6.18482 16.5962 7.40381C17.8152 8.62279 18.5 10.2761 18.5 12C18.5 13.7239 17.8152 15.3772 16.5962 16.5962C15.3772 17.8152 13.7239 18.5 12 18.5ZM4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315C19.1571 7.84344 20 9.87827 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12ZM15.53 10.53L14.47 9.47L11 12.94L9.53 11.47L8.47 12.53L11 15.06L15.53 10.53Z"
							fill="#00A32A"
						/>
					</svg>
				) : (
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M5 17.7C5.4 18.2 5.8 18.6 6.2 18.9L7.3 17.5C6.9 17.2 6.6 16.9 6.3 16.5L5 17.7ZM5 6.3L6.4 7.4C6.7 7 7 6.7 7.4 6.4L6.3 5C5.8 5.4 5.4 5.8 5 6.3ZM5.1 14.1L3.4 14.6C3.6 15.2 3.8 15.7 4.1 16.2L5.6 15.4C5.4 15 5.2 14.6 5.1 14.1ZM4.8 12V11.3L3 11.1V12.9L4.7 12.7C4.8 12.5 4.8 12.2 4.8 12ZM7.8 19.9C8.3 20.2 8.9 20.4 9.4 20.6L9.9 18.9C9.4 18.8 9 18.6 8.6 18.4L7.8 19.9ZM19 6.3C18.6 5.8 18.2 5.4 17.8 5.1L16.7 6.5C17.1 6.8 17.4 7.1 17.7 7.5L19 6.3ZM18.9 9.9L20.6 9.4C20.4 8.8 20.2 8.3 19.9 7.8L18.4 8.6C18.6 9 18.8 9.4 18.9 9.9ZM5.6 8.6L4.1 7.8C3.8 8.3 3.6 8.8 3.4 9.4L5.1 9.9C5.2 9.4 5.4 9 5.6 8.6ZM7.8 4.1L8.6 5.6C9 5.4 9.4 5.2 9.9 5.1L9.4 3.4C8.8 3.6 8.3 3.8 7.8 4.1ZM16.6 17.6L17.7 19C18.2 18.6 18.6 18.2 18.9 17.8L17.5 16.7C17.3 17 17 17.3 16.6 17.6ZM18.4 15.4L19.9 16.2C20.2 15.7 20.4 15.1 20.6 14.6L18.9 14.1C18.8 14.6 18.6 15 18.4 15.4ZM21 11.1L19.3 11.3V12.7L21 12.9V12V11.1ZM11.1 3L11.3 4.7H12.7L12.9 3H11.1ZM14.1 5.1C14.6 5.2 15 5.4 15.4 5.6L16.2 4.1C15.7 3.8 15.1 3.6 14.6 3.4L14.1 5.1ZM12 19.2H11.3L11.1 21H12.9L12.7 19.3C12.5 19.2 12.2 19.2 12 19.2ZM14.1 18.9L14.6 20.6C15.2 20.4 15.7 20.2 16.2 19.9L15.4 18.4C15 18.6 14.6 18.8 14.1 18.9Z"
							fill="#949494"
						/>
					</svg>
				) }
			</span>
			<span className="woopayments_onboarding_modal__sidebar_item_label">
				{ label }
			</span>
		</div>
	);
}
