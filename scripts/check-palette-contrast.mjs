// WCAG AA contrast audit for the Palette Maker's recipes
// (src/components/PaletteMaker.astro). Sweeps every recipe across a spread
// of base hues/saturations/lightnesses and checks the on-screen text/bg
// pairs that appear in the mock preview.
//
// NOTE: this duplicates the colour maths and recipes from PaletteMaker.astro
// rather than importing them (the component's inline script isn't easily
// importable standalone). If the recipes change there, update the copy here
// too, or this check stops meaning anything.
//
// Usage: node scripts/check-palette-contrast.mjs
const lin = c => (c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
const gam = c => (c <= .0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - .055);
function hexToOklch(hex) {
  const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  const L = .2104542553 * l + .793617785 * m - .0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s;
  const bb = .0259040371 * l + .7827717662 * m - .808675766 * s;
  return { L, C: Math.hypot(a, bb), h: (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360 };
}
function rgbOf({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s];
}
function oklchToHex(c) {
  c = { ...c };
  while (rgbOf(c).some(v => v < -.001 || v > 1.001) && c.C > 0) c.C -= .005; // ponytail: clip-by-chroma gamut mapping, fine for UI colours
  return "#" + rgbOf(c).map(v => Math.round(Math.min(1, Math.max(0, gam(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, "0")).join("");
}
const lum = hex => { const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255)); return .2126 * r + .7152 * g + .0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const onColour = bg => (contrast(bg, "#ffffff") >= contrast(bg, "#111111") ? "#ffffff" : "#111111");

const wrap = h => ((h % 360) + 360) % 360;
const recipes = {
  Calm: ({ L, C, h }) => ({ primary: { L: Math.min(L, .5), C, h }, accent: { L: .62, C: .07, h: wrap(h + 35) }, bg: { L: .97, C: .01, h }, surface: { L: .93, C: .02, h }, text: { L: .25, C: .03, h } }),
  Warm: ({ L, C, h }) => ({ primary: { L: Math.min(L, .5), C, h }, accent: { L: .72, C: .12, h: 65 }, bg: { L: .97, C: .02, h: 85 }, surface: { L: .93, C: .03, h: 80 }, text: { L: .25, C: .03, h } }),
  Bold: ({ L, C, h }) => ({ primary: { L: Math.min(L, .5), C: Math.max(C, .2), h }, accent: { L: .68, C: .2, h: wrap(h + 180) }, bg: { L: .98, C: .01, h }, surface: { L: 1, C: 0, h }, text: { L: .2, C: .02, h } }),
  Dark: ({ L, C, h }) => ({ primary: { L: Math.max(L, .72), C: Math.min(C, .15), h }, accent: { L: .78, C: .12, h: wrap(h + 180) }, bg: { L: .2, C: .03, h }, surface: { L: .26, C: .035, h }, text: { L: .93, C: .015, h } }),
  Pastel: ({ L, C, h }) => ({ primary: { L: Math.min(L, .5), C: Math.min(C, .1), h }, accent: { L: .85, C: .08, h: wrap(h + 40) }, bg: { L: .98, C: .015, h }, surface: { L: .95, C: .03, h }, text: { L: .35, C: .04, h } }),
  Earthy: ({ L, C, h }) => ({ primary: { L: Math.min(L, .5), C: Math.min(C, .1), h }, accent: { L: .62, C: .11, h: wrap(h > 90 && h < 160 ? 45 : 130) }, bg: { L: .96, C: .02, h: 90 }, surface: { L: .92, C: .03, h: 85 }, text: { L: .27, C: .03, h: 60 } }),
  Monochrome: ({ L, C, h }) => ({ primary: { L: Math.min(L, .5), C, h }, accent: { L: .7, C: C * .7, h: wrap(h + 15) }, bg: { L: .97, C: .008, h }, surface: { L: .93, C: .015, h }, text: { L: .22, C: .02, h } }),
  Neon: ({ L, C, h }) => ({ primary: { L: .75, C: .25, h }, accent: { L: .8, C: .25, h: wrap(h + 150) }, bg: { L: .15, C: .03, h }, surface: { L: .21, C: .05, h }, text: { L: .95, C: .01, h } }),
  Corporate: ({ L, C, h }) => ({ primary: { L: Math.min(L, .5), C: Math.min(C, .14), h }, accent: { L: .6, C: .08, h: wrap(h + 25) }, bg: { L: .98, C: .005, h: 250 }, surface: { L: .95, C: .01, h: 250 }, text: { L: .25, C: .03, h: 250 } }),
  Vintage: ({ L, C, h }) => ({ primary: { L: Math.min(L, .48), C: Math.min(C, .09), h }, accent: { L: .65, C: .09, h: wrap(h + 150) }, bg: { L: .94, C: .03, h: 85 }, surface: { L: .89, C: .04, h: 80 }, text: { L: .3, C: .04, h: 50 } }),
  "High contrast": ({ L, C, h }) => ({ primary: { L: Math.min(L, .38), C, h }, accent: { L: .55, C: .2, h: wrap(h + 180) }, bg: { L: 1, C: 0, h }, surface: { L: .95, C: 0, h }, text: { L: 0, C: 0, h } }),
};

function hslHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return "#" + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
}

const AA = 4.5, AA_LARGE = 3.0;
const checks = [
  ["text/bg", "text", "bg", AA],
  ["text/surface", "text", "surface", AA],
  ["onPrimary/primary (button text)", "onPrimary", "primary", AA],
  ["onAccent/accent (tag text)", "onAccent", "accent", AA],
  ["primary/bg", "primary", "bg", AA_LARGE], // used decoratively (brand text), large-text threshold
];

const hues = Array.from({ length: 24 }, (_, i) => i * 15);
const sats = [0.3, 0.6, 0.9];
const lights = [0.35, 0.5, 0.65];
const samplesPerMode = hues.length * sats.length * lights.length;

const fails = {};
for (const modeName of Object.keys(recipes)) {
  fails[modeName] = {};
  for (const h of hues) for (const s of sats) for (const l of lights) {
    const baseHex = hslHex(h, s, l);
    const base = hexToOklch(baseHex);
    const raw = recipes[modeName](base);
    const p = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, oklchToHex(v)]));
    p.onPrimary = onColour(p.primary);
    p.onAccent = onColour(p.accent);
    for (const [label, a, b, threshold] of checks) {
      const r = contrast(p[a], p[b]);
      if (r < threshold) {
        fails[modeName][label] = fails[modeName][label] || { count: 0, worst: Infinity, example: null };
        fails[modeName][label].count++;
        if (r < fails[modeName][label].worst) {
          fails[modeName][label].worst = r;
          fails[modeName][label].example = { baseHex, h, s, l };
        }
      }
    }
  }
}

console.log(`Sampled ${samplesPerMode} base colours per mode (${hues.length} hues x ${sats.length} sats x ${lights.length} lightnesses).\n`);
let anyFail = false;
for (const [modeName, byCheck] of Object.entries(fails)) {
  const labels = Object.keys(byCheck);
  if (!labels.length) { console.log(`${modeName}: PASS on all ${samplesPerMode} samples, all checks.`); continue; }
  anyFail = true;
  console.log(`${modeName}: FAILS —`);
  for (const label of labels) {
    const f = byCheck[label];
    console.log(`  ${label}: ${f.count}/${samplesPerMode} samples fail (worst ${f.worst.toFixed(2)}:1, e.g. base ${f.example.baseHex} h=${f.example.h} s=${f.example.s} l=${f.example.l})`);
  }
}
process.exit(anyFail ? 1 : 0);
