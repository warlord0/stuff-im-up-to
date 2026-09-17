import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { fontData, experimental_getFontFileURL } from "astro:assets";
import satori from "satori";
import sharp from "sharp";
import { getFontPathByWeight } from "@/utils/getFontPathByWeight";
import { getPostSlug } from "@/utils/getPostPaths";
import { getBrandIconDataUri } from "@/utils/getBrandIconDataUri";
import config from "@/config";

const ACCENT = "#0d9488";

export async function getStaticPaths() {
  if (!config.features.dynamicOgImage) {
    return [];
  }

  const posts = await getCollection("posts").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map(post => ({
    params: { slug: getPostSlug(post.id, post.filePath) },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props, url }) => {
  if (!config.features.dynamicOgImage) {
    return new Response(null, { status: 404, statusText: "Not found" });
  }

  const fonts = fontData["--font-google-sans-code"];
  const regularFontPath = getFontPathByWeight(fonts, 400);
  const boldFontPath = getFontPathByWeight(fonts, 700);

  if (regularFontPath === undefined || boldFontPath === undefined) {
    throw new Error("Cannot find the font path.");
  }

  const [regularData, boldData, iconDataUri] = await Promise.all([
    fetch(experimental_getFontFileURL(regularFontPath, url)).then(res =>
      res.arrayBuffer()
    ),
    fetch(experimental_getFontFileURL(boldFontPath, url)).then(res =>
      res.arrayBuffer()
    ),
    getBrandIconDataUri(url),
  ]);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          background: ACCENT,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Google Sans Code",
          color: "#ffffff",
          padding: "64px",
        },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "24px" },
              children: [
                {
                  type: "img",
                  props: { src: iconDataUri, width: 72, height: 72 },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: 32, fontWeight: 700 },
                    children: config.site.title,
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", flex: 1 },
              children: {
                type: "p",
                props: {
                  style: {
                    fontSize: 68,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    margin: 0,
                    maxHeight: "100%",
                    overflow: "hidden",
                  },
                  children: props.data.title,
                },
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                fontSize: 28,
                color: "rgba(255,255,255,0.8)",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontWeight: 700 },
                    children: `by ${props.data.author}`,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontWeight: 700 },
                    children: new URL(config.site.url).hostname,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: [
        {
          name: "Google Sans Code",
          data: regularData,
          weight: 400,
          style: "normal",
        },
        {
          name: "Google Sans Code",
          data: boldData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
