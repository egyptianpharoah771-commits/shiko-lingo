import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function useFeatureAccess() {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [packageName, setPackageName] = useState("FREE");

  useEffect(() => {
    const checkSubscription = async () => {
      if (authLoading) return;

      if (!user?.id) {
        setIsActive(false);
        setPackageName("FREE");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/check-subscription?uid=${encodeURIComponent(user.id)}`
        );

        if (!res.ok) {
          setIsActive(false);
          setPackageName("FREE");
          setLoading(false);
          return;
        }

        const data = await res.json();

        setIsActive(!!data?.active);
        setPackageName(
          data?.active && data?.plan
            ? data.plan.toUpperCase()
            : "FREE"
        );
      } catch {
        setIsActive(false);
        setPackageName("FREE");
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user?.id, authLoading]);

  return {
    canAccess: isActive,
    canGetAIFeedback: isActive,
    requiresUpgrade: !isActive,
    isAuthenticated: !!user?.id,
    userId: user?.id || null,
    loading,
    packageName,
  };
}