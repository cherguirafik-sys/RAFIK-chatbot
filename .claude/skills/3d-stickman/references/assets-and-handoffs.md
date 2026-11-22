# Project state and asset handoffs

PROJECT.md is the single human-readable record of decisions, active assets, shot dependencies and
progress. TIMELINE.json owns numeric timing. BUILD_PLAN.md maps those decisions to Remotion components.
These records are assistant-maintained. The optional library CLI copies explicitly authorized, selected
versions and writes ASSETS.json; it does not inspect or approve images. Keep records aligned.

## Optional paths

Track character sheets, environment sheets and storyboard images independently:

- `service generation`: generate through the selected connected service, with prompt/cost disclosure
  and approval per asset; follow asset-production.md.
- `code-only`: explicitly selected simpler route; written design/shot plan is enough. No new image is
  expected, but uploaded source videos still determine the reference look and accepted limitations.
- `AI-directed`: legacy record label; retain existing projects, but do not infer a new code-only choice
  from broad delegation. Record the actual numbered Stage 2 route for new work.
- `existing references`: inspect the actual supplied images and use the selected versions.
- `prompt then upload`: a prompt is delivered; wait only if the user chooses to return with generated
  images before dependent work. An explicit skip/continue without images selects code-only for this
  category; explain the simpler look and preserve the source style target.

Optional does not mean ignored: when an image is supplied as direction, use it downstream. When no image
exists, do not fabricate an image ID or attach line. Record written designs separately from media assets.

## Media register

Use stable IDs such as CHAR_PIP, ENV_GARDEN, BOARD_A, VOICE_MAIN, SOURCE_01. Each record includes:

| Field | Meaning |
| --- | --- |
| ID and version | Stable role ID; increment version on replacement |
| Type / role | Character identity, environment layout, style only, storyboard, narration, source video |
| Locator | Actual accessible file, upload reference or original path; never a guessed filename |
| Storage | Project copy allowed, reference-only/no-copy, or conversation-only |
| Status | received, inspected, selected, superseded, or unavailable |
| Evidence | Observed traits; uncertainties; how selection was authorized |
| Used by | Shot IDs and build components that use this version |

A written design may have a design ID, but never label it an uploaded image. “Selected” means the user
provided it as their direction, chose a candidate, or delegated a selection that was inspected and stated.
For newly generated production assets, explicit per-asset user approval is required before the next
asset is generated; broad delegation does not skip this checkpoint. Record the prompt, quoted credit
cost, generation authorization and result approval separately. Receiving several candidates does not make all of them active. Do not silently replace the entire cast
when a new image arrives. Keep prior versions available if storage permits.

## Inspect and bind

1. Inspect each input. Identify its intended role from context; ask only when ambiguous.
2. Check consistency with the approved story and other selected inputs. Separate identity, style,
   location geometry, shot framing, and timing so a character sheet's background cannot become the set.
3. For a meaningful conflict, briefly identify it and resolve use-the-image versus keep-the-plan. An
   explicitly requested revision is already authorization to adopt that change.
4. Register the active version, then attach that ID/version to each affected shot.
5. Generate prompt attachment numbers afresh for that output from the stable IDs. Numbers are local to
   the output and must match the actual attachments; never depend on an ambiguous “Image 2 from earlier”.
6. In BUILD_PLAN.md record the asset use: sprite/pose, texture, layout reconstruction, palette/lighting,
   or panel composition. Link the implementing component. Referencing a filename without applying it is
   not completion. If a reconstruction departs visibly, state and review the difference.

## Authority by role

Explicit user changes govern. The accepted script/source-story lock controls plot and dialogue;
selected character references control identity; selected environment references control spatial design;
selected storyboard panels control shot framing and order within the approved story; validated narration
alignment and TIMELINE.json control time. A generated board's inaccurate labels do not overrule the
recording. Conflicts are surfaced, not silently settled by whichever input arrived last.

## Shot dependencies

Each shot tracks ID, narration cue, character IDs/versions, environment ID/version, optional board/panel,
action, camera, start/end frames, and implementation component. Empty reference lists are valid for
AI-directed categories. One multi-panel board may supply several shots; one shot may have multiple key
poses. Do not count key poses as extra cuts unless the shot plan actually calls for cuts.

On changes, find shots referencing the changed role/version. Mark only their dependent work `needs
update`; include neighboring transitions where relevant. A global style change may affect all shots;
a different camera in one shot usually does not. A new narration can shift later shots even when only
one sentence changed. Keep the story lock unless explicitly changed.

## Storage and resume

Save lightweight records only where permitted. A no-copy request prohibits copying/converting the media
or embedding it in a persistent export without permission covering that use. Read it in place; local
streaming for an authorized preview may be used without disk caching. If that is unavailable, state the
limitation and provide the allowed handoff. Do not convert all audio merely because the old example did.

When files are inaccessible across sessions, ask for the missing required item or permit an optional
reference to be skipped. If the user disallows all persistence, keep a conversation summary and do not
claim a durable saved project. Resume based on actual records/artifacts, not the previous stage numbering.

## Reuse across films

Keep an optional channel library alongside separate film folders:

```text
channel/
  library/CHAR_HERO/v1/asset.json
  library/CHAR_HERO/v1/files/rig.json
  films/episode-one/
  films/episode-two/
```

Before generating an asset, check the selected library for a suitable version. Preserve existing
identity and user choices; reuse is not permission to ignore a new requested design. A library may
contain characters, expression sets, environment layouts, props, materials or style presets.
Each film retains separate script/audio/shot plan/timeline/exports and pins exact versions.

```bash
python3 scripts/studio.py library-list /path/to/channel/library
python3 scripts/studio.py library-add /path/to/channel/library CHAR_HERO v1 /path/to/prepared-rig --role character --copy-allowed
```

`--copy-allowed` records actual authorization; it does not obtain permission. Do not use it for
reference-only media. Import status is `received`. Inspect the asset and its preparation previews,
then record selection evidence in PROJECT.md and set its asset.json status to `selected` only when
selection is supported by the user's input or delegated choices.

```bash
python3 scripts/studio.py library-use /path/to/channel/library CHAR_HERO v1 /path/to/film
```

This verifies the registered file hashes, copies that exact selected version under
`public/library/CHAR_HERO/v1`, and records its version in ASSETS.json. Bind its rig/texture/model path
to the intended SCENE.json role and verify a rendered frame. Copying alone is not downstream use.
An existing version cannot be overwritten: create v2 and explicitly update affected film references.
Projects keep their selected version when the library changes. For no-copy inputs retain locators and
storage rules in PROJECT.md; skip the copying CLI and use an allowed in-place route.
