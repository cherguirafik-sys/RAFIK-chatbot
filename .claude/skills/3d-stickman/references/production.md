# Scene construction, previews, audio, and export

Read after the brief/script and setup route are known. Work in the film project, not the reusable skill.
The files in `templates/bridge/` and `templates/audio/` are a worked film example, not a generic engine.

## Reference-driven Remotion implementation

Remotion is the endpoint for both new stories and source-video recreations. Do not route the default
animation step into an external AI-video service. Image prompts provide optional design direction;
characters, backgrounds and animation are still implemented in the Remotion composition.

For a new project, reuse the generic Remotion starter's timing/loading infrastructure where useful.
Its simple demo visuals are not a recreation style preset. A reference requiring detailed rendered
landscapes must not become striped boxes merely because the starter can draw them. Keep existing apps
and choose scene components from the approved asset route and STYLE.md, not the easiest default.

Before building, read PROJECT.md, SCRIPT.md, TIMELINE.json and the written visual/shot plan. Also read
SOURCE_STORY.md and STYLE.md for recreation and inspect the source frames plus approved assets.
Confirm the explicit Stage 2 answer before building. Only categories explicitly chosen code-only use
written designs without new assets; missing images alone are not permission to choose that route. Never ignore selected
images or replace them with a generic code drawing just because it is easier to render.

Create BUILD_PLAN.md, one entry per shot: ID, narration cue, source beat if any, current time range,
reference IDs/versions, storyboard panel if any, starting pose, main action, ending pose, camera move,
transition, and implementing component. This is the animation-production brief for the coding agent.

For the approved plate/cutout route follow recreation-fidelity.md: layered environment plates, bounded
parallax/push-ins, grounded characters with matched scale and shadows, separate smoke/sparks/captions
where called for. Preserve source camera angles and action poses. If a camera movement exceeds what
plates can support, obtain another angle or use suitable geometry rather than inventing unseen detail.

Choose the implementation based on the available assets and requested look:

- Character sheets: use suitable isolated poses as textured cards, separate layers where appropriate,
  or reconstruct the character in code to match the selected design. Do not render the entire sheet as
  one character. Back/side views guide turns; a sheet does not contain an automatic rig. Missing views
  can be designed consistently unless the user specifically wants to supply them.
- Environment sheets: use a chosen view as a background when the camera permits, layer it for limited
  parallax, or reconstruct geometry/textures to match landmarks and layout for a moving 3D camera.
  A single background cannot reveal unseen geometry automatically. Offer an extra reference prompt only
  if useful; it is not a mandatory task for the user.
- Storyboard images: use panels as framing/key-pose direction, preserve their approved sequence, and
  animate between intended poses. Multiple panels may belong to a continuous shot. Displaying cropped
  panels with pans is an animatic; label that if chosen instead of a fully animated scene.
- Explicit code-only choice: implement the written plan and source style with disclosed limitations.
  Missing additional images never erases the uploaded video's visual direction. Do not call a simpler
  approximation a faithful style match.

Follow production-assets.md to distinguish design references from animation-ready derivatives.
Inspect reconstruction and important motion extremes before propagating a new rig across shots.
Store reusable approved derivatives as exact library versions; never overwrite an earlier film.

Record actual usage in the asset register and compare a rendered frame against the relevant reference.
Material design deviations need to be stated and resolved, not hidden behind a successful render.
Preserve original sources; save derived sprites/crops only within the user's storage permissions.
If images or audio are reference-only, do not silently copy them into public/ or cache conversions.

Setup and technical tests happen behind the creative workflow. Inability to run Remotion is a real
build blocker; missing optional sheets or boards are not. Keep all successful design/script work.

## Adapt the example deliberately

| Files | Reusable technique | What changes for a new film |
| --- | --- | --- |
| `story.ts` | Shot/camera interpolation, transition helpers | Duration, beats, camera keys, light selection, all story physics/events |
| `build.ts`, `world.ts` | Procedural geometry, layout, per-frame posing | Locations, props, blocking, actions, asset paths |
| `toon.ts`, `cast.ts` | Canvas2D character drawing, cards, expressions | Character designs, roles, poses, entrances, and action timing |
| `lights.ts`, `shade.ts`, `paint.ts` | Lighting, shading, painted textures | Approved palette and setting-specific materials |
| `cardshade.ts` | Character scene lighting and contact shadows | Scale and lighting appropriate to the new characters |
| `Bridge.tsx`, `ink.ts`, `lensblur.ts`, `grade.ts` | Composition and effects | Exported component, scene wiring, shot-dependent settings |
| `audio/` | Synthesis and mixing utilities | Music arrangement, cues, events, sections, duration, and levels |

Keep example source available for comparison. For a different subject, replace bridge geometry, crowd
roles, collapse simulation, swing, soldiers, and tourists wherever they occur. Renaming `BridgeShort`
alone is insufficient. Test the registered component and its duration in the working app.

