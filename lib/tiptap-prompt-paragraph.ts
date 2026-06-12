import Paragraph from "@tiptap/extension-paragraph";

/** Paragraph with optional `class` / `data-prompt` for guiding scaffold lines. */
export const PromptParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
      "data-prompt": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-prompt"),
        renderHTML: (attributes) => {
          if (!attributes["data-prompt"]) return {};
          return { "data-prompt": attributes["data-prompt"] };
        },
      },
    };
  },
});
