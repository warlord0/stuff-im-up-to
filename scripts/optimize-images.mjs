// One-off (but safely re-runnable) post-process: resize/convert the images
// already sitting in public/blog-media to WebP at sane sizes, and rewrite the
// references to them in src/content/posts and src/content/pages accordingly.
//
// Unlike the importers, this doesn't touch post text/frontmatter beyond image
// paths -- safe to run regardless of which importer (or manual edit) produced
// a given post.
//
// Usage: node scripts/optimize-images.mjs [--dry-run]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DRY_RUN = process.argv.includes("--dry-run");

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIRS = [
  path.join(PROJECT_ROOT, "src/content/posts"),
  path.join(PROJECT_ROOT, "src/content/pages"),
];

const FULL_WIDTH = 1200; // post header banner / inline body images
const THUMB_SIZE = 200; // Card.astro listing thumbnail (96x96 @ ~2x)
const RAW_EXT_RE = /\.(png|jpe?g)$/i;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const mdFiles = CONTENT_DIRS.flatMap(d => walk(d)).filter(f => f.endsWith(".md"));

// --- Pass 1: find which /blog-media/ raw images are referenced, and how ---
const heroPaths = new Set();
const inlinePaths = new Set();

for (const file of mdFiles) {
  const text = fs.readFileSync(file, "utf8");
  const heroMatch = text.match(/^heroImage:\s*"([^"]+)"/m);
  if (heroMatch && RAW_EXT_RE.test(heroMatch[1])) heroPaths.add(heroMatch[1]);

  const inlineMatches = text.matchAll(/!\[[^\]]*\]\((\/blog-media\/[^)\s]+)\)/g);
  for (const m of inlineMatches) {
    if (RAW_EXT_RE.test(m[1])) inlinePaths.add(m[1]);
  }
}

const allRawPaths = new Set([...heroPaths, ...inlinePaths]);
console.log(`Found ${allRawPaths.size} referenced raw images (${heroPaths.size} used as heroImage).`);

if (allRawPaths.size === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}

// --- Pass 2: convert each referenced raw image, build old -> new path maps ---
const fullPathMap = new Map(); // "/blog-media/.../name.png" -> "/blog-media/.../name.webp"
const thumbPathMap = new Map(); // "/blog-media/.../name.png" -> "/blog-media/.../name-thumb.webp"
let bytesBefore = 0;
let bytesAfter = 0;
const failures = [];

for (const rawUrlPath of allRawPaths) {
  const srcPath = path.join(PROJECT_ROOT, "public", rawUrlPath);
  if (!fs.existsSync(srcPath)) {
    failures.push(`missing on disk: ${rawUrlPath}`);
    continue;
  }
  bytesBefore += fs.statSync(srcPath).size;

  const dir = path.dirname(srcPath);
  const base = path.basename(srcPath).replace(RAW_EXT_RE, "");
  const fullDest = path.join(dir, `${base}.webp`);
  const fullUrlPath = rawUrlPath.replace(RAW_EXT_RE, ".webp");

  if (!DRY_RUN) {
    await sharp(srcPath)
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(fullDest);
  }
  fullPathMap.set(rawUrlPath, fullUrlPath);
  bytesAfter += DRY_RUN ? 0 : fs.statSync(fullDest).size;

  if (heroPaths.has(rawUrlPath)) {
    const thumbDest = path.join(dir, `${base}-thumb.webp`);
    const thumbUrlPath = rawUrlPath.replace(RAW_EXT_RE, "-thumb.webp");
    if (!DRY_RUN) {
      await sharp(srcPath)
        .resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: "cover" })
        .webp({ quality: 82 })
        .toFile(thumbDest);
    }
    thumbPathMap.set(rawUrlPath, thumbUrlPath);
    bytesAfter += DRY_RUN ? 0 : fs.statSync(thumbDest).size;
  }
}

// --- Pass 3: rewrite references in the markdown files ---
let filesUpdated = 0;
if (!DRY_RUN) {
  for (const file of mdFiles) {
    let text = fs.readFileSync(file, "utf8");
    let changed = false;

    const heroMatch = text.match(/^heroImage:\s*"([^"]+)"/m);
    if (heroMatch && fullPathMap.has(heroMatch[1])) {
      const raw = heroMatch[1];
      text = text.replace(
        `heroImage: "${raw}"`,
        `heroImage: "${fullPathMap.get(raw)}"` +
          (thumbPathMap.has(raw) ? `\nheroThumb: "${thumbPathMap.get(raw)}"` : "")
      );
      changed = true;
    }

    for (const [raw, webp] of fullPathMap) {
      if (raw === heroMatch?.[1]) continue; // already handled above
      const before = text;
      text = text.split(`(${raw})`).join(`(${webp})`);
      if (text !== before) changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, text, "utf8");
      filesUpdated++;
    }
  }
}

// --- Pass 4: remove the now-unreferenced raw originals ---
let deleted = 0;
if (!DRY_RUN) {
  for (const rawUrlPath of fullPathMap.keys()) {
    const srcPath = path.join(PROJECT_ROOT, "public", rawUrlPath);
    if (fs.existsSync(srcPath)) {
      fs.unlinkSync(srcPath);
      deleted++;
    }
  }
}

console.log(`${DRY_RUN ? "[dry run] Would convert" : "Converted"}: ${fullPathMap.size} images (${thumbPathMap.size} with a thumbnail variant)`);
console.log(`${DRY_RUN ? "[dry run] Would update" : "Updated"}: ${filesUpdated} markdown files`);
console.log(`${DRY_RUN ? "[dry run] Would delete" : "Deleted"}: ${deleted} raw originals`);
if (!DRY_RUN) {
  console.log(`Size: ${(bytesBefore / 1024).toFixed(0)} KiB -> ${(bytesAfter / 1024).toFixed(0)} KiB`);
}
if (failures.length) {
  console.log("--- failures ---");
  failures.forEach(f => console.log(f));
}
