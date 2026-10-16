import { useCallback } from "react";
import { useSubscription } from "../context/SubscriptionContext";
import { showInterstitialAd } from "../pi/piAds";

/**
 * Returns a function to call right after a lesson is finished.
 * Shows a Pi interstitial for free users only; no-op for subscribers.
 */
export default function useLessonAd() {
  const { isActive } = useSubscription();

  return useCallback(() => {
    // Fire-and-forget so lesson UI is never blocked by the ad call.
    showInterstitialAd({ skip: isActive }).catch(() => {});
  }, [isActive]);
}
