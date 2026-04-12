import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  isPiAppContext,
  isPiBrowserEnvironment,
} from "../lib/initPi";

const AuthContext = createContext();

const DEV_MODE = process.env.NODE_ENV === "development";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /** Pi Browser UA — session restore uses Pi storage, not “window.Pi exists in Chrome”. */
  const isPiBrowser = () => isPiBrowserEnvironment();

  /** Pi.authenticate / payments — SDK must be ready (Pi Browser + script). */
  const isPiReady = () => isPiAppContext();

  /* =========================
     Initialize Session
  ========================= */
  useEffect(() => {
    const initialize = async () => {
      try {
        // 🔥 0️⃣ Dev Mode Auto Login
        if (DEV_MODE) {
          const devUser = {
            id: "dev-user-001",
            email: "dev@shikolingo.local",
            provider: "dev",
          };
          setUser(devUser);
          return;
        }

        // 1️⃣ Pi Browser: restore Pi session from storage (SDK may still be loading)
        if (isPiBrowserEnvironment()) {
          const stored = localStorage.getItem("shiko_pi_user");

          if (stored) {
            try {
              setUser(JSON.parse(stored));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }

          return;
        }

        // 2️⃣ Outside Pi → Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            provider: "supabase",
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session init error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  /* =========================
     Login with Pi
  ========================= */
  const loginWithPi = async () => {
    if (DEV_MODE) {
      const devUser = {
        id: "dev-user-001",
        email: "dev@shikolingo.local",
        provider: "dev",
      };
      setUser(devUser);
      return devUser;
    }

    if (!isPiAppContext()) {
      throw new Error("Pi SDK not ready — open this app in Pi Browser.");
    }

    try {
      setLoading(true);

      const auth = await window.Pi.authenticate(["username", "payments"]);

      if (!auth?.user?.uid) {
        throw new Error("Invalid Pi authentication response");
      }

      const piUser = {
        id: auth.user.uid,
        username: auth.user.username,
        provider: "pi",
      };

      localStorage.setItem("shiko_pi_user", JSON.stringify(piUser));

      setUser(piUser);
      return piUser;
    } catch (err) {
      console.error("Pi Login Error:", err);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (DEV_MODE) {
      setUser(null);
      return;
    }

    if (isPiBrowserEnvironment()) {
      localStorage.removeItem("shiko_pi_user");
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithPi,
        logout,
        isPiBrowser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


