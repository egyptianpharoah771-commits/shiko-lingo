import { useEffect, useState } from "react";
import { getUserId } from "../utils/userIdentity";

export function useFeatureAccess() {
  const userId = getUserId();

  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [packageName, setPackageName] = useState("FREE");

  useEffect(() => {
    const checkSubscription = async () => {
      if (!userId) {
        setIsActive(false);
        setPackageName("FREE");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/check-subscription?uid=${encodeURIComponent(userId)}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          setIsActive(false);
          setPackageName("FREE");
          return;
        }

        const data = await res.json();

        /*
          Expected response shape (robust handling):
          {
            active: boolean,
            package?: string,
            expires_at?: string
          }
        */

        const active = !!data?.active;
        const pkg =
          typeof data?.package === "string" && data.package.trim()
            ? data.package.trim().toUpperCase()
            : active
            ? "PRO"
            : "FREE";

        setIsActive(active);
        setPackageName(pkg);
      } catch {
        setIsActive(false);
        setPackageName("FREE");
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [userId]);

  return {
    canAccess: isActive,
    canGetAIFeedback: isActive,
    requiresUpgrade: !isActive,
    isAuthenticated: !!userId,
    userId,
    loading,
    packageName,
  };
}