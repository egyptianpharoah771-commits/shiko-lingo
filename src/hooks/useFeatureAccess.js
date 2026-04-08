import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubscriptionContext } from "../context/SubscriptionContext";

export function useFeatureAccess() {
  const { user, loading: authLoading } = useAuth();
  const { isActive: subscriptionActive, loading: subscriptionLoading } =
    useSubscriptionContext();

  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [packageName, setPackageName] = useState("FREE");

  const isPiBrowser =
    typeof navigator !== "undefined" &&
    navigator.userAgent.includes("PiBrowser");

  useEffect(() => {

    /* =========================
       DEV MODE (non Pi browsers)
    ========================= */
    if (!isPiBrowser) {
      setIsActive(true);
      setPackageName("DEV");
      setLoading(false);
      return;
    }

    if (authLoading || subscriptionLoading) {
      setLoading(true);
      return;
    }

    if (!user?.id) {
      setIsActive(false);
      setPackageName("FREE");
      setLoading(false);
      return;
    }

    setIsActive(!!subscriptionActive);
    setPackageName(subscriptionActive ? "PREMIUM" : "FREE");
    setLoading(false);

  }, [
    user?.id,
    authLoading,
    subscriptionLoading,
    subscriptionActive,
    isPiBrowser,
  ]);

  return {
    canAccess: isActive,
    canGetAIFeedback: isActive,
    requiresUpgrade: !isActive,
    isAuthenticated: !!user?.id,
    userId: user?.id || "dev-user",
    loading,
    packageName,
  };
}


