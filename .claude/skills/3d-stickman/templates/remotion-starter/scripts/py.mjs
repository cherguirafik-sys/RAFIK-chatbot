#!/usr/bin/env node
// Runs a Python script with whichever Python 3 this machine has: "py -3" (Windows launcher), "python3" or "python".
// Usage: node scripts/py.mjs script.py [args...]   (npm scripts use this so they work on Windows, macOS and Linux)
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const pythons = process.platform === "win32" ? [["py", "-3"], ["python"], ["python3"]] : [["python3"], ["python"]];
for (const [exe, ...flags] of pythons) {
	const r = spawnSync(exe, [...flags, ...args], { stdio: "inherit" });
	// skip commands that do not exist, and the Windows "python" Microsoft Store placeholder (exit 9009)
	if (r.error || r.status === 9009) continue;
	process.exit(r.status ?? 1);
}
console.error("Python 3 not found. Install it from https://www.python.org (Windows: tick 'Add python.exe to PATH').");
process.exit(1);
