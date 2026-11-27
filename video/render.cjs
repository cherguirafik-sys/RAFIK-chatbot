#!/usr/bin/env node
// Rendu de la vidéo image par image (Playwright + ffmpeg).
//   node video/render.cjs --stills   -> images de contrôle (une par scène + limites)
//   node video/render.cjs            -> MP4 complet + affiche
// Sorties dans video/out/.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "out");
const STILLS = process.argv.includes("--stills");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css" };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end();
      }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  // Aucune requête hors de ce serveur local (le webhook de la page n'est jamais appelé).
  await page.route("**/*", (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  page.on("pageerror", (e) => console.error("Erreur page :", e.message));

  await page.goto(`${base}/video/scene.html`);
  await page.evaluate(() => window.timeline.ready);
  const C = await page.evaluate(() => window.timeline.config);
  await page.setViewportSize({ width: C.width, height: C.height });
  const shot = (t) => page.evaluate((x) => { window.timeline.setTime(x); }, t).then(() => page.screenshot({ type: "png" }));

  if (STILLS) {
    const dir = path.join(OUT, "checks");
    fs.mkdirSync(dir, { recursive: true });
    const last = (C.duration * C.fps - 1) / C.fps;
    const times = [["premiere-image", 0], ["derniere-image", last]];
    C.scenes.forEach((s) => {
      times.push([`scene${s.id}-milieu`, (s.start + s.end) / 2]);
      times.push([`scene${s.id}-debut`, s.start]);
    });
    times.push(["clic", C.demo.click + 0.05], ["bulle", C.demo.bubble + 0.6]);
    for (const [name, t] of times) {
      fs.writeFileSync(path.join(dir, `${name}_${t.toFixed(2)}s.png`), await shot(t));
      const st = await page.evaluate((x) => window.timeline.stateAt(x), t);
      console.log(name.padEnd(16), `t=${t.toFixed(2)}s scène ${st.scene} zoom ${st.camera.zoom.toFixed(2)}`);
    }
  } else {
    const frames = Math.round(C.duration * C.fps);
    const mp4 = path.join(OUT, "rafik-survol-1080x1920.mp4");
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(C.fps), "-i", "-",
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", mp4],
      { stdio: ["pipe", "inherit", "inherit"] });
    for (let i = 0; i < frames; i++) {
      const buf = await shot(i / C.fps);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % 60 === 0) console.log(`image ${i}/${frames}`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on("close", r));
    // Affiche : le titre final, immobile.
    fs.writeFileSync(path.join(OUT, "affiche.png"), await shot(C.duration - 0.5));
    console.log("MP4 :", mp4);
  }
  await browser.close();
  srv.close();
})();
