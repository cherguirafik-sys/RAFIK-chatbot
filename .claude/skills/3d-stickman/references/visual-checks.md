# Scene-aware preview checks and reference comparison

Use inside Stages 5–8. Mechanical checks support direct image/playback review; they do not certify
acting, beauty, timing accuracy or reference fidelity. Keep the existing final video/audio QA.

## Before building every shot

Inspect a character preparation sheet when using a new rig or major pose change. Test the actual action
extremes (reach, crouch, stride, turn, fall), not only a standing pose. Plan camera clearance around large
props. Mark the intended subject and any intentional occlusion, silhouette, insert or blackout.

## Starter preflight

Run `npm run typecheck` and `npm run check` in a starter-based film. The checker validates scene/asset
references, rejects a stale compiled timeline, and renders the first/middle/last frame of each shot plus
event and `reviewAt` samples. Read the generated contact sheet AND report.

| Flag | Meaning / first inspection |
| --- | --- |
| CAMERA_INSIDE_PROP | Camera inside an object's axis-aligned bounds; inspect camera path/prop placement |
| CAMERA_UNDER_GROUND | Lens below ground plane |
| SUBJECT_CLIPPED | Some of the pose's alpha bounds project outside the image; includes hands/feet |
| SUBJECT_OCCLUDED | Ray toward the upper character region intersects tagged scene geometry |
| SUBJECT_BELOW_GROUND | Some of the projected sprite's bounds fall below the ground |
| DARK_FRAME / BRIGHT_FRAME / FLAT_FRAME | Coarse image statistics warrant visual inspection |
| PROBE_MISSING / BROWSER_ERROR | Technical check incomplete; fix the instrumentation/load error |

Bounding boxes and rays are conservative approximations. Transparent cards, hollow GLBs, intentional
foreground occlusion and pitched billboards can produce false positives. Inspect the actual frame.
Fix real defects; for a reviewed intentional condition, record a specific reason under
`SCENE.json.qa.exceptions`, e.g. `{"shot":"S08","flag":"DARK_FRAME","reason":"Approved fade to black"}`.
Do not blanket-suppress warnings, or accept a browser/probe failure as an artistic exception.
Unresolved flags produce a nonzero exit code. A passing report means only those sampled checks passed.
The checker writes fresh output folders and does not delete earlier reviews.

Add samples at the worst action/transition moments. A fast movement can fail between three sampled
frames. Inspect a short motion passage and listen to narration using available capabilities. If playback
is unavailable, record it as not checked. Do not mark alignment verified because frames render.

For existing projects, use the same review protocol and integrate suitable probe functions into their
own renderer. Do not replace their scene just to use the generic starter. Existing short_qa.py provides
complementary whole-video freeze/pop/colour/audio checks, with its documented limitations.

## Reference comparison

For recreation, follow recreation-fidelity.md: before each preview/video delivery render 4–5 frames
matched to source timestamps (or explicitly mapped beats for retiming), assemble and inspect a side-by-side
sheet, fix unapproved differences, and show the sheet with delivery. Record depth, scale/placement,
camera and palette findings. The single-frame metric below cannot replace this gate.
For other reference-led builds, compare a representative rendered frame with a matching reference view. If needed crop comparable regions using an authorized image workflow; a
close-up and a wide landscape have different colour statistics even when their style matches.

```bash
python3 scripts/compare_style.py rendered.png selected-reference.png -o comparison.json
```

The tool reports brightness, contrast, dark/highlight percentiles, saturation, dark-region tint, an
edge-density proxy and near-black share, then suggests likely controls to inspect. It does not detect
identity, exact outline thickness, semantic shadows or emotional quality. Measure the revised frame
again only when a change or unresolved concern warrants it. Keep approved deliberate differences.

Style targets belong to the current project or a named optional library preset. Record their source,
measurement method and uncertainty. Do not impose another channel's duration, captions, script formula,
cut frequency, colour numbers or camera motion on every film. Retain useful existing style research;
separate historical observations from the current approved look and actual implementation settings.

## Required review evidence

PROJECT.md/DELIVERY.md record timeline revision, active asset versions, checked sample frames, unresolved
or accepted findings, observed reference differences, and playback/listening status. "Command exited
successfully" is not a substitute for inspecting the pictures or documenting review limitations.
