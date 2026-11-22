# Narration-led shot plans and optional storyboard images

Adapted from Seedance Studio's storyboard structure, camera grammar, continuity and reference-role rules.
The shot plan is always useful for Remotion; an externally generated storyboard image is optional.

## Build the shot plan first

Use the approved script (or locked source story), selected designs or written descriptions, and current
narration alignment. Shot count follows meaningful actions and narration beats, not a fixed 8/10/12-panel
formula. Preserve the requested duration. If timing is not verified, explicitly label it provisional.

For every shot record: stable ID, narration excerpt, start/end, visible action, emotion, camera framing
and movement, characters, location, transition, and active reference versions. Multiple key poses can
belong to one continuous shot. Do not insert cuts merely to make every panel look different.

Default continuation is a Remotion build from this written shot plan. If the user requested a board
prompt or supplied one, use the optional image route below. Never keep asking for a skipped storyboard.

## Assemble references for the image prompt

Read the actual selected images. Number character references first, followed by environment references;
list each exact role outside the prompt. Multiple locations are allowed: specify which reference supplies
each shot's location. A character reference supplies identity, not the sheet's layout or backdrop.

Use text descriptions where a category is AI-directed. No “attach Reference Image 1” without an actual
image. For a hybrid 2D-character/3D-world style, maintain the designed difference while sharing palette,
lighting and visual quality. Do not overwrite selected characters to match an unrelated reference style.

## Optional storyboard prompt

Print the attachment map, then one filled `text` block. Omit unused reference clauses; no placeholders
remain in the delivered prompt. Long boards may use multiple sheets, maintaining shot IDs and references.

```text
Create a clear production storyboard for [title], following the approved story below.
Target film duration: [seconds]. Each shot's frame shape: [project aspect ratio].
Sheet arrangement: [readable panel layout, independent of the individual shot frame shape].
Style: [agreed character and environment rendering traits].

References:
[Image N defines character NAME: preserve its silhouette, proportions, colours, outfit and props.]
[Image M defines location NAME: preserve its landmarks, spatial layout, lighting direction and palette.]
[For any category without an image: the precise written character/location design.]
Reference sheets are design sources only; do not reproduce their extra views, backgrounds or annotations
inside the story panels.

Story: [approved short synopsis, including its actual ending].

Shot/panel plan:
[SHOT_ID / panel ID / time range / narration excerpt as a note outside the picture / visible action /
character IDs / location / camera framing and movement / emotional beat].
[Repeat for the actual planned shots or key poses.]

Keep character identity, outfit, props, environment geography and lighting consistent across panels.
Follow the specified story order. Motion arrows and shot labels belong outside the picture area. Do not
add captions, speech bubbles, new story events, locations or characters unless the plan requests them.
Use readable silhouettes and staging. No watermark, logo, identity drift or unexplained design changes.
```

Timing text in a generated image is a guide, not machine-accurate alignment. Keep full timings and
narration cues in TIMELINE.json/shot records instead of relying on the model to typeset them correctly.
Under the prompt explain how to generate/upload the board, and that the written plan can be used directly
if they prefer to skip the image. Apply `cta-display.md`: service links belong with instructions to use
them; the closing CTA belongs only on a finished requested-result delivery.

## When a storyboard is uploaded

Inspect all panels, identify their order, and map them to shot IDs. Check identities, locations, actions,
framing and missing/extra beats against the approved script and references. Separate sheet margin text
from scene content. If the user supplies a change deliberately, update the relevant plan; otherwise flag
material drift and offer a targeted correction or use of the written plan. No compulsory regeneration.

Confirm timing from narration, not OCR of board labels. Use the panel's composition/key poses in
BUILD_PLAN.md and the corresponding Remotion scene. A board is direction for animation; showing its
whole sheet on screen or simply zooming each panel is an animatic, not a fully animated character scene.
Label an animatic if that is the requested test output.

## Handoff to Remotion

For each shot supply an animation brief: actual reference IDs/versions; board panel if any; starting pose,
main action and ending pose; narration cue/time; camera start/end; transition; continuity constraints;
required assets and their implementation. Use the video-prompt discipline of explicit sequence and
movement, but address the Remotion implementation. Do not ask the user to generate video in OpenArt or
another video model as the default next step. The animation appears in Remotion.
