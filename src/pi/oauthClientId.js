/**
 * Pi Sign-in — public OAuth client id (not PI_API_KEY).
 *
 * Put the long id from the Developer Portal in PI_OAUTH_CLIENT_ID below,
 * or set REACT_APP_PI_OAUTH_CLIENT_ID on Vercel (same value).
 *
 * Register this exact return URL in the portal Redirect URIs:
 *   https://shikolingo.site/signin/callback
 */
export const PI_OAUTH_CLIENT_ID = (
  process.env.REACT_APP_PI_OAUTH_CLIENT_ID ||
  "jMkHK6EpHXp5QZBSSBN3jDH7be5tX56QNGCVlyLnhTM"
).trim();

export const PI_OAUTH_REDIRECT_PATH = "/signin/callback";

export function getPiOAuthRedirectUri() {
  if (typeof window === "undefined") {
    return `https://shikolingo.site${PI_OAUTH_REDIRECT_PATH}`;
  }
  return `${window.location.origin}${PI_OAUTH_REDIRECT_PATH}`;
}
