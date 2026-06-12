// components/Shell.tsx
"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/lib/types";
import Sidebar from "./Sidebar";
import Cover from "./Cover";
import IdentityPage from "./IdentityPage";
import MusePanel from "./MusePanel";
import { museModeFor } from "@/lib/structure";

const BOOK_ID = "__book";

export default function Shell({ initialBook }: { initialBook: Book }) {
  const [book, setBook] = useState<Book>(initialBook);
  const [active, setActive] = useState<string>(BOOK_ID); // "__book" or a leaf id

  // Toggle the Paper (linen) edition by adding `light` to <body>.
  useEffect(() => {
    document.body.classList.toggle("light", book.theme === "paper");
  }, [book.theme]);

  const toggleTheme = () =>
    setBook((b) => ({ ...b, theme: b.theme === "night" ? "paper" : "night" }));

  return (
    <div className="studio">
      <aside className="rail">
        <Sidebar
          book={book}
          active={active}
          onSelect={setActive}
          onOpenBook={() => setActive(BOOK_ID)}
        />
      </aside>

      <main className="center">
        {active === BOOK_ID ? (
          <Cover book={book} onChange={setBook} />
        ) : active === "identity_now" ? (
          <div className="center-inner">
            <IdentityPage book={book} onChange={setBook} />
          </div>
        ) : (
          <div className="center-inner">
            <div className="page-eyebrow">Coming in the port</div>
            <h2 className="page-title">This room isn’t built yet</h2>
            <p className="muse-note">
              The vertical slice is Identity. Once it’s proven end-to-end
              (render → edit → save → Muse), the other sections follow the same
              pattern.
            </p>
          </div>
        )}
      </main>

      <aside className="muse">
        <MusePanel mode={active === BOOK_ID ? "weaver" : museModeFor(active)} onToggleTheme={toggleTheme} theme={book.theme} />
      </aside>
    </div>
  );
}
