// components/Shell.tsx
"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/lib/types";
import Sidebar from "./Sidebar";
import Cover from "./Cover";
import IdentityPage from "./IdentityPage";
import ChapterPage from "./ChapterPage";
import MusePanel from "./MusePanel";
import TopBar from "./TopBar";
import { museModeFor, leafInfo } from "@/lib/structure";
import { CHAPTERS } from "@/lib/chapters";

const BOOK_ID = "__book";

/** A chapter that exists in the book but hasn't been written into yet.
 *  Speaks in the language of the book — never of the build. */
function UnwrittenChapter({ id }: { id: string }) {
  const info = leafInfo(id);
  return (
    <div className="chapter-blank">
      <div className="page-eyebrow">{info?.partLabel ?? "Your book"}</div>
      <h2 className="chapter-blank-title">{info?.title ?? "This chapter"}</h2>
      <p className="chapter-blank-line">
        These pages are still blank. When you’re ready, this chapter is yours to
        begin.
      </p>
    </div>
  );
}

export default function Shell({ initialBook }: { initialBook: Book }) {
  const [book, setBook] = useState<Book>(initialBook);
  const [active, setActive] = useState<string>(BOOK_ID);

  useEffect(() => {
    document.body.classList.toggle("light", book.theme === "paper");
  }, [book.theme]);

  const toggleTheme = () =>
    setBook((b) => ({ ...b, theme: b.theme === "night" ? "paper" : "night" }));

  const chapter = active === BOOK_ID ? null : CHAPTERS[active];

  return (
    <div className="app-frame">
      <TopBar active={active} />
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
            <Cover
              book={book}
              onChange={setBook}
              onOpen={() => setActive("identity_now")}
            />
          ) : active === "identity_now" ? (
            <IdentityPage book={book} onChange={setBook} />
          ) : chapter ? (
            <ChapterPage
              book={book}
              onChange={setBook}
              slug={chapter.slug}
              lede={chapter.lede}
              seed={chapter.seed?.()}
            />
          ) : (
            <div className="center-inner">
              <UnwrittenChapter id={active} />
            </div>
          )}
        </main>

        <aside className="muse">
          <MusePanel
            mode={active === BOOK_ID ? "weaver" : museModeFor(active)}
            onToggleTheme={toggleTheme}
            theme={book.theme}
          />
        </aside>
      </div>
    </div>
  );
}
