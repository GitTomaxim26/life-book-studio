// components/TopBar.tsx
"use client";

import { leafInfo } from "@/lib/structure";
import SignOutButton from "./SignOutButton";

const BOOK_ID = "__book";

export default function TopBar({ active }: { active: string }) {
  const section =
    active === BOOK_ID ? null : leafInfo(active)?.title ?? null;

  return (
    <header className="topbar">
      <nav className="topbar-crumb" aria-label="You are here">
        <b>Full Life Book</b>
        {section && (
          <>
            <span className="topbar-sep">/</span>
            <span className="topbar-cur">{section}</span>
          </>
        )}
      </nav>
      <div className="topbar-right">
        <SignOutButton />
      </div>
    </header>
  );
}
