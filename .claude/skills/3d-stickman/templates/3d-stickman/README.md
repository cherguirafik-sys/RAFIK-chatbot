# 3D Stickman starter (cartoon-shorts code base)

Reusable code for RicksClips-style stickman shorts: 2D SVG stickmen projected into 3D toon scenes, Meshy GLB models up close, AI-painted panorama backdrops far away.

## Shared components (src/shared)
- Person.tsx: stickman rig (headwear, outfits, poses, arm rules, holdL/holdR props). Also exports Inked, Vinyl, tone, INK.
- Critters.tsx: Emu, Bird, Crab, plus sprites (Burst, Sparkle, Dust, Question).
- Toys.tsx: Sock, Snowman, Cat.
- cam.tsx: camera helpers (camAt pattern, easeOut, mixCam, push, CameraRig, projector for 2D placement, depth sort). W=1080, H=1920.
- Shell.tsx: compositor (ThreeCanvas, SVG cast layer, scene tint, flash, vignette, optional audio, w/h for 16:9).
- Toon3D.tsx: procedural toon textures, ink lines (LineSegments2), hulls, Box/Prism/Blob/Cyl/Window primitives.
- GLB.tsx: loads public/models/*.glb, auto-scales (height/fit), grounds it, adds an ink hull, downsizes textures to 1024 for speed. Props: p, r, height, fit, ink, tint, emissive, flipX.
- Backdrop.tsx: wraps public/bg/*.png (21:9 panorama) on a big cylinder behind the set. Props: file, center, radius, horizon, hFrac, copies, yaw, bright.

## Example scenes (src/scenes)
EmuTest, FryTest, SnowTest (9:16) and BlackFriday (16:9). ModelSheet previews GLB files (pass names via --props).
Included assets (already in public/): 16 Meshy GLB models in public/models (textures compressed to 1024 JPEG), 4 painted panoramas in public/bg and the example narrations (nar_*.mp3). Reuse them before generating new ones. Model list: bench, busstop, car, cart, cottage, farmhouse_au, gumtree (tint it green, leaves look like oranges), haybale, kiosk (sign reads FRIIES, turn it away), lamp, mailbox, pine, truck (rotate Math.PI so it drives forwards), umbrella, windmill, xmastree. Backgrounds: emu (outback), fry (sunset sea), snow (alpine valley), bf (night shopping street).

## Scripts
Both are Node scripts, so they work the same on Windows, macOS and Linux (no bash needed).
- `npm run stills -- COMP prefix frame1 frame2 ...`: renders stills and a contact sheet out/<prefix>_sheet.png
  (the sheet needs Python 3 + Pillow: `pip install pillow`; the stills do not).
- `npm run render -- "CompId outname" ...`: sequential full renders to out/<outname>.mp4.

Rendering uses Remotion's own headless browser (downloaded on first run), --gl=angle --timeout=240000, antialias on.
Set `CHROME` to use an installed Chrome instead, and `REMOTION_GL=swangle` on a machine without a GPU.
Expect about 4 s per frame with GLB scenes.

## Setup
1. Copy this folder to a new project folder.
2. `npm install`, then `npm run dev` (Remotion Studio) or the scripts above.

Setting environment variables differs per shell: PowerShell `$env:CHROME="C:\path\chrome.exe"; npm run stills -- ...`,
cmd `set CHROME=C:\path\chrome.exe`, macOS / Linux `CHROME=/path/chrome npm run stills -- ...`.
