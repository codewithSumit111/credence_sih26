/**
 * Landing Page Configuration
 * SIH26027 — AI-Powered Block Planning
 *
 * "Enter Planning System" navigates to the main app dashboard.
 */

/**
 * Navigate to the planning system (app dashboard).
 */
export const openPrototype = (e?: React.MouseEvent): void => {
  if (e) e.preventDefault();
  window.location.href = '/dashboard';
};

export const isPrototypeConfigured = (): boolean => true;
