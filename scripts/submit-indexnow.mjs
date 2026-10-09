#!/usr/bin/env node
/**
 * Submits URLs to IndexNow (Bing, and any other participating search engine)
 * so new or changed posts get crawled without waiting for a routine recrawl.
 *
 * Submit just the post(s) that actually changed:
 *   npm run indexnow -- /posts/some-slug/ [/posts/another-slug/ ...]
 *
 * Or, with no args, fall back to the full live sitemap:
 *   npm run indexnow
 *
 * Key file must already be live at /<key>.txt before this will verify -
 * see public/<key>.txt.
 */

const SITE_URL = "https://stuff-im-up-to.whalesanctuary.co.uk";
const KEY = "2fbd100dc9634b71b33eb04682f5a694";
const HOST = new URL(SITE_URL).host;
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const SITEMAP_URL = `${SITE_URL}/sitemap-0.xml`;

async function getSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    throw new Error(`Couldn't fetch sitemap: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (urls.length === 0) {
    throw new Error("Sitemap fetched but no <loc> entries found - check SITEMAP_URL.");
  }
  return urls;
}

async function submitToIndexNow(urlList) {
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  // IndexNow returns 200 or 202 on success, with an empty body.
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`IndexNow submission failed: ${res.status} ${res.statusText}\n${body}`);
  }
  return res.status;
}

const argUrls = process.argv.slice(2);
const urls = argUrls.length
  ? argUrls.map((path) => new URL(path, SITE_URL).toString())
  : await getSitemapUrls();
console.log(
  argUrls.length ? `Submitting ${urls.length} URL(s) from args` : `Found ${urls.length} URLs in ${SITEMAP_URL}`
);

const status = await submitToIndexNow(urls);
console.log(`Submitted to IndexNow - response ${status}`);
