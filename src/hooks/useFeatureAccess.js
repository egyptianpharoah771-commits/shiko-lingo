import { useEffect, useState } from "react";
import { getUserId } from "../utils/userIdentity";

export function useFeatureAccess() {
  const userId = getUserId();
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        if (!userId) {
          setIsPro(false);
          return;
        }

        const res = await fetch(
          `/api/check-subscription?uid=${encodeURIComponent(userId)}`
        );

        const data = await res.json();
        setIsPro(res.ok && data.active);
      } catch {
        setIsPro(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [userId]);

  return {
    canAccess: isPro,
    canGetAIFeedback: isPro,
    requiresUpgrade: !isPro,
    isAuthenticated: !!userId,
    userId,
    loading,
    packageName: isPro ? "PRO" : "FREE",
  };
}
