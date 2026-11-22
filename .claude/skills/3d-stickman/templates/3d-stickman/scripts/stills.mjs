#!/usr/bin/env node
// Renders stills and a contact sheet. Works on Windows, macOS and Linux (no bash needed).
// Usage:   node scripts/stills.mjs COMP prefix frame1 frame2 ...
//   or:    npm run stills -- COMP prefix frame1 frame2 ...
// Output:  out/<prefix>_<frame>.png for each frame, plus out/<prefix>_sheet.png (side by side, needs Python 3 + Pillow).
// Options (environment variables):
//   CHROME=<path to chrome>  use an installed Chrome instead of Remotion's own downloaded browser
//   REMOTION_GL=<backend>    OpenGL backend, default "angle" (try "swangle" on machines without a GPU)
import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [comp, pre, ...frames] = process.argv.slice(2);
if (!comp || !pre || frames.length === 0) {
	console.error("usage: node scripts/stills.mjs COMP prefix frame1 frame2 ...");
	process.exit(2);
}
process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
mkdirSync("out", { recursive: true });

const npx = (args) => spawnSync("npx", args, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", shell: process.platform === "win32" });
const browser = process.env.CHROME ? [`--browser-executable=${process.env.CHROME}`] : [];
const gl = `--gl=${process.env.REMOTION_GL || "angle"}`;

const done = [];
for (const fr of frames) {
	const file = `out/${pre}_${fr}.png`;
	const r = npx(["remotion", "still", "src/index.ts", comp, file, `--frame=${fr}`, gl, "--timeout=240000", ...browser]);
	const errs = `${r.stdout}\n${r.stderr}`.split(/\r?\n/).filter((l) => /error/i.test(l)).slice(0, 3);
	if (errs.length) console.error(errs.join("\n"));
	if (r.status === 0 && existsSync(file)) {
		console.log(`still ${file}`);
		done.push(file);
	} else console.error(`FAILED frame ${fr} (exit ${r.status})`);
}
if (done.length === 0) process.exit(1);

// Contact sheet (each still 324x576 plus a 10px white gap) with Python + Pillow.
// Finds Python as "py -3" (Windows launcher), "python3" or "python", whichever exists.
const SHEET = `import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB').resize((324, 576)) for f in files]
c = Image.new('RGB', (334 * len(ims), 576), 'white')
for i, im in enumerate(ims): c.paste(im, (i * 334, 0))
c.save(out)`;
const sheet = `out/${pre}_sheet.png`;
const pythons = process.platform === "win32" ? [["py", "-3"], ["python"], ["python3"]] : [["python3"], ["python"]];
for (const [exe, ...flags] of pythons) {
	const r = spawnSync(exe, [...flags, "-c", SHEET, sheet, ...done], { encoding: "utf8" });
	// skip commands that do not exist, and the Windows "python" Microsoft Store placeholder (exit 9009)
	if (r.error || r.status === 9009 || /Microsoft Store/i.test(r.stderr)) continue;
	if (r.status === 0) {
		console.log(`sheet ${sheet}`);
		process.exit(0);
	}
	if (/No module named .PIL/.test(r.stderr)) console.error(`Pillow is missing: run "${[exe, ...flags].join(" ")} -m pip install pillow" for the contact sheet (stills are done).`);
	else console.error(`contact sheet failed:\n${r.stderr}`);
	process.exit(1);
}
console.error("No Python found for the contact sheet (stills are done). Install Python 3 and Pillow.");
process.exit(1);
