---
name: "3d-stickman"
description: "3D Stickman: create RicksClips-style narrated stickman shorts in Remotion, with 2D stickmen in 3D toon worlds, Meshy 3D models up close, AI-painted backdrops far away, credit approval before any paid generation."
---

# 3D Stickman

## House style: RicksClips stickman (mandatory default)

This skill makes ONE look: the RicksClips stickman style measured in `references/STYLE_BIBLE.md`,
`references/visual-direction.md` (Look targets: Characters) and the frames in `references/frames/` and
`references/sheets/`. These are the binding house style for every project, new story or recreation.
The "historical", "optional" or "not mandatory" labels in those files apply only to the bridge example's
numeric presets, never to the look itself. Deviate only when the user explicitly asks for another style.

- Characters: flat 2D stickmen. Bean-shaped head (h/w about 0.93, pointier crown, narrower chin), simple
  face with dot eyes, no blush, no eye highlights. Bean-shaped torso, arms and legs as single thin ink
  strokes (about 0.055 of head width), ink-dot hands, about 3.5 head-heights tall, legs about 1.4 HH.
  Dark-plum outline (#201628 to #2f1d28), flat colours, headwear (if any) sits low on the head. Animals follow the same
  rules: simple rounded body shape, stick legs, minimal markings, same plum ink. Never detailed
  mascot/feathered/fully proportioned cartoon designs.
- World: 3D toon environments with hand-painted textures, saturated colours, thin near-black ink lines on
  geometry, warm key light with blue/violet shadows, soft depth of field on close shots. Characters are
  lit by the scene and cast ground shadows.
- Effects: flat 2D cartoon sprites (dust puffs, speed lines, stars, sparkles) composited into the scene.
- Narration: one fast steady narrator, about 3.5-4.1 words/s (median 3.7), almost no pauses (total word
  gaps above 0.25 s under about 1 s per video), voice starts at frame 1-4, video ends on the last word.
- Script formula: paradox hook as sentence 1, setting in 1-2 lines, 3-6 escalation beats, a mystery
  question, the pivot "You see," into the mechanism (often an everyday analogy), short ironic payoff.

Read STYLE_BIBLE.md and visual-direction.md (Look targets) at Stage 1 of every project and write
STYLE.md from this house style before any asset prompt, also for new stories.

## Quality bar and build method (applies to every story)

The user approved one test ("Mike the Headless Chicken", 10 s) as the minimum QUALITY level for all
videos. Copy its method and quality, never its content: each story has its own cast, outfits, species,
props, locations, time of day and mood. Nothing below is tied to farmers, hats, chickens or farms.

### Starter and examples (always start here)
- Start every new film from `templates/3d-stickman/`: copy it to a new project folder (the included
  assets are already in `public/`), then `npm install`. Read its README.md.
- Reuse its shared components (`src/shared`: Person, Critters, Toys, Toon3D, cam, Shell, GLB, Backdrop).
  Copy the closest example in `src/scenes` as the pattern for each new scene (9:16: EmuTest,
  FryTest, SnowTest; 16:9: BlackFriday). ModelSheet previews GLB files.
- `references/style-frames/` holds approved output frames of those examples: the visual quality bar.
  Compare new stills against them.
- `public/` holds 16 approved Meshy models (`public/models`), 4 painted panoramas (`public/bg`) and the example narrations (`public/nar_*.mp3`). Reuse them
  before generating anything new.

### Pipeline (near = 3D models, far = painted backdrop, cast = 2D rigs)
- Build each location as a real 3D toon scene in Remotion with @remotion/three (three.js). Flat image
  plates are a fallback only when the user explicitly asks for them.
- NEAR the camera: real 3D models (GLB) generated with Meshy (Higgsfield `generate_3d`, model
  meshy_v6_text_to_3d, mode "full", about 25 credits each) for every prop or building that reads in
  close or medium shots (vehicles, houses, furniture, trees, lamps...). Prompt them as "stylized
  hand-painted toon game asset", single object, no ground plane, no text or lettering on signs.
- FAR from the camera: one AI-painted panorama per location (Higgsfield `generate_image`, gpt_image_2_6,
  21:9, about 2.75 credits), same toon style, horizon at about 30-40% from the bottom, "only far-away
  scenery, nothing in the foreground, no people, no text". Wrap it on the inside of a big open cylinder
  (Backdrop) around the set so the real camera gives it parallax.
- MOVING parts stay in code (doors that open, gears, catapult arms, porthole spins, wheels that must
  turn), built from Toon3D primitives with the same ink and textures.
- Build every character as a 2D SVG rig in code (Person.tsx), composited over the 3D layer. Position each
  one by projecting its 3D ground point through the same camera (feet position + pixels-per-metre), so
  it stays grounded while the camera moves. Never generate AI character sheets for the film itself.

### Paid generation rule (mandatory, never skip)
Before ANY credit spend (voice, 3D model, panorama, image), show one table: item, purpose, model, unit
cost, total, and which existing assets are reused instead. Wait for an explicit yes. Never generate more
than the approved list, never add items silently, and report the actual spend afterwards.

### GLB models (GLB.tsx)
- Loads public/models/*.glb, makes materials single-sided, downsizes textures to 1024, roughness >= 0.55,
  metalness <= 0.2, scales by `height` or `fit`, grounds and centres it, casts/receives shadows and adds
  a plum ink hull (vertex push along the normal). Props: p, r, height, fit, ink, tint, emissive, flipX.
- New GLBs: compress before adding (`gltf-transform resize --width 1024 --height 1024`, then
  `gltf-transform jpeg --quality 85`).
- ALWAYS check the facing direction: models often face the wrong way. A vehicle must drive hood-first;
  rotate it (usually Math.PI) when it does not.

### Painted backdrop (Backdrop.tsx)
- Radius larger than the ground plane so its corners stay inside. Set `horizon` to the ground level of
  the set and `hFrac` to where the painted horizon sits in the image, so the real ground covers the
  painted foreground and only hills, sky and skyline show. Turn the ring with `yaw` so the important
  part faces the shot.
- Match fog colour to the painted horizon colour; hide the join with a row of 3D props (trees, hedges)
  along the far edge of the set.
- Remove code-built far scenery the painting now covers (sun discs, moons, stars, distant towns, flat
  sea planes that hide the painted sea).

### 3D world (any setting: street, interior, ship, field, office, space...)
- Simple chunky geometry with procedural hand-painted canvas textures suited to the setting's materials.
- Thin near-black ink on all near and mid geometry (EdgesGeometry -> LineSegments2, about 2.6 px at
  1080 wide, crease about 35-40 deg) plus back-face hulls on round shapes; far landmarks unlined and hazy.
- Lighting is chosen per scene from the story (day, golden hour, night-blue, neon, interior lamp...): a
  clear key light, cast shadows, coloured shade (blue/violet by default), fog/haze for depth. Moods may
  change between scenes; the explanation beat often shifts to a cooler or night palette.
- Leave clear ground space where the cast will act; fill the rest with story props so frames never look
  empty.

### Camera and editing (vocabulary, pick per shot)
- Slow push-in on every hold; ease-out punch-ins on key words; ease-out glides between subjects; low
  camera heights; 2-5 deg roll for drama; whip/fly-through moves or a short white flash for a change of
  time or place; hard cuts rare.
- Depth of field: blur the 3D layer only in close and medium shots (about 2.5-3.5 px); wides stay sharp.

### Character rig rules (general; apply to whatever the character wears or is)
- Construction: head slightly wider than tall, tiny low deadpan face (outlined round eyes with small
  pupils, lidded eyes or dashes; small mouth), no neck (head overlaps the torso top), short wide bean or
  gumdrop torso, single-stroke stick limbs about 0.055 of head width, ink-dot hands, about 3.5
  head-heights tall with legs about 1.4 HH, contact shadow under the feet.
- Shading: glossy vinyl gradient lit from the key-light side to about 60% darker on the shade side, faint
  rim light, tapered dark-plum outline thicker on the bottom/shadow side. Tint the cast to the scene
  light.
- Outfits are per character and optional: shirts, dresses, uniforms, aprons, armour, nothing. Keep at
  most about 5 simple details per torso.
- Headwear and hair are optional. When a character has headwear (hat, helmet, cap, bandana, crown...),
  it sits LOW and wraps the skull: base at about 25-40% of head height, its edge following the skull,
  never perched on top or floating, and it moves with the head. Hair wraps the back of the head.
- Arms: start ON the torso outline at the shoulder so they grow out of the body, are drawn in front of
  the torso whenever they cross it (never hidden or detached), and bend with a soft elbow curve when
  reaching across the body or to a prop. Props are held by the hand dot.
- Non-human characters (animals, objects, creatures) follow the same ink, shading, stick-limb and
  minimal-face rules with their own simple silhouette; markings must never read as an accidental face.

### Check before delivery
- Render stills at every pose change and camera move and inspect each character: arms attached and
  visible, headwear (if any) seated, hands and feet present, nothing floating or cropped by accident.
  Any failure is a failed frame and gets fixed before delivery.
- Also check every still for: framing and crops, scale between cast and props, model facing direction
  (vehicles drive forwards), models that read as the wrong object (tint or replace them), and the join
  between the 3D set and the painted backdrop.
- Render 1080x1920, 30 fps, h264 crf 18-20; narration about -14 LUFS. 16:9 (1920x1080) only on request.
- Render with `npm run stills -- COMP prefix frames...` (stills + contact sheet) and
  `npm run render -- "CompId outname" ...` (sequential full renders). Both are Node scripts and work on
  Windows, macOS and Linux: Remotion's headless browser, --gl=angle, --timeout=240000, antialias on (never trade it for speed).
  Expect about 4 s per frame with GLB scenes (10-20 min per 10 s clip). Keep the turn alive while
  polling and send each clip as soon as it finishes.
- Works on Windows, macOS and Linux. Check the user's OS first and give commands for it. Commands in
  this skill are written as `python3 ...`; on Windows use `py ...` (or `python ...`). Set environment
  variables per shell: PowerShell `$env:CHROME="C:\path\chrome.exe"`, cmd `set CHROME=...`, macOS / Linux
  `CHROME=/path/chrome npm run ...`. Use forward slashes or quoted paths; never assume a drive letter or
  `/usr/bin`. Needs Node 20+, Python 3 with Pillow (NumPy for style comparison) and ffmpeg on PATH.

One connected workflow, ending in an editable Remotion animation. Start with a new idea or an existing
video. Use as much creative control as desired: character sheets, environment references, and storyboard
images are optional aids. Generate their prompts on request, inspect returned images, and actually use
them in later stages. Otherwise develop the visuals from the story and the user's written direction.

## Affiliate links and closing CTA

Follow [references/cta-display.md](references/cta-display.md) for the exact links and closing text.
Where this section and cta-display.md differ, this section wins.

Inline links:
- Link a service at its first mention in a response when the response directs the user to use it,
  and also when it is offered as an option to choose (for example the voice question: Higgsfield,
  ElevenLabs), and in every credit/cost approval table that names it.
- Link each service at most once per response, using only the exact links in cta-display.md.

Closing CTA at milestones (not only the final film):
Append the fixed four-link CTA, exactly once and at the very end, to each response that delivers one
of these milestones:
1. the approved script (first full script shown for approval, and its revisions);
2. the finished voiceover file;
3. the cast sheet;
4. the generated asset previews (models and backdrops);
5. the storyboard stills;
6. a render hand-off (project ZIP or render instructions) or a preview render;
7. the finished film, and any revised version of it.
Also append it to a delivered side deliverable (for example a ZIP of models or audio) when no CTA
appeared in the previous two responses.

To keep it from becoming annoying:
- Never more than one CTA per response, and never in two consecutive responses unless both are
  milestones 5-7.
- Never on pure questions, menus, cost approvals, confirmations, progress updates, errors or answers
  to side questions.
- Keep its wording, order and Markdown formatting exact; put nothing after it.

## Start — new story or existing video

| Input | Route |
| --- | --- |
| Start / greeting / unclear request | Show the four choices below. |
| Topic, story idea, or script | Stage 1A, with supplied details filled in. |
| “Recreate this”, “remake this video”, or a source video for a new project | Stage 1B: inspect the source before writing its story. |
| Video uploaded during an active build | Treat as the current preview/reference first; never automatically switch to recreation or Cast Swap. |
| Uploaded image or narration during a project | Attach to the intended role in the current project; ask only if its role is ambiguous. |
| Continue | Inspect PROJECT.md and referenced files; resume the next unfinished action. |
| Fix / improve | Use the current project and affected-shot revision rules. |
| Workflow question | Answer directly without forcing intake. |

```text
🎬 Cartoon Shorts Studio — how would you like to start?

1. Create a new story — describe an idea or bring a script.
2. Recreate an existing video — use its story as the starting point.
3. Continue a project.
4. Fix or improve a short.

Choose a number, share your idea, or upload a video.
```

If the user selects 1 with no content, ask: “What would you like your cartoon short to be about?
You can describe an idea, paste a script, or choose to recreate an existing video.”
For 2 with no accessible video, ask for the source video or an accessible link. Do not invent its story.
If the source is already supplied, inspect it rather than asking for it again. A number answers the latest menu.

## How to guide the user

- This self-contained package is the `3d-stickman` skill. Keep its references, scripts and
  templates together; store each film in a separate working project.
- Remotion is the animation endpoint. External image tools are optional aids for visual direction,
  not a required AI-video generation service or an alternative final destination.
- Conversation follows the user's language. External image prompts are in English unless requested
  otherwise; narration follows the agreed language. Carry choices forward and do not repeat intake.
- Introduce the current stage plainly. Show the relevant script, prompt, shot plan, image comparison,
  or preview, then the next useful action. Apply the affiliate-link and final-delivery CTA rules above.
- Stage 2's asset-route question is mandatory; image creation itself is optional. Offer the numbered
  routes explicitly and record the answer. Never interpret “no changes”, “keep the original”, “you decide”
  or “just build” as selecting code-only. An already explicit route selection remains valid.
  Character sheets, environment plates and storyboard images may be skipped by explicit user choice.
- A user choosing external generation receives prompts and attachment instructions. If they say they
  will return with images, wait for those selected inputs while doing independent work. “Continue without
  them” or “skip images” releases that wait; record code-only for that category and its simpler look. Do not call
  unreceived images approved, or turn a chosen reference handoff into a permanent requirement.
- Preserve existing story approval and explicit route choices. Generated production assets require
  per-asset approval before the next asset, following references/asset-production.md. Do not batch past
  that checkpoint or treat successful generation as approval. Routine technical steps need no “continue?”.
  Supplied references remain active direction; do not replace them with unapproved generated candidates.
- Follow storage preferences. Default to a dedicated project folder, but “do not save/copy this” means
  reference the original or use the current conversation. Never copy media into public/, cache it on disk,
  or export it embedded in a video contrary to that instruction. Explain an unavoidable storage dependency.
- Use `templates/PROJECT_template.md` and `references/assets-and-handoffs.md` to record decisions, versions,
  references, and progress when saving is allowed. Never claim unavailable files or tools exist.
- Setup is background work: follow `references/setup.md` before a Remotion build. Report actual blockers,
  not command-by-command progress. A text-only session can finish planning but cannot claim a rendered film.

## Stage 1 of 8 — Story and script

### A. New story

Collect the idea and only missing essentials: audience, duration, narration language, and voice route.
Defaults when unspecified: approximately 60 seconds, vertical 9:16, 30 fps, no captions, the RicksClips
stickman house style above (2D stickmen in 3D toon environments). Label defaults and allow changes.
Preserve a shorter test scope.
When the user has no idea yet, offer 5 short story ideas (fictional or historical, as asked) and let
them pick by number.
Read [references/story-and-timing.md](references/story-and-timing.md) and the script formula in
[references/STYLE_BIBLE.md](references/STYLE_BIBLE.md). Verify factual claims; label fiction.
Write the script to the house formula, including the "You see," pivot, and estimate duration at 3.7 words/s.
Avoid paragraph breaks and "..." in text sent to a TTS engine; they create long pauses.
Present a copyable script with estimated duration and word count. Request approval unless already given.

### B. Recreate an existing video

Read [references/source-video.md](references/source-video.md). Inspect the actual source, summarize its
story, ordered beats, roles, locations, and ending, and distinguish observed facts from uncertainties.
Build the script from that source, not from a generic replacement idea. Lock the established story once
verified and accepted, or when the user has delegated faithful reconstruction and the evidence is clear.
Then offer: “Keep the original cast and setting, change the characters, change the environments, or both?”
Use already stated changes without asking again. New appearances, roles, or settings must preserve the
locked cause/effect, sequence, and outcome unless the user explicitly changes the story.
“Keep the original” / “no changes” preserves story, cast and setting; it NEVER skips Stage 2.
Immediately after the story lock, create STYLE.md and show it with 2–3 actual source frames, following
[references/recreation-fidelity.md](references/recreation-fidelity.md). Carry this style into every asset
prompt and Remotion shot; a supplied video is visual direction even when no separate images exist.

**Output:** approved SCRIPT.md, PROJECT.md brief; SOURCE_STORY.md and STYLE.md for recreation.
**Next:** explicit asset-route choice. Both entry routes now follow the same stages.

## Stage 2 of 8 — Cast sheet and asset list (default route)

Default route for every new project (replaces AI character sheets and AI storyboards):

1. Cast sheet (free): render a still from the real SVG rigs showing each character in the story's
   outfit, headwear and colours, front plus 2-3 story poses. The user approves it; what they approve is
   exactly what appears in the film. No AI character sheet: it costs credits, never matches the code
   rig and still needs rebuilding. Exception: a new kind of character the rig cannot draw yet (an
   animal, mascot, object character); then propose one 2D design image first, with its cost, under the
   paid generation rule.
2. Asset list: one table of 3D models (near props) and painted panoramas (far backgrounds) per location,
   listing reused included assets (template `public/`) and new ones with unit cost and total. Wait for an explicit
   yes, then generate, download (result URLs from jobs_wait), compress, and render a ModelSheet preview
   of the new models before building scenes. Report anything that looks wrong and ask before replacing.
3. Code-only (no credits) remains available if the user asks for it; it looks flatter.

The older numbered route question below applies only when the user asks for external image work or a
recreation needs reference plates.

Read [references/asset-production.md](references/asset-production.md),
[references/design-prompts.md](references/design-prompts.md),
[references/assets-and-handoffs.md](references/assets-and-handoffs.md) and the Look targets in
[references/visual-direction.md](references/visual-direction.md).

Every character sheet and environment prompt must:
- fill the Style field with the house-style tokens (bean head, dot eyes, thin stick limbs, ink-dot hands,
  3.5 head-heights, dark-plum outline, flat colours; 3D toon world with ink lines and warm/violet light);
- be text-only: never attach reference images or frames; describe the house style fully in the prompt;
- keep character sheets simple: front, 3/4, side and back plus only the poses the story needs. No
  detailed mascot rendering, feather/fur detail or full cartoon proportions.
Inspect each result against the reference frames (locally, not as attachments) for head shape, shading,
limb thickness, hands and outline before asking for approval; a sheet that does not read as the house
stickman style fails. Sheets guide the design; the film rebuilds the cast as SVG rigs and the locations
as 3D toon scenes per the Quality bar section.
Inspect available tools to establish whether Higgsfield is connected; never claim a connection from its
name in this skill. Check the approved asset library before requesting duplicate assets.

Always present this numbered question unless the user has already explicitly answered it:

1. Generate character sheets + environment plates in Higgsfield (if connected).
2. Give me the prompts; I generate them myself in OpenArt / Higgsfield.
3. I'll upload my own images.
4. Code-only build — a simpler look.

If Higgsfield is unavailable, keep option 1 visible as unavailable and explain the usable alternatives.
Apply the inline service links in cta-display.md when directing users to a service. For a 3D-rendered
source environment recommend 1 or 2 and say plainly that the simple code-only route will look flatter.
Do not promise that an image plate supplies real 3D geometry. Pause dependent visual construction for
this answer; independent source analysis, audio timing and setup may proceed. A prior explicit code-only
choice answers the question; story approval or broad creative delegation does not.

Users may mix routes by category. Images and storyboard generation remain optional; an explicit option 4
or “continue without images” selects the simpler build. Source style still governs it, with accepted
limitations recorded. Never mark an absent reference image as approved.

For routes 1–3, proceed one asset at a time: character sheet per character (front, 3/4, side, back and
key expressions), environment plate per actual location in the source shot's camera angle, then the
cutout poses needed for the shots. Inspect and obtain approval for each generated asset before creating
the next. Use approved existing assets without regeneration. Show the exact prompt, actual reference
attachments and current credit cost before every service generation; follow asset-production.md for
unknown prices and reference-upload failures. Storyboard images remain a separate optional choice.

**Output:** explicit route choice, STYLE.md (recreation), VISUAL_PLAN.md, asset approvals/versions and
requested prompts. A written design suffices for an explicitly selected code-only route.
**Next:** narration and timing; accept early audio immediately.

## Stage 3 of 8 — Narration and timing

Voice is a per-user setting: ask once which voice to use (a Higgsfield voice or element, ElevenLabs, or
the user's own recording), record it in PROJECT.md and reuse it. Never use another user's personal
voice. TTS costs credits, so it falls under the paid generation rule. After generation: tighten gaps
longer than about 0.2 s to about 0.16 s, apply a light atempo if the pace is under about 3.5 words/s,
loudnorm to -14 LUFS.

Use the approved recording, an authorized available voice tool, or provide the script for external voice
creation. Do not require narration to be regenerated when the user already supplied it. Off-screen
narration is not character dialogue and does not imply lip-sync.

Match the house narration pace: about 3.7 words/s with no long pauses. Send TTS text as one block
without paragraph breaks or "...", set a faster speech rate if the engine allows it, and if a take still
has long gaps, tighten pauses to about 0.15-0.25 s before alignment.

Follow `references/story-and-timing.md`: inspect duration, align words or meaningful phrases using an
available tool or actual manual review, and build TIMELINE.json. Duration/silence detection is not verified
word alignment. Mark estimated timing provisional. Keep exact source timing separately for recreation;
a new narration may require different output shot lengths without changing the locked story.

For the reusable starter, compile named narration cues with `scripts/studio.py compile` as described in
[references/starter.md](references/starter.md). Reject missing/ambiguous cues; never infer a word time
inside a phrase estimate. TIMELINE.json remains the numerical authority; preserve alignment provenance.

Respect no-copy audio: use the original file in place or an approved temporary playback mechanism.
Normalization is conditional, not permission to save a conversion. No voice yet → continue visual work;
if the user requests a silent timing draft, label it clearly rather than claiming finished narration.

**Output:** narration reference and measured duration; alignment evidence; TIMELINE.json draft or verified.
**Next:** storyboard planning, with an optional generated storyboard image.

## Stage 4 of 8 — Storyboard plan and optional image prompt

Read [references/storyboard-prompts.md](references/storyboard-prompts.md).
Always make a concise shot plan linking narration, action, characters, locations, and camera composition.
Record reusable action names or custom motion requirements, framing, lighting moods, transitions and
action-extreme review moments. Use `SHOT_PLAN.json` as an authoring input when using the starter;
compile its cue starts to TIMELINE.json rather than maintaining a second independent frame timeline.
Default storyboard (free, mandatory approval step): once the scenes are built (Stage 5), render one real
still per shot from the actual composition with `npm run stills` and show the contact sheet with the
narration line per frame. The user approves framing, cast and props BEFORE the slow full render. Do not
generate an AI storyboard by default; only on explicit request offer an uploaded or generated one.

If a prompt is requested, generate it from the current narration timeline and actual active reference
images. List exact attachments and their roles; use written descriptions for AI-directed categories.
Never imply missing references are attached. A provisional timing draft remains labelled provisional.
When a board is uploaded, inspect panels and map them to shot IDs. Resolve meaningful differences;
keep numeric timing in TIMELINE.json authoritative over any inaccurate generated labels.

**Output:** shot plan and timeline references; optional prompt and reviewed storyboard image/panel map.
**Done when:** a usable shot plan exists. No uploaded storyboard is required to continue.
**Next:** build the animation in Remotion using the plan and any supplied references.

## Stage 5 of 8 — Build in Remotion

Follow the Quality bar and build method section: 3D toon scenes for locations, projected SVG rigs for
the cast, the general rig rules and the pre-delivery still check.
Read [references/production.md](references/production.md). Prepare the actual Remotion project using
`references/setup.md`. Reuse `templates/remotion-starter/` as technical infrastructure, not a style preset; follow
[references/starter.md](references/starter.md). Preserve existing working apps. The bridge remains an
advanced technique example. For recreation follow recreation-fidelity.md and the locked STYLE.md; use
approved environment plates/layers and grounded cutouts when that route is selected. Create BUILD_PLAN.md with per-shot animation instructions, timing, reference
versions, camera, poses, and source components. This is an implementation brief for Remotion, not a
request to generate the final video in an external tool.

Use approved character and environment images when available: extract suitable sprites/poses, use
layered backgrounds/textures, or reconstruct geometry to match the design. A reference sheet is not a
rig or a 3D model. Choose an achievable technique and disclose material differences before replacing
user-directed designs. With an explicit code-only choice, build from the written plan and, for recreation,
the source STYLE.md; do not replace the source look with an unrelated original design.

Choose each character's animation method before requesting additional production assets. For layered
characters use `references/production-assets.md`: prepare real layers/pivots, register derivatives and
inspect reconstruction plus representative extreme poses. Do not force a simple puppet onto actions
requiring unsupported joints. Procedural drawing, separate pose sprites and custom rigs remain valid.

Map storyboard panels (if any), shot IDs, and narration cues to Remotion components. Do not merely store
images in a folder and ignore them. The bridge source is a technique reference, never the authority over
the current story or uploaded designs. Render targeted stills to check appearance before the full motion pass.

Build order per scene: ground and sky, Backdrop, near GLB models, code-built moving parts, lighting and
fog matched to the backdrop, then the 2D cast. Then render the storyboard stills (Stage 4 default) and
get approval before the full render.

**Output:** editable composition, BUILD_PLAN.md, reference-to-component map, approved storyboard stills.
**Next:** full render and preview.

## Stage 6 of 8 — Animated preview

Open Remotion Studio if browser capabilities allow; otherwise provide its working local URL. Build the
agreed preview duration and play/scrub key moments where supported. Show the actual composition, not just
an image prompt or an unrelated sample animation. Do not export an MP4 unless requested or covered by
existing full-delivery authorization; a live Studio preview is a valid preview artifact.

Before presenting any recreation video/preview as a delivery, render 4–5 matched source/output frames,
make and inspect a side-by-side sheet, and fix unapproved mismatches in depth, scale, placement, camera
and palette. Show the comparison with the delivery. See references/recreation-fidelity.md; technical
checks alone cannot pass this gate. If it cannot be completed, report the blocker, not a finished recreation.

Follow [references/visual-checks.md](references/visual-checks.md): inspect opening/middle/ending and
important action/transition extremes, with camera clearance, occlusion and full-pose bounds checks.
Resolve actual defects; document intentional exceptions. A passing sampled report is not full playback
verification. Use optional reference metrics to guide corrections, alongside visual judgment.

Inspect identity, environment, blocking, timing, camera moves, transitions, and readability against the
active references and shot plan. If only stills can be inspected, say playback/sync review is incomplete.
For reference-led choices show representative frame comparisons. For AI-directed choices invite feedback
on the proposed look. Do not silently equate a rough reconstruction with a final design match.

**Output:** working preview link or requested preview file, and concise review findings.
**Next:** targeted refinements, or export if the user already authorized completing the film.

## Stage 7 of 8 — Refine affected shots

Read [references/review-and-recovery.md](references/review-and-recovery.md).
Accept plain-language feedback and localize it to shot IDs, asset IDs, or audio. Update only affected
components/prompts and dependent outputs. Keep successful work and existing approvals. Updated reference
images supersede only the intended version and role; a camera edit need not regenerate character sheets.

If the change is best directed by an optional new image, offer a revised prompt without making it a
requirement. The user may instead direct the change in words. In recreation, a change to the locked story
needs explicit new direction; a visual change that preserves it does not restart script approval.

**Output:** revised Remotion preview and short change summary. If no revisions are needed, skip this stage.
**Next:** sound, final export, and delivery when requested/authorized.

## Stage 8 of 8 — Sound, export, and delivery

Finish sound and export through Remotion following `references/production.md` and
`references/review-and-recovery.md`. Preserve the approved narration. Match the current timeline and
invalidate affected caches. Verify actual dimensions, duration, streams, loudness, and visible transitions.

Provide the final video, editable Remotion project, and DELIVERY.md with checks and limitations. A live
preview is not a final exported file. If storage restrictions prohibit embedding the narration, preserve
those restrictions and deliver an allowed preview/handoff instead. Never claim audio was listened to or
video was played when tools only checked metadata or stills.

## Continue and migration

Resume from evidence, not a remembered stage number. Older projects used a different eight-stage layout;
map existing brief, approved script, voice, visuals, and preview to this workflow without restarting them.
An older code-only preview may continue in AI-directed mode. Do not manufacture image references or
require missing optional assets retroactively. Keep a source-story lock and user's scope changes intact.

## Reference map

| When | Resource |
| --- | --- |
| Service directions or finished deliveries | `references/cta-display.md` |
| Recreation style lock and matched-frame delivery gate | `references/recreation-fidelity.md` |
| Asset-route choice, generation approvals, costs and uploads | `references/asset-production.md` |
| Source-video entry | `references/source-video.md`, `scripts/scan_video.py` |
| Script and narration | `references/story-and-timing.md` |
| Optional character/environment prompts | `references/design-prompts.md` |
| Optional storyboard prompt, all shot plans | `references/storyboard-prompts.md` |
| Asset roles, versions, storage, dependencies | `references/assets-and-handoffs.md`, `templates/PROJECT_template.md` |
| Remotion setup/build/export | `references/setup.md`, `references/production.md` |
| New film starter and narration cue compilation | `references/starter.md`, `templates/remotion-starter/`, `scripts/studio.py` |
| Animation-ready derivatives and optional production prompts | `references/production-assets.md`, `scripts/prepare_rig.py` |
| Scene-aware checks and optional reference comparison | `references/visual-checks.md`, `scripts/compare_style.py` |
| New film starter (3D stickman) | `templates/3d-stickman/` (README, public/ assets, src/shared, src/scenes, scripts) |
| Approved output quality bar | `references/style-frames/` |
| House style (always) | `references/STYLE_BIBLE.md`, `references/visual-direction.md` Look targets, `references/frames/`, `references/sheets/` |
| Visual techniques | `references/visual-direction.md`; historical reports only as needed |
| Revisions and QA | `references/review-and-recovery.md` |
| Behavior examples | `references/workflow-examples.md` |

Before replying: answer the current need, use existing choices, distinguish plans from actual assets,
respect optional steps and storage preferences, state the next action, and apply the milestone CTA rules
above (every milestone delivery, never twice in one response).
Never spend credits without an approved list and total.

## Workflow at a glance (default)

1. Story ideas (5) -> user picks.
2. Script -> approval.
3. Voice (user's chosen voice; paid -> approval) -> gap tightening, -14 LUFS.
4. Timing map: phrases -> shots with frame times.
5. Shot plan: camera, cast, near props, far backdrop, moving parts per shot.
6. Cast sheet rendered from the rigs (free) -> approval.
7. Asset list: reuse the included assets in public/ first; new 3D models (~25 credits each) + panoramas (~2.75 each) ->
   explicit approval.
8. Generate, download, compress, ModelSheet preview -> report problems.
9. Build scenes from the starter: Backdrop, GLB props, code for moving parts, lighting/fog, 2D cast.
10. Storyboard stills from the real scenes (free) -> approval before rendering.
11. Full render (9:16, or 16:9 on request); send each clip when done.
12. Feedback -> free fixes; anything paid goes back to step 7 for approval.
13. Final MP4s with narration.