"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

export default function EditorToolbar({ editor }: { editor: Editor }) {
  const [, bump] = useState(0);

  useEffect(() => {
    const refresh = () => bump((n) => n + 1);
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);
    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
    };
  }, [editor]);

  const blockValue = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("blockquote")
      ? "blockquote"
      : "p";

  const setBlock = (value: string) => {
    const chain = editor.chain().focus();
    if (value === "h2") chain.toggleHeading({ level: 2 }).run();
    else if (value === "blockquote") chain.toggleBlockquote().run();
    else chain.setParagraph().run();
  };

  const toolClass = (active: boolean) => `editor-tool${active ? " on" : ""}`;

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
      <select
        className="editor-tsel"
        value={blockValue}
        onChange={(e) => setBlock(e.target.value)}
        aria-label="Block type"
      >
        <option value="p">Body</option>
        <option value="h2">Heading</option>
        <option value="blockquote">Quote</option>
      </select>
      <span className="editor-tdiv" aria-hidden />
      <button
        type="button"
        className={toolClass(editor.isActive("bold"))}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className={toolClass(editor.isActive("italic"))}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className={toolClass(editor.isActive("underline"))}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className={toolClass(editor.isActive("strike"))}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
      >
        <s>S</s>
      </button>
      <span className="editor-tdiv" aria-hidden />
      <button
        type="button"
        className={toolClass(editor.isActive("bulletList"))}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
      >
        •—
      </button>
      <button
        type="button"
        className={toolClass(editor.isActive("orderedList"))}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Numbered list"
      >
        1.
      </button>
      <span className="editor-tdiv" aria-hidden />
      <button
        type="button"
        className="editor-tool"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
      >
        ↺
      </button>
      <button
        type="button"
        className="editor-tool"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
      >
        ↻
      </button>
    </div>
  );
}
