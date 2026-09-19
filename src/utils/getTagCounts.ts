import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";
import { slugifyStr } from "./slugify";

export type TagCount = {
  tag: string;
  tagName: string;
  count: number;
};

/**
 * Counts how many published posts use each tag, sorted alphabetically.
 *
 * - Drafts and scheduled posts are excluded via `postFilter()`
 * - Tags are grouped by slug, matching `getUniqueTags()`, so differently-cased
 *   labels collapse; `tagName` is the first label seen
 * - A post counts once per tag even if it lists the tag twice
 */
export function getTagCounts(posts: CollectionEntry<"posts">[]) {
  const counts = new Map<string, TagCount>();

  for (const post of posts.filter(postFilter)) {
    const seen = new Set<string>();
    for (const tagName of post.data.tags) {
      const tag = slugifyStr(tagName);
      if (seen.has(tag)) continue;
      seen.add(tag);

      const entry = counts.get(tag);
      if (entry) entry.count += 1;
      else counts.set(tag, { tag, tagName, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => a.tag.localeCompare(b.tag));
}
