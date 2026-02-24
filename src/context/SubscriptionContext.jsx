import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSubscription = async () => {
      if (authLoading) return;

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
          .eq("uid", user.id) // 🔥 Always Pi UID inside Pi
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
  }, [user?.id, authLoading]);

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

export const useSubscriptionContext = () =>
  useContext(SubscriptionContext);