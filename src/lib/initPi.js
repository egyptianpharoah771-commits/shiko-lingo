/**
 * Pi Network helpers
 * ------------------
 * Never treat "script loaded" as "inside Pi Browser".
 * Loading pi-sdk.js in normal Chrome (top-level) causes postMessage timeouts; we
 * only auto-load in Pi Browser or a Pi-controlled iframe (e.g. develop.pi).
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

/**
 * Developer checklist / PiNet may embed the app in an iframe without "PiBrowser"
 * in the child frame's user agent. Only treat as trusted when the referrer is Pi.
 */
export function isPiEmbeddedTrusted() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  try {
    if (window.self === window.top) return false;
    const ref = (document.referrer || "").toLowerCase();
    return (
      ref.includes("minepi.com") ||
      ref.includes("develop.pi") ||
      ref.includes("socialchain.app") ||
      ref.includes("pi-apps") ||
      ref.includes("pinet.com") ||
      ref.includes("wallet.pi") ||
      ref === "" /* some Pi shells send no referrer */
    );
  } catch {
    return false;
  }
}

/** Pi Browser or Pi-controlled embedded shell (SDK allowed here). */
export function isPiProductShell() {
  return isPiBrowserEnvironment() || isPiEmbeddedTrusted();
}

/** True when the Pi JS API object exists (script executed). */
export function isPiSDKLoaded() {
  return typeof window !== "undefined" && typeof window.Pi !== "undefined";
}

/**
 * Pi Browser with SDK ready — use for Pi.authenticate, Pi.init, payments.
 */
export function isPiAppContext() {
  return isPiProductShell() && isPiSDKLoaded();
}

/** True when running on the production domain (not localhost). */
function isProductionDomain() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

/**
 * Wait for / inject Pi SDK once (safe for iframe checklist flows).
 * On production, we always attempt to load — Pi Browser variants and PiNet
 * iframes may not pass the user-agent or referrer checks reliably.
 */
export function ensurePiSdkReady() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof window.Pi !== "undefined") return Promise.resolve(true);
  /* On production domain always attempt to load; on localhost require Pi shell. */
  if (!isPiProductShell() && !isProductionDomain()) return Promise.resolve(false);

  const existing = document.querySelector(
    'script[src*="sdk.minepi.com/pi-sdk"], script[src*="minepi.com/pi-sdk"]'
  );

  if (existing) {
    return new Promise((resolve) => {
      const deadline = Date.now() + 12000;
      const tick = setInterval(() => {
        if (typeof window.Pi !== "undefined") {
          clearInterval(tick);
          resolve(true);
        } else if (Date.now() > deadline) {
          clearInterval(tick);
          resolve(false);
        }
      }, 100);
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;
    script.onload = () => {
      try {
        if (window.Pi) {
          window.Pi.init({ version: "2.0", sandbox: false });
        }
      } catch (e) {
        console.warn("Pi.init error:", e);
      }
      resolve(typeof window.Pi !== "undefined");
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Skip email/Supabase gate (Pi product or saved Pi session markers).
 * Do NOT use window.Pi alone — that is true in Chrome if the script was injected.
 */
export function isInsidePiProductFlow() {
  if (typeof window === "undefined") return false;
  if (isPiProductShell()) return true;
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
  if (!isPiProductShell() || !window.Pi) return false;
  initialized = true;
  return true;
}
