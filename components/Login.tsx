// components/Login.tsx
// Magic-link sign-in. No passwords. Book-native voice.
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const addr = email.trim();
    if (!addr) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-mark" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <h1 className="auth-title">Your Full Life Book</h1>

        {sent ? (
          <>
            <p className="auth-lede">A sign-in link is on its way.</p>
            <p className="auth-quiet">
              Open the email we just sent to <b>{email}</b> and follow the link to
              begin. You can close this tab.
            </p>
          </>
        ) : (
          <>
            <p className="auth-lede">
              Sign in to open your book. Your writing is private to you.
            </p>
            <form onSubmit={sendLink} className="auth-form">
              <input
                className="auth-input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <button className="auth-btn" disabled={busy}>
                {busy ? "Sending…" : "Send me a sign-in link"}
              </button>
            </form>
            {err && <p className="auth-err">{err}</p>}
          </>
        )}
      </div>
    </div>
  );
}
