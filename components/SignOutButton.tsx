// components/SignOutButton.tsx
"use client";

import { supabase } from "@/lib/supabase/client";

export default function SignOutButton() {
  return (
    <button className="signout-btn" onClick={() => supabase.auth.signOut()}>
      Sign out
    </button>
  );
}
