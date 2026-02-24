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
    let isMounted = true;

    const fetchSubscription = async () => {
      // 🔒 لا تبدأ قبل انتهاء auth
      if (authLoading) {
        return;
      }

      // 🔒 لا يوجد مستخدم
      if (!user?.id) {
        if (isMounted) {
          console.log("🚫 No authenticated user for subscription check");
          setSubscription(null);
          setIsActive(false);
          setLoading(false);
        }
        return;
      }

      // 🔒 ليس مستخدم Pi → لا يوجد اشتراك Pi
      if (!user?.pi_uid) {
        if (isMounted) {
          console.log("🚫 Non-Pi user. Skipping Pi subscription lookup.");
          setSubscription(null);
          setIsActive(false);
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setLoading(true);

        console.log("🔎 Checking subscription for Pi UID:", user.pi_uid);

        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("uid", user.pi_uid) // ✅ Match strictly by Pi UID
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error("❌ Subscription fetch error:", error);
          setSubscription(null);
          setIsActive(false);
          setLoading(false);
          return;
        }

        console.log("📦 Subscription query result:", data);

        if (data) {
          const now = new Date();
          const expires = new Date(data.expires_at);

          console.log("⏳ Subscription expires at:", expires);

          setSubscription(data);
          setIsActive(expires > now);
        } else {
          console.log("⚠️ No subscription row found for UID:", user.pi_uid);
          setSubscription(null);
          setIsActive(false);
        }

        setLoading(false);

      } catch (err) {
        console.error("🔥 Unexpected subscription error:", err);
        if (isMounted) {
          setSubscription(null);
          setIsActive(false);
          setLoading(false);
        }
      }
    };

    fetchSubscription();

    return () => {
      isMounted = false;
    };
  }, [user?.pi_uid, user?.id, authLoading]);

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