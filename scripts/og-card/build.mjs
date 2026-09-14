#!/usr/bin/env node
/**
 * Regenerate public/og.png (the 1200×630 social share card) from the live, visible villages.
 *   node scripts/og-card/build.mjs
 * Needs Google Chrome installed. Pins are placed with the same Web Mercator projection
 * Mapbox's static API uses, so they land on the right cities. They sit under the cream veil,
 * like the map does, so villages in the Americas fade out behind the headline.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const API = process.env.ZUZONE_API || "https://zuzone.boogaav.workers.dev";
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TOKEN = readFileSync("src/pages/Index.tsx", "utf8").match(/pk\.[A-Za-z0-9._-]+/)[0];

const [CLON, CLAT, Z, W, H] = [30, 28, 1.05, 1200, 630];
const scale = 512 * 2 ** Z;
const project = (lon, lat) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return [((lon + 180) / 360) * scale, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale];
};
const [cx, cy] = project(CLON, CLAT);

const { villages } = await (await fetch(`${API}/api/villages.json`)).json();
const pins = villages
  .map((v) => project(v.center[0], v.center[1]))
  .map(([x, y]) => [x - cx + W / 2, y - cy + H / 2])
  .filter(([x, y]) => x > -10 && x < W + 10 && y > -10 && y < H + 10);

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:hsl(45 60% 95%);font-family:'DM Sans',sans-serif;color:hsl(150 42% 21%)}
.bg{position:absolute;inset:0;background:url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${CLON},${CLAT},${Z},0/${W}x${H}@2x?access_token=${TOKEN}') center/cover no-repeat;opacity:.9}
.veil{position:absolute;inset:0;background:linear-gradient(90deg,hsl(45 60% 95%) 0%,hsl(45 60% 95% / .92) 42%,hsl(45 60% 95% / .35) 70%,hsl(45 60% 95% / 0) 100%)}
.wrap{position:absolute;left:72px;top:0;height:${H}px;display:flex;flex-direction:column;justify-content:center;width:640px}
h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:104px;line-height:1;margin:0 0 18px;letter-spacing:-1px}
.tag{font-size:30px;line-height:1.3;margin:0 0 34px;max-width:560px}
.tag span{font-size:24px;opacity:.8}
.chips{display:flex;gap:10px;flex-wrap:wrap}
.chip{padding:10px 18px;border-radius:999px;background:hsl(150 42% 21%);color:hsl(45 60% 95%);font-weight:600;font-size:20px}
.chip.alt{background:hsl(54 78% 59% / .55);color:hsl(150 42% 21%)}
.pin{position:absolute;width:14px;height:14px;border-radius:50%;background:hsl(150 42% 21%);box-shadow:0 0 0 5px hsl(54 78% 59% / .55)}
.foot{position:absolute;right:56px;bottom:40px;font-size:22px;font-weight:500;opacity:.75}
</style></head><body>
<div class="bg"></div>
${pins.map(([x, y]) => `<div class="pin" style="left:${Math.round(x - 7)}px;top:${Math.round(y - 7)}px"></div>`).join("")}
<div class="veil"></div>
<div class="wrap">
 <h1>Zuzone</h1>
 <p class="tag">The home for permanent hubs and pop-up cities.<br><span>${villages.length} villages on one globe.</span></p>
 <div class="chips"><span class="chip">Globe</span><span class="chip">Timeline</span><span class="chip">Residents</span><span class="chip alt">Calendar feed</span></div>
</div>
<div class="foot">${new URL(API).host}</div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), "og-card-"));
const page = join(dir, "card.html");
const shot = join(dir, "og.png");
writeFileSync(page, html);
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--screenshot=${shot}`, `--window-size=${W},${H}`, "--virtual-time-budget=10000", `file://${page}`], { stdio: "ignore" });

// Never overwrite the real card with a failed render (an error page is a few KB)
const size = statSync(shot, { throwIfNoEntry: false })?.size ?? 0;
if (size < 100_000) {
  console.error(`Render looks broken (${size} bytes), public/og.png left untouched. Preview: ${page}`);
  process.exit(1);
}
copyFileSync(shot, "public/og.png");
console.log(`public/og.png: ${villages.length} villages, ${pins.length} pins, ${Math.round(size / 1024)} KB`);
