import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

const PI_STORAGE_KEY = "shiko_pi_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPiBrowser = () => {
    return typeof window !== "undefined" && typeof window.Pi !== "undefined";
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // 🟢 First: Check if we have stored Pi session
        const storedPiUser = localStorage.getItem(PI_STORAGE_KEY);

        if (storedPiUser) {
          const parsed = JSON.parse(storedPiUser);
          setUser(parsed);
          setLoading(false);
          return;
        }

        // 🟡 Otherwise check Supabase session (Chrome flow)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const loginWithPi = async () => {
    if (!isPiBrowser()) {
      console.warn("Pi SDK not available.");
      return;
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

      // 🟢 Persist Pi user locally
      localStorage.setItem(PI_STORAGE_KEY, JSON.stringify(piUser));

      setUser(piUser);
    } catch (error) {
      console.error("Pi Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isPiBrowser()) {
        localStorage.removeItem(PI_STORAGE_KEY);
      } else {
        await supabase.auth.signOut();
      }

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