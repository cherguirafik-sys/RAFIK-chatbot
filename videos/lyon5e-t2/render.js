// Rendu de la composition avec Playwright.
//
//   node render.js still 1.5 apercu.png   → une image fixe à 1,5 s (vérification)
//   node render.js video                  → toutes les images puis MP4 avec FFmpeg
//
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const FPS = 30;
const dir = __dirname;

(async () => {
  const [mode = 'still', a1, a2] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(dir, 'composition.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');

  if (mode === 'still') {
    const t = parseFloat(a1 || '1.5');
    const out = path.resolve(a2 || path.join(dir, 'apercus', `t${t}.png`));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: out });
    console.log('Image :', out);
  } else {
    const duree = await page.evaluate(() => window.DUREE);
    const frames = path.join(dir, 'frames');
    fs.rmSync(frames, { recursive: true, force: true });
    fs.mkdirSync(frames);
    const n = Math.round(duree * FPS);
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.seek(t), i / FPS);
      await page.screenshot({ path: path.join(frames, `f${String(i).padStart(5, '0')}.png`) });
    }
    const out = path.join(dir, 'sortie', 'video-sans-son.mp4');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS),
      '-i', path.join(frames, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-crf', '18', out]);
    console.log('Vidéo :', out, `(${n} images)`);
  }
  await browser.close();
})();
