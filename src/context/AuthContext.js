import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPiBrowser = () => {
    return typeof window !== "undefined" && typeof window.Pi !== "undefined";
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
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

      setUser({
        id: auth.user.uid,
        username: auth.user.username,
        provider: "pi",
      });
    } catch (error) {
      console.error("Pi Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!isPiBrowser()) {
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