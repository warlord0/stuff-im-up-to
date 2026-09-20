/**
 * Tidies text for use in `<meta name="description">` and the Open Graph and
 * Twitter description tags.
 *
 * Many post descriptions were auto-excerpted from the body, so they can hold raw
 * shell snippets such as `curl ... > file`. A literal `<` or `>` inside a
 * `content="..."` attribute is valid HTML, but simple scrapers (link-preview
 * crawlers such as WhatsApp's) can cut the tag at the first `>` and lose the
 * whole description. Remove those characters, and inline-code backticks, so the
 * value stays plain text.
 */
export function cleanMetaDescription(text: string): string {
  return text
    .replace(/`+/g, "")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
