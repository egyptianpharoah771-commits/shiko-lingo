import { supabase } from "./supabaseClient";

/**
 * Get the currently authenticated user (STRICT)
 * - No fallback
 * - No localStorage
 * - Throws if not authenticated
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error("Auth error: " + error.message);
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  return user;
}

/**
 * Safe version (returns null instead of throwing)
 */
export async function getCurrentUserSafe() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user || null;
}