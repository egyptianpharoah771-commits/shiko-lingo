import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubscriptionContext } from "../context/SubscriptionContext";
import { isPiProductShell } from "../lib/initPi";

const DEV_MODE = process.env.NODE_ENV === "development";

export function useFeatureAccess() {
  const { user, loading: authLoading } = useAuth();
  const { isActive: subscriptionActive, loading: subscriptionLoading } =
    useSubscriptionContext();

  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [packageName, setPackageName] = useState("FREE");

  const inPiShell = isPiProductShell();

  useEffect(() => {

    /* =========================
       DEV MODE (non Pi browsers)
    ========================= */
    if (DEV_MODE && !inPiShell) {
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
    inPiShell,
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


