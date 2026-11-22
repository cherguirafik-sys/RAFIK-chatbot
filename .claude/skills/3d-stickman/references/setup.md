# Background setup and first successful frame

Setup supports Stage 5 (Build in Remotion), and can run earlier in parallel with independent planning.
It is not a separate creative question or a reason to require optional image assets.
The user should not have to infer a software setup from the bridge example. Do this work when the host
can run commands. Otherwise give platform-specific instructions and keep the stage explicitly incomplete.

## 1. Establish the two folders

- **Skill folder:** these instructions, references, and templates. Keep it reusable.
- **Working project:** one film's source, voice, timeline, previews, and final output. Work here.

Inspect the user's existing project before creating files. Reuse a working Remotion app without replacing
its entry, lockfile, or other compositions. Choose a fresh directory for a new app.
Keep unrelated skills and comparison packages outside the film project.

Suggested working layout:

```text
my-short/
  PROJECT.md
  SETUP.md
  SCRIPT.md
  VISUAL_PLAN.md
  TIMELINE.json
  BUILD_PLAN.md
  SOURCE_STORY.md              # only for recreation
  DELIVERY.md
  package.json                 # supplied by the new-film starter
  package-lock.json            # or the chosen package manager's lockfile
  tsconfig.json
  src/index.ts
  src/Root.tsx
  src/videos/my-short/
  public/                     # only assets this film actually needs
  voice/voice.wav
  voice/words.json
  audio/
  scripts/
  out/preview/
  out/qa/
  out/final.mp4
```

## 2. Check tools and dependency compatibility

Inspect the OS, Node/npm, Python 3, ffmpeg and ffprobe, available browser/rendering support, writable
output/temp paths, and free storage. Use an isolated Python environment for this project.

The generic starter includes its own package manifest/lockfile. Its Python helpers use stdlib, Pillow
and optionally NumPy; they do not require an image service. The legacy bridge example imports these JavaScript packages:
`react`, `react-dom`, `remotion`, `@remotion/cli`, `@remotion/three`, `@remotion/bundler`,
`@remotion/renderer`, `three`, `@react-three/fiber`, `@react-three/postprocessing`, and `postprocessing`.
Type checking also needs TypeScript and the corresponding React/three type packages as appropriate.
Python helpers use NumPy, SciPy, and Pillow. ffmpeg/ffprobe are executable dependencies.

For a new app, check official documentation/package metadata for a compatible set before installing;
keep Remotion packages on the same version, resolve peer requirements, and save exact versions in the
lockfile. For an existing app, inspect its lockfile first. Do not install a mixture of latest packages
blindly or upgrade unrelated working dependencies. Old version numbers in research reports describe the
example's past environment, not a tested install specification for this package.

## 3. Assemble and test the minimal app

For a new film use `scripts/studio.py init` and [starter.md](starter.md), which supplies a complete
pinned Remotion app, a silent procedural demo, cue compilation, scene controls and QA. For an existing
app preserve its source/lockfile and integrate only needed components. If constructing a custom app,
create a package manifest, TypeScript configuration, `src/index.ts` registering a root, and `src/Root.tsx`
registering a short test composition. Set the intended fps and dimensions explicitly. Use a simple scene
first to isolate environment failures from the complex bridge code.

Run the package's type check and render one frame using the installed Remotion CLI. Verify that the
output exists and inspect it. Then test one simple three.js scene to confirm the 3D renderer works.
Record actual commands and results in SETUP.md. Do not report success based only on package installation.

The starter composition is `CartoonShort`; replace its demo with the approved story and current
timeline. Reuse its generic components and expand them where the film needs custom motion. Consult
`templates/bridge/` for advanced shading, lighting and effects; do not require copying that entire
film into a new story. Confirm the actual composition ID and registered duration.

## 4. Resolve assets explicitly

`templates/bridge/world.ts` requests models under `public/bridge/kenney/`. Those GLB models are not
included here. Its loader can silently drop failed assets. Inventory requested models and choose a route:
use available user-provided assets, obtain suitable assets with authorized tools, or build procedural
replacements. Record replacements and visually check the scene. Never claim the original example's
appearance has been reproduced if assets are missing.

The original voice recording and word timings are also not bundled. They are created or supplied in
Stage 3, or referenced in place when copying is disallowed. A setup test may be silent; a finished narrated film may not.

## 5. Configure rendering for this machine

Do not assume Windows Chrome or a drive letter. The legacy `templates/scripts/bridge-stills.mjs` hardcodes
both a Windows browser and `BridgeShort`. Before copying/using it, adapt its browser selection and
composition ID, or use the installed CLI with explicit entry/composition/frame arguments instead.
Document the working command. Create output parent folders before rendering.

Set a dedicated temporary directory with enough space and configure the chosen renderer's supported
temp settings. The helper's REMOTION_TMP handling sets TEMP/TMP; inspect behavior on the actual host
rather than assuming it handles every platform. Keep only needed assets in `public/`.
Do not delete shared temp files or unrelated projects to make space.

## Ready means evidence

SETUP.md records: OS/tool versions, dependency lockfile, entry/composition, asset inventory, temp/output
paths, executed checks, test frame location, and any remaining blocker.

If local execution is unavailable, provide the brief, script, visual plan, and a handoff listing the exact
remaining setup work. Do not claim this skill can render inside a text-only chat or that the package is
an already configured application.
