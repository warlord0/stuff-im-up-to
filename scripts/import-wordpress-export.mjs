// Import a WordPress WXR export into src/content/posts, localizing media
// referenced from a WordPress.com media export directory.
//
// Usage:
//   node scripts/import-wordpress-export.mjs --xml <path-to-export.xml> --media <path-to-media-export-dir> [--clean]
//
// --clean   Remove all existing *.md files in src/content/posts first (does
//           not touch public/blog-media, which is safe to re-copy into).
//
// Requires `pandoc` on PATH for HTML -> Markdown conversion.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { XMLParser } from "fast-xml-parser";

function parseArgs(argv) {
  const out = { clean: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--xml") out.xml = argv[++i];
    else if (argv[i] === "--media") out.media = argv[++i];
    else if (argv[i] === "--clean") out.clean = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.xml || !args.media) {
  console.error(
    "Usage: node scripts/import-wordpress-export.mjs --xml <export.xml> --media <media-export-dir> [--clean]"
  );
  process.exit(1);
}

const XML_PATH = path.resolve(args.xml);
const MEDIA_SRC_DIR = path.resolve(args.media);
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_OUT_DIR = path.join(PROJECT_ROOT, "src/content/posts");
const MEDIA_OUT_DIR = path.join(PROJECT_ROOT, "public/blog-media");

if (args.clean) {
  for (const f of fs.readdirSync(POSTS_OUT_DIR).filter(f => f.endsWith(".md"))) {
    fs.unlinkSync(path.join(POSTS_OUT_DIR, f));
  }
}

const raw = fs.readFileSync(XML_PATH, "utf8");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  parseTagValue: false,
  trimValues: false,
});
const doc = parser.parse(raw);
const items = doc.rss.channel.item;

const cdata = v => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && "__cdata" in v) return v.__cdata ?? "";
  return String(v);
};

const asArray = v => (v == null ? [] : Array.isArray(v) ? v : [v]);

// --- Build attachment id -> url map (for featured images) ---
const attachmentUrlById = new Map();
for (const it of items) {
  if (it["wp:post_type"] === "attachment") {
    const id = it["wp:post_id"];
    const url = it["wp:attachment_url"];
    if (id != null && url) attachmentUrlById.set(String(id), String(url));
  }
}

const decodeEntities = s =>
  String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ");

const slugify = s =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";

const stripHtml = html =>
  decodeEntities(String(html).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

// Map a WP media URL to a local /blog-media path, copying the file the first time it's seen.
const copiedFiles = new Set();
const missingFiles = new Set();

function localizeMediaUrl(url) {
  const m = url.match(/files\.wordpress\.com\/(\d{4})\/(\d{2})\/([^?]+)/);
  if (!m) return null;
  const [, yyyy, mm, rawName] = m;
  const decodedName = decodeURIComponent(rawName);

  const candidates = [decodedName];
  const dimStripped = decodedName.replace(/-\d+x\d+(\.\w+)$/, "$1");
  if (dimStripped !== decodedName) candidates.push(dimStripped);

  for (const name of candidates) {
    const srcPath = path.join(MEDIA_SRC_DIR, yyyy, mm, name);
    if (fs.existsSync(srcPath)) {
      const destRel = `${yyyy}/${mm}/${name}`;
      const destPath = path.join(MEDIA_OUT_DIR, destRel);
      if (!copiedFiles.has(destRel)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        copiedFiles.add(destRel);
      }
      return `/blog-media/${destRel}`;
    }
  }
  missingFiles.add(`${yyyy}/${mm}/${decodedName}`);
  return null;
}

// --- Pre-process raw WP content HTML before handing to pandoc ---
function preprocessContent(html) {
  let s = html;

  // Strip the old Sociable/AddToAny "select text to share" leftover widget spans.
  s = s.replace(/<span style="[^"]*z-index:8675309[^"]*">[^<]*<\/span>/g, "");

  // Strip the "read more" marker comment.
  s = s.replace(/<!--more-->/g, "");

  // [code lang=xxx] ... [/code]  ->  <pre><code class="language-xxx">...</code></pre>
  s = s.replace(
    /\[code(?:\s+lang(?:uage)?=["']?([\w-]+)["']?)?\s*\]([\s\S]*?)\[\/code\]/gi,
    (_, lang, body) => `<pre><code class="language-${lang || "text"}">${body}</code></pre>`
  );

  // [caption ...]<img .../> Caption text[/caption] -> keep inner content only.
  s = s.replace(/\[caption[^\]]*\]/gi, "");
  s = s.replace(/\[\/caption\]/gi, "");

  // Bare embed shortcodes like [youtube URL] / [twitter URL] -> plain link text.
  s = s.replace(/\[(youtube|vimeo|twitter)\s+([^\]]+)\]/gi, (_, _t, url) => `<p>${url.trim()}</p>`);

  // Pandoc only treats <pre><code>...</code></pre> as a CodeBlock; a bare <pre>
  // (no inner <code>) gets flattened to a plain paragraph and loses its newlines.
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

// Rewrite markdown image/link refs pointing at WP media into local /blog-media paths.
function localizeMarkdownMedia(md) {
  return md.replace(/(!?\[[^\]]*\]\()([^)\s]+)(\s*(?:"[^"]*")?\))/g, (whole, pre, url, post) => {
    if (!url.includes("files.wordpress.com")) return whole;
    const local = localizeMediaUrl(url);
    return local ? `${pre}${local}${post}` : whole;
  });
}

fs.mkdirSync(POSTS_OUT_DIR, { recursive: true });
fs.mkdirSync(MEDIA_OUT_DIR, { recursive: true });

const usedSlugs = new Set(
  fs.readdirSync(POSTS_OUT_DIR).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""))
);
let converted = 0;
let skipped = 0;
const warnings = [];

