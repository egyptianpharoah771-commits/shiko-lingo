import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(null); // null = loading

  useEffect(() => {
    async function checkSubscription() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setIsSubscribed(false);
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("expires_at")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setIsSubscribed(false);
        return;
      }

      const isActive = new Date(data.expires_at) > new Date();
      setIsSubscribed(isActive);
    }

    checkSubscription();
  }, []);

  return { isSubscribed };
}


