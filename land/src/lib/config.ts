/**
 * KAVACH Platform Configuration
 * SIH26027 — AI-Powered Block Planning
 *
 * Set VITE_PROTOTYPE_URL in your .env file to point to the
 * running Python prototype / login page.
 *
 * Examples:
 *   Streamlit app:  http://localhost:8501
 *   FastAPI login:  http://localhost:8000/login
 *   Flask:          http://localhost:5000
 */
export const PROTOTYPE_LOGIN_URL: string =
  import.meta.env.VITE_PROTOTYPE_URL || '';

/**
 * Returns true if the prototype URL is configured.
 */
export const isPrototypeConfigured = (): boolean =>
  Boolean(PROTOTYPE_LOGIN_URL && PROTOTYPE_LOGIN_URL.trim() !== '');

/**
 * Navigate to the prototype, or show an alert if not configured.
 */
export const openPrototype = (e?: React.MouseEvent): void => {
  if (e) e.preventDefault();

  if (isPrototypeConfigured()) {
    window.open(PROTOTYPE_LOGIN_URL, '_blank', 'noopener,noreferrer');
  } else {
    alert(
      'Prototype URL not configured.\n\n' +
      'Please set VITE_PROTOTYPE_URL in your .env file to the\n' +
      'address where the Python planning system is running.\n\n' +
      'Example: VITE_PROTOTYPE_URL=http://localhost:8501'
    );
  }
};
