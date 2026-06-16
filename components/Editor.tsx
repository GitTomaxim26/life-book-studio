"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect, useMemo, type ReactNode } from "react";
import type { DocJSON } from "@/lib/types";
import { PromptParagraph } from "@/lib/tiptap-prompt-paragraph";
import { isDocEmpty, wordCountFromDoc } from "@/lib/seeds";
import EditorToolbar from "./EditorToolbar";

export default function Editor({
  value,
  placeholder,
  onChange,
  showToolbar = false,
  seed,
  header,
}: {
  value: DocJSON;
  placeholder?: string;
  onChange: (doc: DocJSON, wordCount: number) => void;
  showToolbar?: boolean;
  /** Applied only when `value` is empty — a starting chapter shape, not permanent chrome. */
  seed?: DocJSON;
  header?: ReactNode;
}) {
  const initialContent = useMemo(() => {
    if (seed && isDocEmpty(value)) return seed as object;
    return (value as object) ?? undefined;
  }, [value, seed]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
        heading: { levels: [2] },
      }),
      PromptParagraph,
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "Begin here…" }),
    ],
    content: initialContent,
    editorProps: { attributes: { class: "tiptap" } },
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON() as DocJSON;
      onChange(json, wordCountFromDoc(json));
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (seed && isDocEmpty(value)) {
      editor.commands.setContent(seed as object);
    }
  }, [editor, seed, value]);

  return (
    <div className="doc-page">
      {showToolbar && editor && <EditorToolbar editor={editor} />}
      <div className="doc-scroll">
        <div className="doc-wrap">
          {header}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
