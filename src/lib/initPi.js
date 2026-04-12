/**
 * Pi Network helpers
 * ------------------
 * Never treat "script loaded" as "inside Pi Browser".
 * Loading pi-sdk.js in Chrome causes postMessage timeouts and breaks auth flow.
 */

let initialized = false;

/** True when running in Pi Browser (user agent). */
export function isPiBrowserEnvironment() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.userAgent === "string" &&
    /PiBrowser/i.test(navigator.userAgent)
  );
}

/** True when the Pi JS API object exists (script executed). */
export function isPiSDKLoaded() {
  return typeof window !== "undefined" && typeof window.Pi !== "undefined";
}

/**
 * Pi Browser with SDK ready — use for Pi.authenticate, Pi.init, payments.
 */
export function isPiAppContext() {
  return isPiBrowserEnvironment() && isPiSDKLoaded();
}

/**
 * Skip email/Supabase gate (Pi product or saved Pi session markers).
 * Do NOT use window.Pi alone — that is true in Chrome if the script was injected.
 */
export function isInsidePiProductFlow() {
  if (typeof window === "undefined") return false;
  if (isPiBrowserEnvironment()) return true;
  try {
    if (localStorage.getItem("pi_uid")) return true;
    if (localStorage.getItem("shiko_pi_user")) return true;
  } catch {
    /* private mode / blocked storage */
  }
  return false;
}

/**
 * @deprecated Use isPiAppContext() for Pi APIs, isInsidePiProductFlow() for auth bypass.
 */
export function isPiAvailable() {
  return isPiAppContext();
}

/**
 * Pi.init() runs once in public/index.html (Pi Browser only).
 * Do not call Pi.init again here — double init breaks messaging in Pi Browser.
 */
export function initPiSDK() {
  if (typeof window === "undefined") return false;
  if (!isPiBrowserEnvironment() || !window.Pi) return false;
  initialized = true;
  return true;
}
