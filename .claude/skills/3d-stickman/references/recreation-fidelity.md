# Recreation: lock the look and verify the result

Use immediately after SOURCE_STORY.md is locked, and again before preview/export delivery.
“No changes” preserves the story, cast and setting. It does not answer Stage 2 or waive visual analysis.
The uploaded video is an active visual reference; missing separate sheets never means no references.

## STYLE.md and visible evidence

Inspect representative source frames; show 2–3 actual frames with a concise style description before
Stage 2. Include the opening action and an environment-wide view where available. Record exact source
times and uncertainty. Do not infer all of a film's look from its title or one thumbnail.

Write STYLE.md with:
- Environment medium: 2D illustration, rendered 3D or mixed; geometry, material detail and depth cues.
- Character medium: flat sprites/cutouts, drawn animation or 3D; silhouette, proportions and expressions.
- Line weight and where outlines occur; palette for lit surfaces, shadows and atmospheric distance.
- Lighting direction, softness, contact/cast shadows, haze and depth of field.
- Camera height, angle habits, off-axis/diagonal framing, shot changes and movement.
- Character scale relative to set landmarks, ground contact, pose, facing and object interaction.
- Source-frame IDs/times; elements to preserve and only the changes explicitly requested by the user.
- Planned implementation and its limits. A flat plate cannot support arbitrary orbiting or reveal unseen
  geometry; plan another angle, layers/inpainting or a real 3D reconstruction when needed.

Keep story and style locks separate. Present the evidence for correction; “keep the original” can already
establish the target. It still cannot select the asset route. Ask Stage 2 explicitly.

## Perfect Railroads regression reference

For this test, preserve the mixed-medium look: sculpted/rendered canyon, directional light, depth haze,
and dimensional ballast stones, with flat 2D stickman characters composited into the scene. A box with
printed coloured stripes is not an equivalent canyon reconstruction.

Use low, off-axis framing with diagonally receding rails where shown. The worker is three-quarters to
camera and crouches beside the rail for the sawing action. Keep his ground contact and shadow readable;
he must not appear sunk between sleepers. Use head width of roughly half the local track gauge as a
starting scale check against the actual frame (measure at comparable depth, not distant converging rails).
Do not default to an oversized frontal figure centred between the rails. Keep characters outside rails
unless the observed action/story requires otherwise. Feet/shadows should be visible where the source
framing permits; intentional source occlusion is different from accidental sinking.

These are this reference's staging targets, not universal rules for all cartoons. Other films derive
scale, angle and placement from their own STYLE.md. For this reference use a 3/4 default; preserve other
views when the source action calls for them.

## Build from approved assets

Use environment plates as layered backgrounds with restrained parallax/push-ins. Separate foreground,
ground and distance where actual assets permit; don't pretend one flat image provides hidden geometry.
Composite approved 2D poses on the ground with perspective-matched size, anchored feet, appropriate
contact/cast shadows and the correct occlusion order. Animate body mechanics and tool contact, not only
a floating prop. Add smoke, sparks and captions in separate layers according to the source and approved
brief. Recreating source captions is appropriate here; captions are not mandatory for unrelated films.
The Remotion starter provides timing/loading infrastructure, not the finished aesthetic.

## Matched-frame gate before every preview/video delivery

1. Select 4–5 source times spanning the requested excerpt: opening, key action, framing change and wide
   reveal. Render output frames at those same times when recreating timing. If timing was intentionally
   changed, use documented corresponding beats and label both timestamps; never mislabel them as equal.
2. Make a side-by-side sheet with source on the left and output on the right, shot IDs and timestamps.
   The existing templates/scripts/sbs_sheet.py is an example; adapt its hardcoded paths or make a small
   project-local comparison tool. Do not run it unchanged against unrelated files.
3. Inspect depth/materials, character identity/scale, pose/ground contact, camera angle/composition and
   palette/lighting. Record concrete differences, fixes and explicit accepted simplifications in
   REVIEW.md. Automated colour metrics cannot establish matching identity, staging or detail.
4. Fix unapproved material mismatches and rerender the affected comparisons. Do not call the result a
   style match because it has the same subject, colour bands, file dimensions or a zero-exit render.
5. Show the comparison with the preview/delivery and disclose remaining accepted differences. Separately
   inspect motion and audio if supported; still comparisons do not certify either.

A knowingly simpler option-4 result is checked against its explicitly accepted scope, with differences
shown, not relabelled faithful. If fidelity cannot be reached with the chosen method, explain the specific
limitation and offer an asset/method change. A blocker report is allowed; a failed preview must not be
presented as a finished recreation. This gate concerns animation deliveries, not earlier prompt or
asset-approval handoffs. Keep optional storyboards optional.
