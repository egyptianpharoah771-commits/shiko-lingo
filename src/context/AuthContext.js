import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPiBrowser = () => {
    return typeof window !== "undefined" && !!window.Pi;
  };

  /* =========================
     Initialize Session
  ========================= */
  useEffect(() => {
    const initialize = async () => {
      try {
        // ✅ Inside Pi → No auto login, explicit only
        if (isPiBrowser()) {
          setUser(null);
          return;
        }

        // ✅ Outside Pi → Supabase session
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
    if (!isPiBrowser()) {
      throw new Error("Not inside Pi Browser");
    }

    try {
      setLoading(true);

      const auth = await window.Pi.authenticate(["username", "payments"]);

      if (!auth?.user?.uid) {
        throw new Error("Invalid Pi authentication response");
      }

      const piUser = {
        id: auth.user.uid, // 🔥 Unified identity key
        username: auth.user.username,
        provider: "pi",
      };

      setUser(piUser);
      return piUser; // 🔥 Return user directly (no race condition)

    } catch (err) {
      console.error("Pi Login Error:", err);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isPiBrowser()) {
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