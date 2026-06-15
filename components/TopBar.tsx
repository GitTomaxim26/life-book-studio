// components/TopBar.tsx
"use client";

import { leafInfo } from "@/lib/structure";
import SaveIndicator from "./SaveIndicator";
import SignOutButton from "./SignOutButton";

const BOOK_ID = "__book";
const SETTINGS_ID = "__settings";

export default function TopBar({
  active,
  onOpenSettings,
}: {
  active: string;
  onOpenSettings: () => void;
}) {
  const section =
    active === BOOK_ID
      ? null
      : active === SETTINGS_ID
        ? "Book settings"
        : (leafInfo(active)?.title ?? null);

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
        <SaveIndicator />
        <button
          type="button"
          className="topbar-settings-link"
          onClick={onOpenSettings}
        >
          Book settings
        </button>
        <SignOutButton />
      </div>
    </header>
  );
}
