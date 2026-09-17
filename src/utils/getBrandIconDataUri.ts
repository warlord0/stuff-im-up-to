import sharp from "sharp";

// Rasterizes public/favicon.svg once per build and caches it as a PNG data
// URI -- Satori's <img> support for raster images is far more reliable than
// its SVG handling, and og.png.ts / posts/[...slug]/index.png.ts both need
// the same brand mark.
//
// Fetched over HTTP (same-origin, like the font files these routes also
// load) rather than read from disk: a filesystem path relative to this
// module works in dev but breaks once Vite bundles this file for production,
// since the bundled output ends up at a different relative depth under dist/.
let cached: string | undefined;

export async function getBrandIconDataUri(base: URL): Promise<string> {
  if (cached) return cached;

  const svg = await fetch(new URL("/favicon.svg", base)).then(res =>
    res.arrayBuffer()
  );
  const png = await sharp(Buffer.from(svg)).resize(200, 200).png().toBuffer();

  cached = `data:image/png;base64,${png.toString("base64")}`;
  return cached;
}
