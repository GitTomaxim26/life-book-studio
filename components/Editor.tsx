// components/Editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import type { DocJSON } from "@/lib/types";

/**
 * The production editor. Replaces the prototype's contenteditable + hand-rolled
 * word diff. Tracked changes / suggestions get added later as a ProseMirror
 * plugin — do NOT reintroduce the manual LCS diff.
 */
export default function Editor({
  value,
  placeholder,
  onChange,
}: {
  value: DocJSON;
  placeholder?: string;
  onChange: (doc: DocJSON, wordCount: number) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Begin here…" }),
    ],
    content: (value as object) ?? undefined,
    editorProps: { attributes: { class: "tiptap" } },
    immediatelyRender: false, // required for Next SSR
    onUpdate: ({ editor }) => {
      const words = editor.getText().trim();
      onChange(editor.getJSON(), words ? words.split(/\s+/).length : 0);
    },
  });

  // Keep external doc swaps (e.g. loading from Supabase) in sync.
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value as object);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return <EditorContent editor={editor} />;
}
