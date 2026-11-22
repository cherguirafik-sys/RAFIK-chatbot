# Cartoon Shorts Studio — project record

Use the film's working folder, not the reusable skill folder. Fill from actual inputs; unknown or not
created is preferable to an invented asset. If saving is disallowed, keep this record in the conversation.
For field definitions and dependency rules see references/assets-and-handoffs.md in the installed skill.

## Brief and story
- Title / slug:
- Entry route: new story / recreate existing video
- Story or fiction/factual classification:
- Audience / narration language:
- Target duration / measured voice duration / output duration:
- Scope: full story / selected excerpt / short test
- Approved script version and approval or delegated authorization:
- Source-story lock version / evidence / accepted changes (recreation only):
- Source-role to remake-character map (recreation only):
- Source-location to remake-location map (recreation only):
- Visual direction, including character/environment medium:
- Frame shape / fps / preview and export dimensions:
- Captions / music / effects preferences:

## Style lock (recreation)
- STYLE.md / source-frame IDs and timestamps (2–3 shown to the user):
- Environment and character medium; materials/line weight/palette/lighting:
- Camera height/angles, framing and motion:
- Character-to-set scale, ground contact, facing and action pose:
- Requested changes and explicitly accepted limitations:

## Creative control — independent choices
- Stage 2 numbered options offered / explicit answer (1–4 or category mix):
- Connected service capabilities actually verified:
- Source 3D environment: recommendation and code-only limitations explained:
- “No changes” applies to story/cast/setting, not an inferred code-only answer:


| Category | Mode: service generation / prompt then upload / existing references / code-only | Current choice / expected input |
| --- | --- | --- |
| Character sheets | | |
| Environment sheets | | |
| Storyboard image | | |

- Offers already answered or skipped:
- Any selected wait for an external image; or instruction to continue without it:
- Written design IDs for categories with no images:

## Storage and capabilities
- Working folder / skill folder:
- Source media may be copied? Per-asset exceptions:
- Narration storage preference:
- Derived frames/crops may be saved? Export may embed source media?
- Remotion entry / composition / preview URL:
- Starter/custom app route and supported animation methods:
- Setup checks and outstanding limitations:
- Timing capability and verification method:

## Asset register

Only actual media goes here; a prompt or written design is not an uploaded image. Add one row per
role/version. Keep local prompt attachment numbers separate from these stable IDs.

| ID / version | Type and role | Actual locator | Storage permission | Status | Observed traits / selection evidence | Used by shots/components |
| --- | --- | --- | --- | --- | --- | --- |

## Sequential asset approvals

| Asset ID/version | Prompt and reference attachments | Model/settings and quoted credits | Generation authorized | Result approved | Next asset |
| --- | --- | --- | --- | --- | --- |

- Current step: character sheet / environment plate / cutout pose:
- Upload failure and confirmed widget/manual-upload fallback, if any:

## Prepared assets and reusable library
- Library location and selected pinned versions / ASSETS.json:
- Per-character animation method and required joints/pose sprites:
- Source reference -> prepared derivative -> rig/component mapping:
- Pose preparation preview, inspected extremes and remaining limitations:
- Optional materials/props/backdrops requested or skipped:

## Shot dependencies

TIMELINE.json owns numeric output timing; link its revision here. Source times are separate if recreating.
Empty image-reference columns are valid when AI-directed. A storyboard image is optional.

| Shot ID | Narration cue | Character/design IDs + versions | Environment/design ID + version | Optional board/panel | Remotion component | Status |
| --- | --- | --- | --- | --- | --- | --- |

- Timeline revision / alignment status:
- SHOT_PLAN.json / ALIGNMENT.json locations and compile hash (if using starter):
- Source beat IDs and source times (recreation):
- Source-to-output beat mapping:
- BUILD_PLAN.md location:

## Progress

Use: not started, in progress, waiting for selected input, blocked, complete, or needs update.
Do not mark a stage blocked merely because an optional image was skipped.

| Stage | Status | Evidence / artifact |
| --- | --- | --- |
| 1 Story and script | not started | |
| 2 Visual direction; optional design prompts | not started | |
| 3 Narration and timing | not started | |
| 4 Shot plan; optional storyboard image | not started | |
| 5 Build in Remotion | not started | |
| 6 Animated preview | not started | |
| 7 Refinement (skip when unnecessary) | not started | |
| 8 Sound, export and delivery | not started | |

## Review and revision
- Preview reviewed / not checked aspects:
- Preflight report/contact sheet; action/transition sample frames:
- Unresolved flags / reviewed intentional exceptions:
- Recreation comparison sheet: 4–5 source/output timestamp pairs, inspected before delivery:
- Depth, scale/placement, camera, palette findings; fixes and explicitly accepted differences:
- Selected reference comparisons, measured differences and limitations:
- Changes requested and affected shot/asset IDs:
- Superseded versions and dependent outputs needing update:
- Current preview approval or authorized automatic continuation:
- Final export requested/authorized:
- Delivered files / DELIVERY.md:

## Resume here
- Current action and exact next action:
- Missing required inputs or capabilities:
- Selected optional inputs being awaited; explicit fallback if skipped:
- Known limitations and unresolved conflicts:
