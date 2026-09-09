# Stuff I'm Up To

My personal technical blog — ramblings on Debian/Linux, self-hosting, and whatever I've had to figure out and don't want to forget. Static, ad-free, and deployed on Cloudflare Pages.

Built with [Astro](https://astro.build/) on top of the [AstroPaper](https://github.com/satnaing/astro-paper) theme, with content migrated over from an old WordPress.com blog.

## 🚀 Project Structure

```bash
/
├── public/
│   ├── blog-media/        # images localized from the old WordPress export
│   ├── favicon.svg
│   └── default-og.jpg
├── scripts/
│   └── import-wordpress-export.mjs  # WXR -> Markdown importer (see below)
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   │   ├── pages/
│   │   │   └── about.md
│   │   └── posts/         # the actual blog posts
│   ├── i18n/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── config.ts
│   └── content.config.ts
├── astro-paper.config.ts  # site title, theme features, posts-per-page, etc.
└── astro.config.ts        # fonts, markdown/shiki config, integrations
```

## 📥 Importing from WordPress

`scripts/import-wordpress-export.mjs` converts a WordPress WXR export into `src/content/posts/*.md`, localizing any referenced images from a WordPress.com media export directory into `public/blog-media/`. Requires [`pandoc`](https://pandoc.org/) on `PATH` for HTML → Markdown conversion.

```bash
node scripts/import-wordpress-export.mjs --xml <path-to-export.xml> --media <path-to-media-export-dir> [--clean]
```

`--clean` wipes existing `*.md` files in `src/content/posts/` first (media in `public/blog-media/` is left alone and re-copied idempotently). Use this to bring in a newer export later on.

## 👨🏻‍💻 Running Locally

```bash
npm install
npm run dev      # dev server at localhost:4321
```

## 🧞 Commands

| Command             | Action                                                                             |
| :------------------ | :---------------------------------------------------------------------------------- |
| `npm install`       | Installs dependencies                                                             |
| `npm run dev`       | Starts local dev server at `localhost:4321`                                       |
| `npm run build`     | Type-checks, builds the site, runs Pagefind indexing                              |
| `npm run preview`   | Preview the production build locally                                              |
| `npm run sync`      | Generates TypeScript types for content collections                                |
| `npm run lint`      | Lints with ESLint                                                                  |
| `npm run format`    | Formats with Prettier                                                             |
| `npm run astro -- ...` | Run other Astro CLI commands (`astro check`, `astro add`, ...)                 |

## 💻 Tech Stack

- **Framework** — [Astro](https://astro.build/)
- **Theme** — [AstroPaper](https://github.com/satnaing/astro-paper) (MIT-licensed)
- **Styling** — [Tailwind CSS](https://tailwindcss.com/)
- **Static Search** — [Pagefind](https://pagefind.app/)
- **Hosting** — [Cloudflare Pages](https://pages.cloudflare.com/)
- **WordPress import** — [Pandoc](https://pandoc.org/) + [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)

## 📜 License

Site content (blog posts, images) is mine. The underlying [AstroPaper](https://github.com/satnaing/astro-paper) theme code is MIT-licensed, © Sat Naing.
