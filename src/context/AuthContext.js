import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { authenticateWithPi } from "../pi/piAuth";

const AuthContext = createContext();

/* ======================
   Robust Pi Detection
====================== */
function isRealPiBrowser() {
  if (typeof window === "undefined") return false;
  if (!window.Pi) return false;

  // Must be inside real Pi domain
  const host = window.location.hostname;

  const isMinePiDomain =
    host.includes("minepi.com") ||
    host.includes("pi-browser");

  return isMinePiDomain;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        /* ======================
           REAL PI BROWSER FLOW
        ======================= */
        if (isRealPiBrowser()) {
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

            const result = await response.json();

            const { access_token, refresh_token } = result.session;

            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) throw error;

            const { data } = await supabase.auth.getSession();

            if (isMounted) {
              setUser(data.session?.user || null);
              setLoading(false);
            }

            return;
          } catch (err) {
            console.error("PI AUTH ERROR:", err);
            if (isMounted) setLoading(false);
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