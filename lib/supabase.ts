import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// True once real Supabase credentials are present. Pages check this and show
// a friendly setup screen instead of crashing when env vars aren't set yet
// (e.g. during `next build` in an environment with no .env.local).
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    realtime: {
      params: {
        eventsPerSecond: 5,
      },
    },
  }
);
