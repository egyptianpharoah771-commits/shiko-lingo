import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Detect if running inside Pi Browser
   */
  const isPiBrowser = () => {
    return typeof window !== "undefined" && typeof window.Pi !== "undefined";
  };

  /**
   * Initialize Supabase session (for Chrome / OTP users)
   */
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

  /**
   * Manual Pi Login
   * No auto-execution
   */
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

      console.log("Pi Auth Success:", auth);

      /**
       * IMPORTANT:
       * In stabilization phase we DO NOT:
       * - Call backend
       * - Sync Supabase
       * - Set session
       *
       * We only confirm Pi.authenticate stability.
       */

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

  /**
   * Logout
   */
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
};

export const useAuth = () => useContext(AuthContext);