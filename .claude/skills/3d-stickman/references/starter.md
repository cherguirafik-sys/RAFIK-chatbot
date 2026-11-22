# Reusable Remotion starter and scene controls

Use for new projects; do not replace a working app or its user edits. This is a small extensible
production base, not an automatic film generator. Remotion stays the renderer and interactive preview.
The demo is eight silent seconds with synthetic cue timings, not narration claimed to be transcribed.
It uses procedural visuals and needs no image service or missing external models. These demo visuals
are a setup test, not a demonstrated match for a supplied video's style. Complete the explicit asset
route and, for recreation, STYLE.md before selecting production visuals. Extend/replace the scene
components for approved plates and cutouts; never downgrade the reference just to fit the demo.

## Initialize and check

From the installed skill folder (on Windows type `py` instead of `python3`):

```bash
python3 scripts/studio.py init /absolute/path/to/new-film
cd /absolute/path/to/new-film
npm ci
npm run compile
npm run typecheck
npm run dev -- --no-open
```

Use an available browser to open the printed Studio URL. If unavailable, provide the working URL.
Pinned dependencies and a lockfile travel with the starter. Do not copy node_modules or rely on another
film's installed dependencies when distributing it. Python compiler/library operations use stdlib;
rig preparation needs Pillow; style comparison needs Pillow + NumPy; preview QA needs Pillow.

```bash
# Use an installed browser if renderer auto-discovery is unavailable:
CHROME_BINARY="/actual/path/to/Chrome" npm run check            # macOS / Linux
$env:CHROME_BINARY="C:\path\to\chrome.exe"; npm run check     # Windows PowerShell
```

Inspection images and a contact sheet are written under a new `out/qa-.../` directory. Read the report
and inspect images. This command never exports an MP4. Export only when authorized, using Remotion's
rendering tools and the existing delivery checks. The old bridge remains an advanced technique example.

## Authority and authoring

| File | Owns |
| --- | --- |
| PROJECT.md / BUILD_PLAN.md | Decisions, source/reference roles, dependencies and shot implementation |
| SCENE.json | Visual assets, reusable environments, character definitions, moods, narration locator |
| SHOT_PLAN.json | Editable symbolic shot starts, actions, events, cameras and transitions |
| ALIGNMENT.json | Current measured narration duration, words or phrases, method and verification status |
| TIMELINE.json | Compiled canonical integer frames consumed by Remotion |
| ASSETS.json | Exact library versions materialized for this film, if any |

Do not maintain two independent numerical timelines. Recompile after changing the shot plan or
alignment; review downstream changes. The checker detects stale compilation via the input hash.
Existing projects may keep their current timeline/code; migrate only when it helps the requested work.

## Cue compilation

```bash
python3 tools/studio.py compile SHOT_PLAN.json ALIGNMENT.json -o TIMELINE.json
```

Alignment example:

```json
{"duration": 8, "method": "ASR word timestamps; listening review pending", "verified": false,
 "words": [{"word": "Begin", "s": 0.2, "e": 0.6}, {"word": "again", "s": 4.0, "e": 4.5}]}
```

`words` accepts `word/s/e` or `w/t0/t1`. For phrase alignment use `phrases` entries `text/s/e`.
The method is carried through without promotion to verified. No timing estimator or claimed accuracy
is built into this compiler. Obtain alignment using an available tool or actual listening review.

Shot `start` is seconds or `say:phrase`. Repeated matches require an explicit `#occurrence`, such as
`say:again#2`. Case and punctuation are normalized. Missing/ambiguous cues fail. A cue beginning inside
a phrase-level estimate is rejected: select the phrase's start or obtain finer alignment. Do not invent
word positions. First shot starts at zero. End is `audio` or explicit seconds; trimming narration needs
an intentional excerpt marked `allowNarrationTrim: true`. Story/voice storage preferences still apply.

Each shot has unique `id`, `environment`, `mood`, `camera`, `actions`, optional `events`, `reviewAt`,
and a transition **into** the shot. Events use either `cue` (absolute narration marker) or `at` (seconds
within the shot). They compile to absolute event frames. `reviewAt` adds local action-extreme seconds.
Opening, middle and ending sample frames are generated automatically. The compiler rejects overlapping
alignment, non-increasing rounded shot starts and events outside their shot.

## Scene controls actually supported

- `characters`: stable `id`, feet `position: [x,y,z]`, `height`, optional `color`, optional public-relative
  `rig` path. Without a rig the starter draws an original articulated doodle with elbows/knees.
- `environments`: named ground colour, optional `groundTexture`/`backdrop`, and props. Each prop has
  unique `id`, `type`, `position`, `size`, optional `color`, `rotation` in radians and `texture`.
  Types: `box`, `cylinder` (size[0] radius, size[1] height), `image` (file, width/height in size),
  `model` (GLB file, desired height in size[1]). Model placement is its ground-centred origin;
  primitive placement is its centre. Normalize a model before using collision-critical interactions.
- `moods`: named `ambient`, `sun`, `sunColor`, sun `position`, and `background`. Set these from the
  approved story and palette, not a compulsory day/night pivot.
- `camera`: explicit `position`, `lookAt`, optional `endPosition`, `endLookAt`, vertical `fov`.
  Define framing by subject visibility and action space; inspect the resulting screen size.
- `actions`: object keyed by character ID. Characters without an entry are absent from that shot.
  Procedural actions: `idle`, `wave`, `walk`, `hop`. `to` moves the feet over `over` seconds.
  Layer rigs use named `angles` in degrees and optional named `face`. Arbitrary interactions need
  deliberate custom animation; a label such as `box` does not invent a boxing rig.
- `events`: change that character's current action at a compiled frame. Events update named fields; joint angles blend over `ease` seconds (default 0.3).
  A new action kind restarts its local time; expression-only events do not. Put movement in the base
  action; event-driven destination changes require extending the component. Plan pose/position continuity across shots.
- `transition`: `cut`, `glide`, or `dissolve`; optional `transitionFrames`. Glide interpolates camera
  and lighting from the previous shot's endpoint. Dissolve holds the previous final frame underneath
  the incoming scene. Neither changes canonical duration. These are starting techniques, not a
  requirement to move every shot or avoid all hard cuts.
- `narration`: null for a labelled silent demo, a permitted public-relative audio path, or an accessible
  HTTP URL. A reference-only recording needs an authorized no-store playback mechanism. Rendering may
  cache media; do not export it until storage/export authorization covers that use.

No captions are added by this starter. Add them when the approved brief calls for them, including
recreating captions in a source video; implement the layer explicitly. Music, effects, complex character
movement and stronger surface treatments remain deliberate production decisions supported by existing
references. Modify components rather than silently pretending an unsupported scene field works.

## Layer renderer

`Puppet.tsx` consumes the prepared rig described in production-assets.md. The image parts share source
canvas coordinates, explicit pivots and optional parent chains. Layer angles rotate around those joints;
expressions replace the named layer at the same dimensions/pivot. This is optional, not a universal rig.
The four built-in procedural actions do not automatically animate arbitrarily named image joints;
author `angles` or extend the component with the actual rig's motion channels.

## Extend without duplication

New effects/components belong in the working film. Promote genuinely reusable ones back into the starter
only when requested. Keep timing in the canonical file, reuse active asset versions, and record how each
reference reaches a scene component. The generic starter supplements the detailed bridge shaders,
lighting, audio and camera examples rather than erasing them.
