import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { authenticateWithPi } from "../pi/authenticateWithPi"; // عدل المسار حسب مشروعك

const AuthContext = createContext();

function isPiBrowser() {
  return typeof window !== "undefined" && !!window.Pi;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // 🔥 Case 1: Inside Pi Browser
        if (isPiBrowser()) {
          try {
            const { uid, accessToken } = await authenticateWithPi();

            const response = await fetch("/api/pi/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pi_uid: uid,
                accessToken,
              }),
            });

            if (!response.ok) {
              throw new Error("PI_AUTH_SERVER_FAILED");
            }

            const { access_token, refresh_token } =
              await response.json();

            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              throw error;
            }

            const { data } = await supabase.auth.getSession();
            if (isMounted) {
              setUser(data.session?.user || null);
              setLoading(false);
            }

            return;
          } catch (piError) {
            console.error("PI AUTO AUTH FAILED:", piError);
            if (isMounted) setLoading(false);
            return;
          }
        }

        // 🌍 Case 2: Normal Browser (OTP flow)
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setUser(data.session?.user || null);
          setLoading(false);
        }
      } catch (err) {
        console.error("AUTH INIT ERROR:", err);
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setUser(session?.user || null);
        }
      });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔥 OTP LOGIN (Chrome only)
  const login = async (email) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}