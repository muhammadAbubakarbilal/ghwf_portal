/**
 * Returns the base URL for all API calls.
 *
 * - In production (Vercel): NEXT_PUBLIC_API_URL is set to the backend Vercel URL
 *   e.g. https://ghwf-portal-backend.vercel.app
 * - In local dev: falls back to the local uvicorn server
 *
 * Using NEXT_PUBLIC_* makes the value available in the browser bundle at runtime,
 * so no proxy is needed between the two separate Vercel projects.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
