import { getRelativeLocaleUrl } from "astro:i18n";
import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";
import config from "@/config";

// A bare YYYY/MM prefix is used purely to keep src/content/posts/ tidy on
// disk (grouped by publish date) -- it isn't meaningful URL structure like a
// deliberately named subdirectory (e.g. `examples/`) is, so strip it here
// rather than have it leak into every post's URL.
const isYearSegment = (s: string) => /^\d{4}$/.test(s);
const isMonthSegment = (s: string) => /^\d{2}$/.test(s);

function getPostPathSegments(filePath: string | undefined): string[] {
  const segments =
    filePath
      ?.replace(BLOG_PATH, "")
      .split("/")
      .filter(path => path !== "")
      .filter(path => !path.startsWith("_"))
      .slice(0, -1) ?? [];

  const withoutDatePrefix =
    segments.length >= 2 && isYearSegment(segments[0]) && isMonthSegment(segments[1])
      ? segments.slice(2)
      : segments;

  return withoutDatePrefix.map(segment => slugifyStr(segment));
}

function getIdSlug(id: string): string {
  const postId = id.split("/");
  return postId.length > 0 ? String(postId[postId.length - 1]) : id;
}

function getPostSlugPath(id: string, filePath: string | undefined): string {
  const pathSegments = getPostPathSegments(filePath);
  const slug = getIdSlug(id);
  return pathSegments.length > 0
    ? [...pathSegments, slug].join("/")
    : String(slug);
}

/**
 * Returns the slug-only path for use as a route param in `getStaticPaths`.
 * No base prefix, no locale — Astro handles those at a higher level.
 * e.g. `/examples/my-post`
 */
export function getPostSlug(id: string, filePath: string | undefined): string {
  return `/${getPostSlugPath(id, filePath)}`;
}

/**
 * Returns a fully navigable URL for use in `<a href>` and RSS links.
 * Applies both locale routing and the configured Astro base via
 * `getRelativeLocaleUrl`.
 * e.g. `/posts/my-post` or `/en/posts/my-post`
 */
export function getPostUrl(
  id: string,
  filePath: string | undefined,
  locale: string | undefined = config.site.lang
): string {
  return getRelativeLocaleUrl(locale, `posts/${getPostSlugPath(id, filePath)}`);
}
