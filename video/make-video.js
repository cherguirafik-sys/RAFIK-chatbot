// Fabrique video/rafik-explainer.mp4 à partir de scene.html
// Utilisation : node video/make-video.js
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30;          // images par seconde
const DURATION = 16;     // durée en secondes
const dir = __dirname;
const framesDir = path.join(dir, 'frames');

(async () => {
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  await page.goto('file://' + path.join(dir, 'scene.html'));

  const total = FPS * DURATION;
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.render(t), i / FPS);   // on dessine l'instant t
    await page.screenshot({ path: path.join(framesDir, String(i).padStart(4, '0') + '.png') });
  }
  await browser.close();

  // ffmpeg colle toutes les images ensemble en une vidéo MP4
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i "${framesDir}/%04d.png" ` +
           `-c:v libx264 -pix_fmt yuv420p -crf 20 "${path.join(dir, 'rafik-explainer.mp4')}"`);
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log('Vidéo prête : video/rafik-explainer.mp4');
})();
