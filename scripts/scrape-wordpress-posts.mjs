// Incrementally scrape new posts directly from the live WordPress.com site,
// for when a fresh WXR export isn't available yet. Purely additive: never
// touches existing post files, only adds ones that don't exist yet.
//
// Usage:
//   node scripts/scrape-wordpress-posts.mjs --base https://warlord0blog.wordpress.com [--since 2025-05-01] [--dry-run]
//
// --since   ISO date; only scrape posts published after this (default: the
//           newest pubDatetime already present in src/content/posts).
// --dry-run List what would be scraped without writing anything.
//
// Requires `pandoc` on PATH for HTML -> Markdown conversion.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { parse, serialize } from "parse5";

function parseArgs(argv) {
  const out = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--base") out.base = argv[++i];
    else if (argv[i] === "--since") out.since = argv[++i];
    else if (argv[i] === "--dry-run") out.dryRun = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.base) {
  console.error("Usage: node scripts/scrape-wordpress-posts.mjs --base <site-url> [--since YYYY-MM-DD] [--dry-run]");
  process.exit(1);
}
const BASE = args.base.replace(/\/+$/, "");

// The site's own logo (also WordPress.com's og:image fallback for posts
// without a featured image) -- used as the hero image when a post has none.
const DEFAULT_HERO_IMAGE = "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_OUT_DIR = path.join(PROJECT_ROOT, "src/content/posts");
const MEDIA_OUT_DIR = path.join(PROJECT_ROOT, "public/blog-media");

const sleep = ms => new Promise(r => setTimeout(r, ms));

const decodeEntities = s =>
  String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ");

// --- Minimal parse5 tree helpers ---
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const classes = node => (attr(node, "class") ?? "").split(/\s+/).filter(Boolean);
function* walk(node) {
  if (!node) return;
  yield node;
  for (const child of node.childNodes ?? []) yield* walk(child);
}
const findFirst = (root, pred) => {
  for (const n of walk(root)) if (pred(n)) return n;
  return null;
};
const byClass = (root, cls) => findFirst(root, n => n.tagName && classes(n).includes(cls));
function textContent(node) {
  let s = "";
  for (const n of walk(node)) if (n.nodeName === "#text") s += n.value;
  return s;
}
function innerHtml(node) {
  return (node.childNodes ?? []).map(c => serialize({ childNodes: [c] })).join("");
}

// Jetpack's sharing buttons / Like widget / related-posts block are nested
// *inside* .post-content on this theme -- strip them before conversion.
const JUNK_CLASS_RE = /sharedaddy|jetpack-likes-widget|jp-relatedposts/;
function pruneJunk(node) {
  node.childNodes = (node.childNodes ?? []).filter(c => !(c.tagName && classes(c).some(cl => JUNK_CLASS_RE.test(cl))));
  for (const c of node.childNodes ?? []) pruneJunk(c);
}

// The theme emits a duplicate `class` attribute on <article> (first one is
// just "content-inner"); per the HTML parsing spec the first wins and parse5
// silently drops the second, real one, so read it from the raw markup instead.
function articleClassesFromRawHtml(html) {
  const m = html.match(/<article\b[^>]*>/);
  if (!m) return [];
  return [...m[0].matchAll(/class="([^"]*)"/g)].flatMap(cm => cm[1].split(/\s+/)).filter(Boolean);
}

function preprocessContent(html) {
  let s = html;
  // This theme renders code blocks through CodeMirror, whose live DOM wraps
  // each line in its own <div class="cm-line"> instead of using a literal
  // newline -- pandoc extracts a CodeBlock's text as flat content, so those
  // div boundaries get lost. Turn each line-div into real text + "\n" first.
  s = s.replace(/<div class="cm-line">([\s\S]*?)<\/div>/g, (_, inner) => `${inner}\n`);

  // Pandoc only treats <pre><code>...</code></pre> as a CodeBlock; a bare <pre>
  // gets flattened to a plain paragraph and loses its newlines.
  s = s.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/gi, (whole, attrs, inner) =>
    /<code[\s>]/i.test(inner) ? whole : `<pre${attrs}><code>${inner}</code></pre>`
  );
  return s;
}

function htmlToMarkdown(html) {
  if (!html.trim()) return "";
  return execFileSync("pandoc", ["-f", "html", "-t", "gfm-raw_html", "--wrap=none"], {
    input: html,
    maxBuffer: 20 * 1024 * 1024,
    encoding: "utf8",
  }).trim();
}

const stripHtml = html =>
  decodeEntities(String(html).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const slugify = s =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";

const titleCaseFromSlug = slug =>
  slug
    .split("-")
    .map(w => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

// Download a media URL into public/blog-media/YYYY/MM/name, return the local path.
const downloadedFiles = new Set();
async function localizeMediaUrl(url) {
  const m = url.match(/\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^?]+)/);
  if (!m) return null;
  const [, yyyy, mm, rawName] = m;
  const name = decodeURIComponent(rawName);
  const destRel = `${yyyy}/${mm}/${name}`;
  const destPath = path.join(MEDIA_OUT_DIR, destRel);

  if (!downloadedFiles.has(destRel)) {
    if (!fs.existsSync(destPath)) {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) return null;
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
    }
    downloadedFiles.add(destRel);
  }
  return `/blog-media/${destRel}`;
}

