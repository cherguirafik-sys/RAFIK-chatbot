#!/usr/bin/env node
// Sequential full renders. Works on Windows, macOS and Linux (Node only, no bash).
// Usage:   node scripts/render_all.mjs "CompId outname" "CompId2 outname2" ...
//   or:    npm run render -- "CompId outname" ...
// Each MP4 lands in out/<outname>.mp4 as soon as it is done; the log goes to out/<CompId>.log.
// Options (environment variables): CHROME=<path to chrome>, REMOTION_GL=<backend, default "angle">.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pairs = process.argv.slice(2);
if (pairs.length === 0) {
	console.error('usage: node scripts/render_all.mjs "CompId outname" ...');
	process.exit(2);
}
process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
mkdirSync("out", { recursive: true });

const browser = process.env.CHROME ? [`--browser-executable=${process.env.CHROME}`] : [];
const time = () => new Date().toTimeString().slice(0, 8);
let failed = 0;
for (const pair of pairs) {
	const [comp, name = comp] = pair.trim().split(/\s+/);
	console.log(`START ${comp} ${time()}`);
	const r = spawnSync(
		"npx",
		["remotion", "render", "src/index.ts", comp, `out/${name}.mp4`, `--gl=${process.env.REMOTION_GL || "angle"}`, "--timeout=240000", "--crf=18", ...browser],
		{ stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", shell: process.platform === "win32", maxBuffer: 256 * 1024 * 1024 },
	);
	writeFileSync(`out/${comp}.log`, `${r.stdout ?? ""}${r.stderr ?? ""}`);
	if (r.status !== 0) failed++;
	console.log(`DONE ${comp} ${time()} exit=${r.status}`);
}
console.log("ALLDONE");
process.exit(failed ? 1 : 0);
