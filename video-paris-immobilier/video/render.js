// Rendu image par image : on place l'animation à l'instant t, on photographie, on recommence.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const FPS = 30, W = 1080, H = 1920;
const mode = process.argv[2], arg = process.argv[3], out = process.argv[4];
(async () => {
  const browser = await chromium.launch();
  const open = async () => {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.error('PAGE ERROR', e.message));
    page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
    await page.goto('file://' + path.join(__dirname, 'index.html'));
    await page.waitForFunction('window.__ready === true', null, { timeout: 20000 });
    return page;
  };
  if (mode === 'shots') {
    const page = await open();
    fs.mkdirSync(out, { recursive: true });
    for (const t of arg.split(',').map(Number)) { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(5, '0')}.png`) }); }
    fs.writeFileSync(path.join(out, 'sfx.json'), JSON.stringify(await page.evaluate('({duration: window.__duration, sfx: window.__sfx})')));
  } else {
    const workers = +arg || 4; fs.mkdirSync(out, { recursive: true });
    const p0 = await open(); const dur = await p0.evaluate('window.__duration'); const total = Math.round(dur * FPS);
    fs.writeFileSync(path.join(out, '..', 'sfx.json'), JSON.stringify(await p0.evaluate('({duration: window.__duration, sfx: window.__sfx})')));
    await p0.close(); let done = 0;
    await Promise.all([...Array(workers)].map(async (_, w) => {
      const page = await open(); const a = Math.floor(total * w / workers), b = Math.floor(total * (w + 1) / workers);
      for (let f = a; f < b; f++) { await page.evaluate(t => window.seek(t), f / FPS); await page.screenshot({ path: path.join(out, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 96 }); if (++done % 300 === 0) console.log(done + '/' + total); }
    }));
    console.log('frames', total);
  }
  await browser.close();
})();
