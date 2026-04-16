import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext(null);
const DEV_MODE = process.env.NODE_ENV === "development";

export const SubscriptionProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =========================
     Detect Pi Browser
     Pi Browser userAgent contains "PiBrowser"
  ========================= */
  const isPiBrowser =
    typeof navigator !== "undefined" &&
    typeof navigator.userAgent === "string" &&
    /PiBrowser/i.test(navigator.userAgent);

  useEffect(() => {
    let mounted = true;

    const fetchSubscription = async () => {
      if (authLoading) return;

      /* =========================
         🔓 DEV BYPASS ONLY
         Never auto-unlock in production.
      ========================= */
      if (DEV_MODE && !isPiBrowser) {
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

      /* =========================
         Production logic
         (Pi and non-Pi users must have real subscription)
      ========================= */
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

        const query = supabase
          .from("subscriptions")
          .select("*")
          .eq("uid", user.id)
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const timeoutMs = 15000;
        const { data, error } = await Promise.race([
          query,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Subscription request timed out")),
              timeoutMs
            )
          ),
        ]);

        if (!mounted) return;

        if (error) {
          console.error("Subscription fetch error:", error);
          setSubscription(null);
          setIsActive(false);
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
      } catch (err) {
        console.error("Unexpected subscription error:", err);
        if (mounted) {
          setSubscription(null);
          setIsActive(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSubscription();

    return () => {
      mounted = false;
    };
  }, [user?.id, authLoading, isPiBrowser]);

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