Use `references/visual-direction.md` for starting presets. Characters remain camera-facing cards on
NOINK so world outlines do not outline them twice. Keep world ink as its own pass before lens blur;
then bloom, neutral tone mapping, and grading. Scale pixel parameters with output resolution. Keep
film grain off by default. Inspect camera clearance and prop readability after camera changes.

## One timing authority

Build scene and audio from the current TIMELINE.json revision. The legacy `audio/timeline.py` manually
mirrors `story.ts` and `cast.ts`; it does not update itself. Prefer generating the required data from the
canonical timeline. If adapting manually, compare fps, total frames, shot boundaries, transitions, and
effect cues before rendering. Do not carry the original marching or collapse sounds into another story.

## Preview before a full render

Create output directories. Use the actual installed CLI/help or adapted renderer helper, with the actual
entry and composition ID. Render selected frames: opening, key action, closest face, widest shot, each
lighting change, important transition, and ending. Then render a short motion segment with a meaningful
action or transition. A still alone cannot establish motion quality.

Use visual-checks.md for scene-aware checks and optional reference metrics. Include first/middle/last
frames and action/transition extremes. Review flags in context, fix real defects and document deliberate
exceptions. Never treat a zero exit code or three clean samples as certification of all motion.

Inspect the images/video using available tools. If only still inspection is possible, say motion/audio
review remains incomplete. Save concise findings and corrections. Reuse successful setup checks;
do not repeatedly install dependencies or rebuild the environment for ordinary visual revisions.

Recreation deliveries require the 4–5 matched-frame comparison gate in recreation-fidelity.md, including
inspection and correction before sending the preview. The helper `templates/scripts/sbs_sheet.py` can
create side-by-side comparison sheets. Read its usage
before running. Use suitable approved visual references and keep story content original.

## Sound

When using the example mixer, adapt its input paths to the actual audio and storage permissions. Its
default expects `voice/` beside `audio/`, but this is not permission to copy a reference-only recording. Adapt timeline, report sections, music arrangement, event generation, and
duration to this film. Run a short test before the full synthesis.

`mix.py` caches `music_raw.npy` and `sfx.npy` by filename, not by content. After changes to timeline,
music, SFX, or their parameters, invalidate only this project's affected caches or implement input-hash
cache keys. Merely rerunning the script can reuse stale sound. Never sweep unrelated cache folders.

The example targets approximately -15 LUFS integrated with a limiter ceiling of -1.2 dBTP. Use these
as starting values, then verify narration intelligibility and actual peaks. Do not blindly apply “music
+3 dB / SFX -6 dB” to unrelated inputs. Render the final mix at 48 kHz to exactly the film's duration,
and save stems and cues when generated. Intentional silence is acceptable; missing narration is not.

## Export

Export when requested or covered by the user's full-delivery authorization. Otherwise a working Studio
preview satisfies a preview request. Do not export embedded reference-only audio against a no-save
instruction. Use the project's actual entry, composition, and output paths. Inspect the installed CLI's supported
options rather than relying on a stale global version. Starting delivery settings are H.264, CRF 16,
30 fps, with a 1080×1920 composition scaled to the agreed 1440×2560 output. Verify actual pixel dimensions;
do not assume a rounded scale factor guarantees the requested size on every setup.

Mux the final mix explicitly: use the rendered video as input 0 and mix.wav as input 1, select
`-map 0:v:0 -map 1:a:0`, copy the video stream when compatible, and encode suitable delivery audio.
Check both input durations before muxing. Do not use a truncating option to hide mismatched durations.
The example composition has no narration track; do not trust whatever audio stream the render contains.

Inspect the finished file with ffprobe and the checks in review-and-recovery.md. Save exact commands,
source/timeline revision, settings, final file path, and review limitations in DELIVERY.md.

## Legacy helper boundaries

- `bridge-stills.mjs`: Windows browser and BridgeShort are hardcoded. Adapt or use the working CLI.
- `bridge_shots.py`: regex-based, bridge-specific, assumes 30 fps, and writes `out/bridge/shots.json`.
  For new projects, export QA metadata directly from TIMELINE.json instead of parsing TypeScript text.
- `bridge_merge.py`: placeholder root and bridge-specific paths. Do not run unchanged. A normal single
  assistant workflow does not need sandboxes or merging. If explicitly using parallel workers, assign
  separate files, review changes, and preserve a backup before merging in the actual project.
- `sandbox_index_example.tsx`: registers the bridge_world example only. It is not the missing main app.
- `short_qa.py`: diagnostic report, not an automated certification; see review-and-recovery.md.

Old performance figures in the reports are measurements of one machine and one scene. Estimate time
and storage from this project's test render instead of promising the original timings.
