// lib/supabase/client.ts
// The one Supabase client the app uses. Client-side only.
// Reads the env vars from .env.local (local) and Vercel (production).
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Helps you catch a missing env var immediately instead of a silent failure.
  console.warn(
    "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(url ?? "", key ?? "");