for (const it of items) {
  const postType = it["wp:post_type"];
  const status = it["wp:status"];
  if (postType !== "post") continue;
  if (status !== "publish" && status !== "draft") {
    skipped++;
    continue;
  }

  const title = decodeEntities(cdata(it.title) || "Untitled");
  let slug = it["wp:post_name"] ? String(it["wp:post_name"]) : slugify(title);
  slug = slug.trim() || slugify(title);
  if (usedSlugs.has(slug)) {
    let n = 2;
    while (usedSlugs.has(`${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }
  usedSlugs.add(slug);

  const isZeroDate = s => !s || String(s).startsWith("0000");
  const pubRaw = !isZeroDate(it["wp:post_date_gmt"]) ? it["wp:post_date_gmt"] : it["wp:post_date"];
  const modRaw = !isZeroDate(it["wp:post_modified_gmt"]) ? it["wp:post_modified_gmt"] : it["wp:post_modified"];
  const pubDatetime = !isZeroDate(pubRaw) ? `${pubRaw.replace(" ", "T")}Z` : null;
  const modDatetime = !isZeroDate(modRaw) ? `${modRaw.replace(" ", "T")}Z` : null;

  const categories = asArray(it.category)
    .map(c => decodeEntities(typeof c === "object" ? cdata(c) : String(c)))
    .filter(Boolean);
  const tags = [...new Set(categories)];

  const rawContent = cdata(it["content:encoded"]);
  const rawExcerpt = cdata(it["excerpt:encoded"]);

  const preprocessed = preprocessContent(rawContent);
  let markdown;
  try {
    markdown = htmlToMarkdown(preprocessed);
  } catch (err) {
    warnings.push(`pandoc failed for ${slug}: ${err.message}`);
    markdown = stripHtml(preprocessed);
  }
  markdown = localizeMarkdownMedia(markdown);

  let description = stripHtml(rawExcerpt);
  if (!description) {
    description = stripHtml(preprocessed).slice(0, 155).trim();
  }
  if (!description) description = title;

  // Note: deliberately not populating frontmatter `ogImage` here. AstroPaper's
  // content schema types it as `image().or(z.string())`, and the `image()`
  // branch assumes a src/-relative importable asset -- a public/ absolute
  // path (like our localized /blog-media/... URLs) makes Astro's asset
  // pipeline throw ImageNotFound at collection-load time, even though the
  // file is genuinely on disk. AstroPaper's dynamicOgImage feature already
  // auto-generates a title-card social image per post.
  //
  // `heroImage` is a separate, plain-string field (not the `image()` schema
  // helper) used for the post header/listing thumbnail: prefer the WordPress
  // featured image (_thumbnail_id), falling back to the first inline image
  // already localized into the post body.
  let heroImage;
  const postmetas = asArray(it["wp:postmeta"]);
  const thumbMeta = postmetas.find(
    m => (cdata(m["wp:meta_key"]) || m["wp:meta_key"]) === "_thumbnail_id"
  );
  if (thumbMeta) {
    const thumbId = cdata(thumbMeta["wp:meta_value"]) || thumbMeta["wp:meta_value"];
    const attUrl = attachmentUrlById.get(String(thumbId));
    if (attUrl) heroImage = localizeMediaUrl(attUrl) ?? undefined;
  }
  if (!heroImage) {
    const firstImageMatch = markdown.match(/!\[[^\]]*\]\((\/blog-media\/[^)\s]+)/);
    if (firstImageMatch) heroImage = firstImageMatch[1];
  }

  if (!pubDatetime) {
    warnings.push(`no valid pubDatetime for ${slug}, skipping`);
    skipped++;
    continue;
  }

  const fm = {
    pubDatetime,
    ...(modDatetime && modDatetime !== pubDatetime ? { modDatetime } : {}),
    title,
    ...(status === "draft" ? { draft: true } : {}),
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
      // pubDatetime/modDatetime must be unquoted so js-yaml parses them as
      // native timestamp scalars -- Astro's z.date() schema requires that,
      // it does not coerce a quoted ISO string.
      yamlLines.push(
        k === "pubDatetime" || k === "modDatetime" ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`
      );
    } else {
      yamlLines.push(`${k}: ${v}`);
    }
  }
  yamlLines.push("---", "");

  const fileContent = yamlLines.join("\n") + markdown + "\n";
  fs.writeFileSync(path.join(POSTS_OUT_DIR, `${slug}.md`), fileContent, "utf8");
  converted++;
}

console.log(`Converted: ${converted}`);
console.log(`Skipped: ${skipped}`);
console.log(`Media copied: ${copiedFiles.size}`);
console.log(`Media missing (left as remote URL): ${missingFiles.size}`);
if (missingFiles.size) {
  console.log("--- missing media ---");
  [...missingFiles].forEach(f => console.log(f));
}
if (warnings.length) {
  console.log("--- warnings ---");
  warnings.forEach(w => console.log(w));
}
