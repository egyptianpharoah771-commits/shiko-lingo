import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

const PI_STORAGE_KEY = "shiko_pi_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPiBrowser = () => {
    return typeof window !== "undefined" && typeof window.Pi !== "undefined";
  };

  /* =========================
     Initialize Session
  ========================= */
  useEffect(() => {
    const initialize = async () => {
      try {
        // 🔵 Inside Pi → use local Pi identity only
        if (isPiBrowser()) {
          const stored = localStorage.getItem(PI_STORAGE_KEY);

          if (stored) {
            setUser(JSON.parse(stored));
          }

          setLoading(false);
          return;
        }

        // 🟢 Outside Pi → use Supabase Auth
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error("Session init error:", err);
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
    if (!isPiBrowser()) return;

    try {
      setLoading(true);

      const auth = await window.Pi.authenticate(["username", "payments"]);

      if (!auth?.user?.uid) {
        throw new Error("Invalid Pi authentication response");
      }

      const piUser = {
        id: auth.user.uid, // 🔥 Pi UID becomes primary ID
        username: auth.user.username,
        provider: "pi",
      };

      localStorage.setItem(PI_STORAGE_KEY, JSON.stringify(piUser));
      setUser(piUser);

    } catch (err) {
      console.error("Pi Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isPiBrowser()) {
      localStorage.removeItem(PI_STORAGE_KEY);
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