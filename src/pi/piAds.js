/**
 * Pi Ad Network helpers (Pi Browser only).
 *
 * Pi Browser preloads ads; we only ask it to show one at natural breaks.
 * Every call is safe outside Pi Browser (resolves to a "skipped" result).
 */

const MIN_GAP_MS = 3 * 60 * 1000; // at most one interstitial every 3 minutes
const LAST_AD_KEY = "shiko_last_interstitial_at";

let adNetworkSupported = null; // cached after first check

function getAds() {
  if (typeof window === "undefined") return null;
  const ads = window.Pi?.Ads;
  if (!ads || typeof ads.showAd !== "function") return null;
  return ads;
}

/** True once Pi Browser reports the ad_network native feature. */
export async function isAdNetworkSupported() {
  if (adNetworkSupported !== null) return adNetworkSupported;
  try {
    if (typeof window.Pi?.nativeFeaturesList !== "function") {
      adNetworkSupported = false;
    } else {
      const features = await window.Pi.nativeFeaturesList();
      adNetworkSupported =
        Array.isArray(features) && features.includes("ad_network");
    }
  } catch {
    adNetworkSupported = false;
  }
  return adNetworkSupported;
}

function recentlyShown() {
  try {
    const last = Number(localStorage.getItem(LAST_AD_KEY) || 0);
    return Date.now() - last < MIN_GAP_MS;
  } catch {
    return false;
  }
}

function rememberShown() {
  try {
    localStorage.setItem(LAST_AD_KEY, String(Date.now()));
  } catch {
    /* storage blocked */
  }
}

/**
 * Show an interstitial at a natural break (e.g. lesson finished).
 * Never throws. Returns a short result string for logging.
 */
export async function showInterstitialAd({ skip = false } = {}) {
  if (skip) return "SKIPPED_SUBSCRIBER";
  const ads = getAds();
  if (!ads) return "NO_PI_ADS";
  if (!(await isAdNetworkSupported())) return "ADS_NOT_SUPPORTED";
  if (recentlyShown()) return "SKIPPED_RECENT";

  try {
    if (typeof ads.isAdReady === "function") {
      const ready = await ads.isAdReady("interstitial");
      if (ready?.ready === false && typeof ads.requestAd === "function") {
        const req = await ads.requestAd("interstitial");
        if (req?.result !== "AD_LOADED") return req?.result || "AD_NOT_LOADED";
      }
    }
    const res = await ads.showAd("interstitial");
    if (res?.result === "AD_CLOSED" || res?.result === "AD_DISPLAYED") {
      rememberShown();
    }
    return res?.result || "UNKNOWN";
  } catch (err) {
    console.warn("[Shiko Lingo] interstitial ad error:", err);
    return "AD_ERROR";
  }
}

/**
 * Show a rewarded ad. Resolves with { rewarded, adId, result }.
 * Caller must verify adId on the backend before granting anything.
 */
export async function showRewardedAd() {
  const ads = getAds();
  if (!ads) return { rewarded: false, result: "NO_PI_ADS" };
  if (!(await isAdNetworkSupported())) {
    return { rewarded: false, result: "ADS_NOT_SUPPORTED" };
  }

  try {
    if (typeof ads.isAdReady === "function") {
      const ready = await ads.isAdReady("rewarded");
      if (ready?.ready === false && typeof ads.requestAd === "function") {
        const req = await ads.requestAd("rewarded");
        if (req?.result !== "AD_LOADED") {
          return { rewarded: false, result: req?.result || "AD_NOT_LOADED" };
        }
      }
    }
    const res = await ads.showAd("rewarded");
    return {
      rewarded: res?.result === "AD_REWARDED",
      adId: res?.adId,
      result: res?.result || "UNKNOWN",
    };
  } catch (err) {
    console.warn("[Shiko Lingo] rewarded ad error:", err);
    return { rewarded: false, result: "AD_ERROR" };
  }
}
