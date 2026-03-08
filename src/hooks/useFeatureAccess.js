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
    typeof window !== "undefined" &&
    typeof window.Pi !== "undefined";

  useEffect(() => {
    // 🧪 DEV MODE (any normal browser)
    if (!isPiBrowser) {
      setIsActive(true);
      setPackageName("DEV");
      setLoading(false);
      return;
    }

    // Wait for auth + subscription
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

    // Production logic inside Pi Browser
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