import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =========================
     🔓 DEV BYPASS
     Allows full access on localhost only
  ========================= */
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    let mounted = true;

    const fetchSubscription = async () => {
      if (authLoading) return;

      /* 🔥 If development mode → auto unlock */
      if (isDev) {
        if (mounted) {
          setSubscription({
            uid: "dev-user",
            package_name: "DEV",
            expires_at: "2099-01-01",
          });
          setIsActive(true);
          setLoading(false);
        }
        return;
      }

      if (!user?.id) {
        if (mounted) {
          setSubscription(null);
          setIsActive(false);
          setLoading(false);
        }
        return;
      }

      try {
        if (mounted) setLoading(true);

        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("uid", user.id)
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!mounted) return;

        if (error) {
          console.error("Subscription fetch error:", error);
          setSubscription(null);
          setIsActive(false);
          setLoading(false);
          return;
        }

        if (data) {
          const now = new Date();
          const expires = new Date(data.expires_at);

          setSubscription(data);
          setIsActive(expires > now);
        } else {
          setSubscription(null);
          setIsActive(false);
        }

        setLoading(false);
      } catch (err) {
        console.error("Unexpected subscription error:", err);
        if (mounted) {
          setSubscription(null);
          setIsActive(false);
          setLoading(false);
        }
      }
    };

    fetchSubscription();

    return () => {
      mounted = false;
    };
  }, [user?.id, authLoading, isDev]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isActive,
        loading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

/* =========================
   Official Hook
========================= */
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within SubscriptionProvider"
    );
  }
  return context;
};

/* =========================
   Backward Compatibility
========================= */
export const useSubscriptionContext = useSubscription;