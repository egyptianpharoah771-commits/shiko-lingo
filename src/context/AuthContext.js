import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { authenticateWithPi } from "../pi/piAuth";

const AuthContext = createContext();

/* ======================
   Simple & Correct Pi Detection
====================== */
function isPiEnvironment() {
  if (typeof window === "undefined") return false;
  return !!window.Pi;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        /* ======================
           PI BROWSER AUTO AUTH
        ======================= */
        if (isPiEnvironment()) {
          try {
            console.log("🟣 Pi environment detected — starting auto-auth");

            const { uid, accessToken } = await authenticateWithPi();

            if (!uid || !accessToken) {
              throw new Error("PI_AUTH_DATA_MISSING");
            }

            console.log("🟢 Pi authenticated:", uid);

            const response = await fetch("/api/pi/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pi_uid: uid,
                accessToken,
              }),
            });

            if (!response.ok) {
              const errText = await response.text();
              console.error("🔴 /api/pi/auth failed:", errText);
              throw new Error("PI_AUTH_SERVER_FAILED");
            }

            const result = await response.json();

            const { access_token, refresh_token } = result;

            if (!access_token || !refresh_token) {
              throw new Error("INVALID_SESSION_TOKENS");
            }

            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              console.error("🔴 setSession error:", error);
              throw error;
            }

            const { data } = await supabase.auth.getSession();

            if (isMounted) {
              setUser(data.session?.user || null);
              setLoading(false);
            }

            console.log("🟢 Supabase session established");
            return;
          } catch (err) {
            console.error("🔴 PI AUTO AUTH ERROR:", err);
            if (isMounted) {
              setUser(null);
              setLoading(false);
            }
            return;
          }
        }

        /* ======================
           NORMAL BROWSER FLOW
        ======================= */
        const { data } = await supabase.auth.getSession();

        if (isMounted) {
          setUser(data.session?.user || null);
          setLoading(false);
        }
      } catch (err) {
        console.error("🔴 AUTH INIT ERROR:", err);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}