async function localizeMarkdownMedia(md) {
  const matches = [...md.matchAll(/(!?\[[^\]]*\]\()([^)\s]+)(\s*(?:"[^"]*")?\))/g)];
  let out = md;
  for (const match of matches) {
    const [whole, pre, url, post] = match;
    if (!url.includes("/wp-content/uploads/")) continue;
    const local = await localizeMediaUrl(url);
    if (local) out = out.replace(whole, `${pre}${local}${post}`);
  }
  return out;
}

function existingSlugs() {
  return new Set(
    fs.readdirSync(POSTS_OUT_DIR).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""))
  );
}

function currentMaxPubDatetime() {
  let max = null;
  for (const f of fs.readdirSync(POSTS_OUT_DIR)) {
    if (!f.endsWith(".md")) continue;
    const text = fs.readFileSync(path.join(POSTS_OUT_DIR, f), "utf8");
    const m = text.match(/^pubDatetime:\s*([0-9T:.Z-]+)/m);
    if (m) {
      const d = new Date(m[1]);
      if (!max || d > max) max = d;
    }
  }
  return max;
}

async function discoverPostUrls(since) {
  const xml = await fetchText(`${BASE}/sitemap.xml`);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  return locs.filter(url => {
    const m = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/?$/);
    if (!m) return false;
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}`);
    return d > since;
  });
}

async function scrapePost(url) {
  const html = await fetchText(url);
  const doc = parse(html);

  const cats = [];
  const tags = [];
  for (const c of articleClassesFromRawHtml(html)) {
    if (c.startsWith("category-") && c !== "category-uncategorized")
      cats.push(titleCaseFromSlug(c.slice("category-".length)));
    else if (c.startsWith("tag-")) tags.push(titleCaseFromSlug(c.slice("tag-".length)));
  }

  const titleEl = byClass(doc, "post-title");
  const title = decodeEntities(textContent(titleEl).trim());

  const timeEl = findFirst(doc, n => n.tagName === "time" && classes(n).includes("entry-date"));
  const pubDatetime = attr(timeEl, "datetime");

  const contentEl = byClass(doc, "post-content");
  if (contentEl) pruneJunk(contentEl);
  const rawContentHtml = contentEl ? innerHtml(contentEl) : "";

  const ogImageEl = findFirst(doc, n => n.tagName === "meta" && attr(n, "property") === "og:image");
  const ogImage = ogImageEl ? attr(ogImageEl, "content") : null;

  const descEl = findFirst(doc, n => n.tagName === "meta" && attr(n, "name") === "description");
  const description = descEl ? decodeEntities(attr(descEl, "content")).trim() : "";

  const slugMatch = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/?$/);
  const slug = slugMatch ? slugMatch[4] : slugify(title);

  return { slug, title, pubDatetime, rawContentHtml, ogImage, description, cats, tags };
}

async function main() {
  fs.mkdirSync(POSTS_OUT_DIR, { recursive: true });
  fs.mkdirSync(MEDIA_OUT_DIR, { recursive: true });

  const since = args.since ? new Date(args.since) : currentMaxPubDatetime();
  if (!since) {
    console.error("Could not determine a cutoff date; pass --since explicitly.");
    process.exit(1);
  }
  console.log(`Scraping posts published after ${since.toISOString()}`);

  const urls = await discoverPostUrls(since);
  const known = existingSlugs();

  let scraped = 0;
  let skipped = 0;

  for (const url of urls) {
    const slugFromUrl = url.match(/\/([^/]+)\/?$/)[1];
    if (known.has(slugFromUrl)) {
      skipped++;
      continue;
    }

    console.log(`Fetching ${url}`);
    const post = await scrapePost(url);

    if (known.has(post.slug)) {
      skipped++;
      continue;
    }

    const preprocessed = preprocessContent(post.rawContentHtml);
    let markdown = htmlToMarkdown(preprocessed);
    markdown = await localizeMarkdownMedia(markdown);

    let heroImage;
    if (post.ogImage) {
      const local = await localizeMediaUrl(post.ogImage);
      if (local) heroImage = local;
    }
    if (!heroImage) {
      const firstImageMatch = markdown.match(/!\[[^\]]*\]\((\/blog-media\/[^)\s]+)\)/);
      if (firstImageMatch) heroImage = firstImageMatch[1];
    }
    // Site-wide default -- WordPress.com itself falls back to this for
    // og:image when a post has no image of its own, and it's the site's
    // deliberate logo/brand mark, so use it as the hero image fallback too.
    if (!heroImage) heroImage = DEFAULT_HERO_IMAGE;

    const tags = [...new Set([...post.cats, ...post.tags])];
    let description = post.description;
    if (!description) description = stripHtml(preprocessed).slice(0, 155).trim();
    if (!description) description = post.title;

    const fm = {
      pubDatetime: post.pubDatetime,
      title: post.title,
      ...(tags.length ? { tags } : {}),
      ...(heroImage ? { heroImage } : {}),
      description,
    };

    const yamlLines = ["---"];
    for (const [k, v] of Object.entries(fm)) {
      if (Array.isArray(v)) {
        yamlLines.push(`${k}:`);
        for (const item of v) yamlLines.push(`  - ${JSON.stringify(item)}`);
      } else if (typeof v === "string") {
        yamlLines.push(
          k === "pubDatetime" ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`
        );
      }
    }
    yamlLines.push("---", "");

    const fileContent = yamlLines.join("\n") + markdown + "\n";

    if (args.dryRun) {
      console.log(`[dry-run] would write ${post.slug}.md (title: "${post.title}")`);
    } else {
      fs.writeFileSync(path.join(POSTS_OUT_DIR, `${post.slug}.md`), fileContent, "utf8");
      known.add(post.slug);
    }
    scraped++;

    await sleep(400);
  }

  console.log(`Scraped: ${scraped}`);
  console.log(`Skipped (already exist): ${skipped}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
