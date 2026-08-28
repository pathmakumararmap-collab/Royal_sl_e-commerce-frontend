import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes admin-authored rich text (e.g. product descriptions written in
 * the RichTextEditor) before rendering with dangerouslySetInnerHTML.
 * Works both during Next.js SSR and in the browser.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "span", "div",
      "ul", "ol", "li", "h1", "h2", "h3", "h4", "blockquote", "a", "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "style", "width", "height", "class"],
  });
}
