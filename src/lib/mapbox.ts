/**
 * Mapbox public token, read from the build environment (VITE_MAPBOX_TOKEN) so it is never committed.
 * Locally it lives in `.env.local` (gitignored); on a host, set it as an environment variable.
 * It is a public `pk.` token: restrict it to the site's domains in the Mapbox account.
 */
export const MAPBOX_TOKEN: string = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

if (!MAPBOX_TOKEN && import.meta.env.DEV) {
  console.warn("VITE_MAPBOX_TOKEN is not set: add it to .env.local (see .env.local.example). Maps will not load.");
}
