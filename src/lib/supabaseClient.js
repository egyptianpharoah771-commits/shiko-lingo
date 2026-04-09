import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://nsawwockspgccdglmqjl.supabase.co";

const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "sb_publishable_VGLvp6CQc74Eo41sYYMs8A_ChhlHSZA_YOUR_ANON_KEY_HERE";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase ENV missing");
} else {
  console.log("✅ Supabase connected");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
