import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPiBrowser = () => {
    return typeof window !== "undefined" && typeof window.Pi !== "undefined";
  };

  /* =========================
     Initialize Session ONCE
  ========================= */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================
     Login with Pi
  ========================= */
  const loginWithPi = async () => {
    if (!isPiBrowser()) return;

    try {
      setLoading(true);

      const auth = await window.Pi.authenticate(["username", "payments"]);

      if (!auth?.user?.uid || !auth?.accessToken) {
        throw new Error("Invalid Pi authentication response");
      }

      const pi_uid = auth.user.uid;

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pi_uid,
          accessToken: auth.accessToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend Pi authentication failed");
      }

      const { access_token, refresh_token } = await response.json();

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) throw error;

      // Wait for onAuthStateChange to set user
    } catch (err) {
      console.error("Pi Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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