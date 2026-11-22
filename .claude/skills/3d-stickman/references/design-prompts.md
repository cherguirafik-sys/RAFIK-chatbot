# Optional character and environment direction

Adapted from the supplied Seedance Studio's character-sheet and environment prompt methods for this
Remotion workflow. This file is self-contained; do not load or change the separate skill. Its standalone
five-background menu and other modes do not apply here.

## Choose control independently

First complete the numbered Stage 2 choice in SKILL.md. Characters and locations each use one of:
`service generation`, `prompt then upload`, `existing references`, or `code-only`. These may be mixed.
Follow asset-production.md for ordered assets, per-asset approvals, prompt/credit disclosure and uploads.
In recreation use STYLE.md and the source frames; no separate image does not mean no visual reference. For example, an uploaded character can live in an AI-designed garden. A request to
skip images never blocks animation. If the user requests prompts, provide them instead of calling an
image-generation service automatically. A prompt is not a generated asset.

Extract the cast and locations from the approved script and, for recreation, SOURCE_STORY.md and STYLE.md.
Environment production plates must match the source shot's camera angle; a multi-view design sheet is
not a finished background plate. Obtain plate approval before preparing the shot-specific cutout poses. Reuse
existing names and roles; design new traits only where unspecified. Preserve the user's visual direction.
For 2D characters in 3D environments, lock a coherent palette, line weight, and lighting while preserving
the intended difference in medium. Do not force everything into one medium merely for consistency.

## Character sheet prompt

One prompt per distinct character; never combine unrelated characters into one ambiguous reference.
Reuse front, three-quarter, side, back, expressions, silhouette, proportions, outfit, material, and prop
continuity from the existing Seedance method. Adapt anatomy to the subject; a seed need not have hair,
clothing, or human facial anatomy. Use a neutral turnaround pose to make later reconstruction practical.

Print a heading naming the character and exact attachments, followed by one filled `text` block:

```text
Create a detailed character design sheet for [character name and story role].

Identity: [silhouette, proportions, face/eyes, markings, colours, outfit and story-required props].
Personality and movement: [traits visible in the approved script; posture, expressions and movement habits].
Style: [approved medium, line treatment, palette, shading and surface details].

Show the SAME character in clearly separated full-body front, three-quarter, side and back views, at a
consistent scale, plus useful expression studies for [specific story beats]. Keep the turnaround poses
neutral and readable. Place optional material/prop details separately from the full-body views. Use a
clean uncluttered background and an organized production-sheet layout; notes must not cover the character.

[If a character reference is attached: Reference Image N defines this character's identity. Preserve its
visible features; complete unseen views consistently without treating invented details as observed facts.]

Maintain identical proportions, silhouette, markings, colours, outfit and accessories across all views.
No extra characters, duplicate body parts, identity drift, watermark, logo or blurred details.
```

Replace every placeholder; omit irrelevant anatomy and absent attachment clauses. If clean extracted
poses will be used as animation cards, request separable poses and no ground/background merged into them.
A sheet does not automatically provide rigging or transparency; verify the returned image.

Under the prompt: “Generate this in your image tool and upload the result to use it as the character
reference. You can also choose the simpler code-only route.” Apply `cta-display.md` for service links
and whether this is a finished prompt delivery eligible for the closing CTA.

## Environment sheet prompt

One prompt per actual story location. A sheet shows multiple views of the SAME location, not five new
places. Specify landmark positions, entrances/exits, character scale, action space, and the props needed
for the story. For recreation, maintain plot-critical spatial relationships even after a setting change.

```text
Create a cohesive environment design sheet for [location name], the setting for [story beats].

World and style: [approved environment medium, palette, surfaces, lighting, weather, time of day].
Fixed layout: [major landmarks and their spatial relationships, entrances, scale, ground levels].
Required props: [objects actually used in the script].

Show a wide establishing view, a reverse or side view, a simple overhead layout, and a useful detail view
of [story-critical action area]. All panels depict the SAME place with unchanged architecture, landmark
positions, proportions, lighting direction and materials. Leave clear space for the characters' actions.
No characters appear in the sheet unless specifically requested.

[If attached: Reference Image N supplies the character's rendering/style compatibility only; do not copy
its sheet layout, studio backdrop, extra views or character into the empty environment.]
[If an existing location is attached: Reference Image M defines this location's layout and design.]

Use clear panel separation. No inconsistent geography, warped perspective, floating props, watermark,
logo or characters accidentally copied from a character reference.
```

For a user who prefers standalone backgrounds, reuse these fields from Seedance's existing format:
`background_name`, `camera_angle`, `framing`, `lens_mm`, `environment`, `scene_purpose`, `location_cues`,
`lighting`, `prompt_text`, `negative_prompt`. One JSON object per requested view; the number follows the
story, not a compulsory set of five. Do not output JSON and a sheet prompt for every location unless useful.

## Intake of generated images

Follow assets-and-handoffs.md. Read the image, not just its filename. Record which character/location it
represents, its actual visible traits, active version, and any mismatch with the prompt. Sheet layout and
annotations are not parts of the film's world. If multiple alternatives arrive, ask which to use unless
the user already selected one. Newly generated production results require explicit approval per
asset-production.md. Missing optional results remain a written design only after the user selects that route;
never say they were uploaded or applied.

## Quick check

Each requested prompt comes from the current script, names exactly one character/location, states the
required views and continuity, uses only real attachments, and ends with a useful next action.
Apply the service-link and finished-delivery CTA rules in `cta-display.md`.
Do not ask users to generate images they elected to skip.

## From reference sheets to production assets

A design sheet establishes identity/layout; it need not be directly extractable. When the selected
animation method needs isolated poses, expressions or layers, use production-assets.md for the
separate cutout/expression prompts and preparation check. That reference also provides optional
texture, important-prop and backdrop prompts. Do not add those generation steps by default or
request assets that an existing approved library/procedural component already supplies.
