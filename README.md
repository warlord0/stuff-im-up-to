# Stuff I'm Up To

My personal technical blog — ramblings on Debian/Linux, self-hosting, and whatever I've had to figure out and don't want to forget. Static, ad-free, and deployed on Cloudflare Pages.

Built with [Astro](https://astro.build/) on top of the [AstroPaper](https://github.com/satnaing/astro-paper) theme. Content was migrated over from an old WordPress.com blog; that migration is done and complete, so new posts are just written directly as markdown here.

## 🚀 Project Structure

```bash
/
├── public/
│   ├── blog-media/        # images referenced from posts/pages
│   ├── favicon.svg
│   └── default-og.jpg
├── scripts/
│   └── optimize-images.mjs  # resizes/converts blog-media to WebP (see below)
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

## 🖼️ Image Optimization

New images dropped into `public/blog-media/` (or referenced in a post's `heroImage` frontmatter) should be run through `scripts/optimize-images.mjs`: it resizes them to WebP at sane sizes (max 1200px wide for inline/header use, a 200x200 cropped thumbnail for anything used as a `heroImage`), rewrites the references in `src/content/posts/` and `src/content/pages/`, and deletes the original raw files.

```bash
node scripts/optimize-images.mjs [--dry-run]
```

Safe to re-run any time — already-optimized images are left alone.

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
- **Image optimization** — [sharp](https://sharp.pixelplumbing.com/)

## 📜 License

Site content (blog posts, images) is mine. The underlying [AstroPaper](https://github.com/satnaing/astro-paper) theme code is MIT-licensed, © Sat Naing.
