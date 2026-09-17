import type { APIRoute } from "astro";
import satori from "satori";
import sharp from "sharp";
import { fontData, experimental_getFontFileURL } from "astro:assets";
import { getFontPathByWeight } from "@/utils/getFontPathByWeight";
import { getBrandIconDataUri } from "@/utils/getBrandIconDataUri";
import config from "@/config";

const ACCENT = "#0d9488";

export const GET: APIRoute = async context => {
  const fonts = fontData["--font-google-sans-code"];
  const regularFontPath = getFontPathByWeight(fonts, 400);
  const boldFontPath = getFontPathByWeight(fonts, 700);

  if (regularFontPath === undefined || boldFontPath === undefined) {
    throw new Error("Cannot find the font path.");
  }

  const [regularData, boldData, iconDataUri] = await Promise.all([
    fetch(experimental_getFontFileURL(regularFontPath, context.url)).then(res =>
      res.arrayBuffer()
    ),
    fetch(experimental_getFontFileURL(boldFontPath, context.url)).then(res =>
      res.arrayBuffer()
    ),
    getBrandIconDataUri(context.url),
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
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Google Sans Code",
          color: "#ffffff",
          padding: "80px",
        },
        children: {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "56px",
            },
            children: [
              {
                type: "img",
                props: { src: iconDataUri, width: 180, height: 180 },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    width: "800px",
                  },
                  children: [
                    {
                      type: "p",
                      props: {
                        style: { fontSize: 72, fontWeight: 700, margin: 0 },
                        children: config.site.title,
                      },
                    },
                    {
                      type: "p",
                      props: {
                        style: {
                          fontSize: 30,
                          margin: 0,
                          marginTop: "16px",
                          color: "rgba(255,255,255,0.85)",
                        },
                        children: config.site.description,
                      },
                    },
                    {
                      type: "p",
                      props: {
                        style: {
                          fontSize: 24,
                          margin: 0,
                          marginTop: "32px",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.7)",
                        },
                        children: new URL(config.site.url).hostname,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
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
