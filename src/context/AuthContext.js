import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  ensurePiSdkReady,
  isPiAppContext,
  isPiProductShell,
} from "../lib/initPi";

const AuthContext = createContext();

const DEV_MODE = process.env.NODE_ENV === "development";

async function waitForPiContext(timeoutMs = 5000, intervalMs = 200) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (isPiAppContext()) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return isPiAppContext();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /** Pi Browser UA — session restore uses Pi storage, not “window.Pi exists in Chrome”. */
  /** True in Pi Browser or Pi-embedded checklist iframe (not plain Chrome). */
  const isPiBrowser = () => isPiProductShell();

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
        if (isPiProductShell()) {
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

    const sdkOk = await ensurePiSdkReady();
    if (!sdkOk) {
      throw new Error(
        "Pi SDK could not load. Open shikolingo.site in Pi Browser and try again."
      );
    }

    if (!isPiAppContext()) {
      const ready = await waitForPiContext(8000, 200);
      if (!ready) {
        throw new Error(
          "Pi SDK is still starting. Wait a few seconds and tap Login again."
        );
      }
    }

    try {
      setLoading(true);

      /* Pi SDK: second arg required when using `payments` scope.
         onIncompletePaymentFound: called when a prior payment was started but
         not completed. We must attempt to complete or cancel it, otherwise Pi
         will block new payments from being created. */
      const handleIncompletePayment = async (incompletePayment) => {
        const pid = incompletePayment?.identifier;
        if (!pid) return;
        console.warn("[Shiko Lingo] Incomplete Pi payment found, resuming:", pid);
        try {
          const res = await fetch("/api/pi-approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: pid }),
          });
          const data = await res.json().catch(() => ({}));
          if (!data?.success) {
            console.warn("[Shiko Lingo] Could not resume incomplete payment:", data);
          }
        } catch (err) {
          console.warn("[Shiko Lingo] Incomplete payment resume failed:", err);
        }
      };

      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        handleIncompletePayment
      );

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

    if (isPiProductShell()) {
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


