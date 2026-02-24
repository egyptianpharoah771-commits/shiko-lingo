import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPiBrowser = () => {
    return typeof window !== "undefined" && typeof window.Pi !== "undefined";
  };

  /* =========================
     Initialize Supabase Session
  ========================= */
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
        }

        // Listen for auth changes (important)
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
        });
      } catch (error) {
        console.error("Session initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  /* =========================
     Login with Pi (Bridge to Supabase)
  ========================= */
  const loginWithPi = async () => {
    if (!isPiBrowser()) {
      console.warn("Pi SDK not available.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Authenticate with Pi
      const auth = await window.Pi.authenticate(["username", "payments"]);

      if (!auth?.user?.uid || !auth?.accessToken) {
        throw new Error("Invalid Pi authentication response");
      }

      const pi_uid = auth.user.uid;
      const accessToken = auth.accessToken;

      // 2️⃣ Call backend bridge
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pi_uid,
          accessToken,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Pi backend authentication failed");
      }

      const { access_token, refresh_token } = await response.json();

      if (!access_token || !refresh_token) {
        throw new Error("Invalid Supabase session tokens");
      }

      // 3️⃣ Set Supabase session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw sessionError;
      }

      // 4️⃣ Fetch fresh session user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("Failed to establish Supabase session");
      }

      // Attach pi_uid in memory only (not persistent storage)
      const enrichedUser = {
        ...session.user,
        pi_uid,
        provider: "pi",
      };

      setUser(enrichedUser);
    } catch (error) {
      console.error("Pi Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Logout
  ========================= */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
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