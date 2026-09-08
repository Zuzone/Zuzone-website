#!/usr/bin/env node
/**
 * Build public/zuthread.json locally with the monid CLI (same normalization as the worker).
 *   node scripts/zuthread-refresh.mjs            # all villages from the live API
 *   node scripts/zuthread-refresh.mjs --handles JoinEdgeCity,ETHChiangmai
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { handlesFromVillages, buildFeed } from "../worker/src/zuthread.mjs";

const only = process.argv.includes("--handles") ? process.argv[process.argv.indexOf("--handles") + 1].split(",") : null;

// Read villages straight from Supabase (the worker's /api cache can lag a few minutes)
const env = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim().replace(/^"|"$/g, "")]; }));
const villages = await (await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/villages?select=id,name,logo_url,twitter_url,created_at&order=created_at.asc`, { headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}` } })).json();
let targets = handlesFromVillages(villages);
if (only) targets = targets.filter((t) => only.map((s) => s.toLowerCase()).includes(t.handle.toLowerCase()));
console.log(`Refreshing ${targets.length} handles: ${targets.map((t) => t.handle).join(", ")}`);

const dir = mkdtempSync(join(tmpdir(), "zuthread-"));
const results = [];
for (const t of targets) {
  const out = join(dir, `${t.handle}.json`);
  try {
    execFileSync("monid", ["run", "-p", "tikhub", "-e", "/api/v1/twitter/web/fetch_user_post_tweet", "--query", JSON.stringify({ screen_name: t.handle }), "-w", "60", "-j", "-o", out], {
      stdio: ["ignore", "ignore", "inherit"],
      env: { ...process.env, NO_COLOR: "1" },
    });
    const output = JSON.parse(readFileSync(out, "utf8"));
    results.push({ ...t, output });
    console.log(`  ${t.handle}: ${output.timeline?.length ?? 0} tweets`);
  } catch (e) {
    results.push({ ...t, output: null, error: String(e.message || e).slice(0, 200) });
    console.log(`  ${t.handle}: FAILED ${String(e.message || e).slice(0, 100)}`);
  }
}
const feed = buildFeed(results);
writeFileSync("public/zuthread.json", JSON.stringify(feed));
console.log(`Wrote public/zuthread.json: ${feed.count} posts from ${feed.sources.filter((s) => !s.error).length}/${feed.sources.length} accounts`);
