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
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setIsActive(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Subscription fetch error:", error);
        setSubscription(null);
        setIsActive(false);
      } else if (data) {
        setSubscription(data);

        const now = new Date();
        const expires = new Date(data.expires_at);

        setIsActive(expires > now);
      } else {
        setSubscription(null);
        setIsActive(false);
      }

      setLoading(false);
    };

    if (!authLoading) {
      fetchSubscription();
    }
  }, [user, authLoading]);

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