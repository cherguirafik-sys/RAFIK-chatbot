# Optional production assets and character preparation

Use within Stages 2 and 5, after the story and animation method are known. Design sheets establish
appearance; production assets must also be usable by the selected animation technique. All external
images remain optional. Use existing references or procedural components when appropriate. Never
require a provider, fixed model, fixed expression count, or different anatomy for convenience.

## Choose an animation method before requesting more images

Record the choice per character in PROJECT.md and BUILD_PLAN.md:

| Method | Useful when | Check before building all shots |
| --- | --- | --- |
| Procedural articulated drawing | AI-directed designs; flexible poses such as boxing | Joint limits, hands/feet, silhouette, extreme poses |
| Prepared image layers | Approved cutout; separable limbs; supported joint structure | Layer edges, attachment pivots, occlusion order and extreme poses |
| Separate pose sprites | A small set of expressive or nonhuman poses | Matching scale, baseline, identity and transition between poses |
| Custom rig / 3D reconstruction | Turns, depth or interactions exceed a flat card's limits | Reference fidelity and actual movement capability |

Do not apply a shoulder/hip-only puppet to elbow/knee actions. Optional joint parenting is supported by
the starter's layer renderer; a more complex rig or a custom component remains valid. A sheet does not
provide hidden anatomy, transparent layers or automatic rigging. Explain meaningful compromises before
substituting the approved appearance. Keep source references and prepared derivatives as separate assets.

For service generation, follow asset-production.md: source style and approved designs remain attached,
show prompt/credits before each job, and obtain approval of each result before the next asset.

## Cutout prompt (only if layered animation is selected)

Fill from the accepted design. Attach its actual selected image if available.

```text
Prepare ONE animation-ready full-body cutout of [character], preserving [identity, proportions,
colours, costume and rendering style]. Show [needed view] in a neutral [pose]. Keep the entire figure
visible, with generous margin. Separate the arms from the torso and the legs from each other so the
required joints [list] are readable. Keep important props separate when they need independent motion.
Use clean edges and consistent line weight. No scenery, labels, floor shadow or background merged into
the character. [Request transparent background if the chosen tool supports it; otherwise specify a
plain contrasting background for a separate removal step.] Do not change the approved anatomy.
```

## Expression/pose set prompt

```text
Create [number] separate [heads/poses] of the exact same [character]. Expressions/poses in reading
order: [story-specific ordered list]. Preserve head shape, costume, colours, view, scale and line
weight. Use clearly separated cells with generous empty margins. Each cell must show the full required
part, without neighbouring content, ground shadows, scenery or labels. Keep expression changes within
the same head silhouette where possible so they can share an attachment point.
```

No compulsory six-cell sheet. Align replacement heads to the same layer dimensions and neck pivot;
inspect them instead of stretching differently proportioned heads blindly.

## Prepare and inspect layers

`scripts/prepare_rig.py` is a deterministic crop/assembly helper, not automatic segmentation or a
background remover. Inspect the actual cutout, define crop boxes and optional polygon masks, or provide
already isolated layer files. Use an available image-editing route when a clean layer needs repair.
Only make derivatives when storage permissions allow them.

A preparation JSON uses source-canvas pixel coordinates, top-left origin. Layer order is drawing order.
`parent` names another layer; children inherit its transform before their own. Include elbows/knees
only when corresponding artwork exists. `poseTests` must include the film's important motion extremes.

```json
{
  "source": "source.png", "size": [600, 1000], "feetY": 960,
  "layers": [
    {"id": "body", "box": [220, 350, 160, 400], "pivot": [300, 720]},
    {"id": "head", "box": [180, 80, 240, 270], "pivot": [300, 350], "parent": "body"},
    {"id": "upperArm", "box": [380, 370, 60, 150], "pivot": [390, 390], "parent": "body"},
    {"id": "forearm", "box": [420, 490, 60, 160], "pivot": [435, 510], "parent": "upperArm"}
  ],
  "faces": {"surprised": {"layer": "head", "file": "surprised-aligned.png"}},
  "poseTests": [{"name": "reach", "angles": {"upperArm": -70, "forearm": -35}}]
}
```

This illustrates the format, not a complete character. Supply the actual parts and measurements; do
not apply these boxes to an arbitrary image. A layer may use `file` instead of cropping `source`; its
pixel dimensions must match `box`. `polygon` is an optional list of source-coordinate [x,y] vertices.

```bash
python3 scripts/prepare_rig.py /path/to/preparation.json /path/to/new-character-version
```

Inspect `preview.png`: original, separated layers, reconstruction, and each requested pose. Check
joint gaps, missing pixels, overlaps, expression alignment, silhouette, clipping and contact with the
floor. The helper checks structure; a successful command does not mean the rig looks correct.
Copy an approved derivative into a permitted project `public/` location or register it in the library.
Set the character's `rig` to its public-relative `rig.json` path. The Remotion starter actually loads
these layers and named expressions; it does not display the whole design sheet as a character.

## Material texture prompt

```text
Seamless tileable [surface] texture matching [approved environment style and palette]. Flat straight-on
view, evenly lit, edge-to-edge pattern, consistent scale. [Specify useful material detail and restraint.]
No perspective, cast shadows, vignette, foreground objects, text or logos. Keep the seam unobtrusive.
```

Use on the intended surface and inspect tiling at the actual camera distance. Procedural materials are
valid; do not generate every wall or small prop separately.

## Important prop prompt

```text
ONE [story-critical object] with [shape, scale cues, materials, colours and moving parts], matching
[approved style]. Show the complete object in [useful view], centred with margin, even light and a
plain background. Keep [functional relationships needed by the story] unambiguous. No people, scenery,
labels or extra objects. Separate [movable part] if it needs independent animation.
```

An image is a reference, not a GLB. Use it for procedural reconstruction, a suitable image card, or an
optional available image-to-3D route. Inspect real models for scale, pivot, materials and usable moving
parts. Small props default to reusable primitives when that serves the look.

## Distant backdrop prompt

```text
Wide painted panorama of [distant location/sky] in [approved style, palette, weather and time]. Keep the
horizon [position] and foreground empty for the animated set. Use simplified distant shapes and
atmospheric separation. No characters, nearby objects, text or logos. Match the foreground's lighting.
```

Use flat backdrops only where camera parallax permits. Geometry or layered backgrounds are appropriate
when the camera reveals depth. Keep the background separate from the navigable environment layout.
