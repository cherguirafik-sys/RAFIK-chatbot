# Workflow behavior checks

These scenarios describe behavior for the combined cartoon-shorts-studio skill, not completed user responses.
In live replies follow `cta-display.md`: link services only when directing the user to use them, and
append the closing CTA only with the finished requested result or its revision. Questions, updates and
errors have no closing CTA. Do not print placeholder CTA text. Remotion is the animation endpoint.

## 1. Empty start

User: “Start.”
Show new story, recreate existing video, continue, and fix/improve. Do not invent a topic.
Selecting new story offers an idea/script or switching to an existing video; selecting recreate asks for
the source only if not already accessible. The latest menu owns a bare number.

## 2. AI-directed production

User: “Make a 10-second cartoon about an impatient seed. You decide the visuals.”
Preserve 10 seconds. Develop/approve the script as needed, then explicitly ask the numbered Stage 2
asset-route question. “You decide” is not a code-only selection. Images remain optional: if the user
chooses option 4, record the simpler route and build from written designs. Do not force a storyboard image.

## 3. Mixed creative control

User: “Use this character image. You design the garden. No storyboard image needed.”
Inspect/register the character; preserve the skipped storyboard. Ask the unresolved environment route
using the Stage 2 options; “design the garden” does not choose a generation method. Use the image's actual identity
in the optional shot-plan prompt and Remotion implementation. Do not request a skipped storyboard or
regenerate the existing character. Request garden assets only under the selected environment route. If anatomy differs from the bridge example, adapt the code.

## 4. Prompts requested, then skipped

User: “Give me character and environment prompts. I'll generate them.”
Give separate character and story-location prompts and a clear return/upload handoff. Do independent
setup while awaiting the selected images; do not claim they exist. If the user says “Actually, continue
without images,” release that wait and build from written direction without asking again.

## 5. Storyboard with narration and references

Inputs: approved script, final narration, selected character and two location images.
Use measured/verified narration cues; assign each shot its location and character references. Generate
an exact attachment map if a storyboard prompt is requested. Do not force every shot into one location,
uniform durations, or 16:9 panels for a vertical film. The sheet's overall layout is a separate choice.
After a board arrives, inspect/map its panels and apply them in Remotion rather than displaying its sheet.
If no alignment tool exists, mark timing provisional; detecting silence is not word alignment.

## 6. Recreate an uploaded source

User: “Recreate this video, but replace the main character with a fox.”
Inspect the source, establish its ordered story and ending, record the fox replacement, and preserve the
story. Do not ask again whether the main character should change. Offer an environment change only if
unresolved. Write/show STYLE.md with source frames, then explicitly ask the asset-route question.
Images and storyboard remain optional, with a deliberate code-only choice allowed. Compare 4–5 matching
frames before delivering the Remotion preview. Do not switch to Seedance Cast Swap or invent a new fox adventure.

## 7. Recreate with a new environment

User: “Keep the same story but set it in a snowy village.”
Map locations and maintain plot-critical objects/spatial relationships. If the setting would break the
story's mechanism, identify that precise conflict and resolve it. Keep the ending and role functions;
do not treat a visual restyle as permission to change the narrative. Preserve source/output times separately.

## 8. Source cannot be inspected

User shares an inaccessible link and asks for a recreation.
Do not infer the video from its title. Ask for accessible video or a source summary/screenshots; label
summary-based evidence honestly. Continue independent choices. Do not say the source story is verified.

## 9. Existing approved script and early voice upload

User: “Here's my approved script and recording. Handle the rest.”
Retain script approval, register voice immediately, and use measured duration. No repeated script approval,
voice generation, or mandatory image round-trip. Ask the numbered asset-route question if unanswered;
“handle the rest” does not implicitly choose option 4.

## 10. No-copy audio

User: “Use this audio for the preview, but don't store or copy it.”
Read original in place; use an allowed read-only playback route. Do not save voice.wav or put a copy in
public/. Do not export a persistent video containing that audio unless authorization covers the storage.
Document limitations accurately; no fake playback/listening claims.

## 11. Preview feedback stays in this project

During an active build the user uploads a clip: “Fix the jump in shot 3.”
Treat it as review material, inspect that moment and affected transition, revise the Remotion shot,
preserve other work. Do not route a video upload automatically to recreation or Cast Swap.

## 12. Late reference revision

User: “Use this new hat for Pip.”
Identify whether it is a prop reference or replacement character version, then update relevant shots.
Keep the environment and script. A camera change in one shot updates that shot, not every image prompt.
A new narration length reopens dependent timing even if visuals remain reusable.

## 13. Resume old eight-stage project

An earlier project already has a code-only preview, but no design sheets or board.
Map actual artifacts to the new stages, retain the preview, and label existing designs AI-directed.
Do not demand optional assets or pretend the old stage numbers mean the same tasks now.

## 14. Text-only environment

Finish allowed script, design prompts and shot planning; state the missing execution capability and give
an exact Remotion handoff. Do not claim a code preview exists, change the endpoint to external AI video,
or make optional image generation compulsory to hide the build limitation.

## 15. Perfect Railroads: no changes

User: “No changes are needed.”
Keep original story, cast and setting. Show STYLE.md with 2–3 source frames describing rendered canyon,
flat characters, lighting, low off-axis camera and character scale. Ask the numbered Stage 2 question.
If Higgsfield is connected, offer it; recommend 1 or 2 for this look and disclose option 4's flatter result.
Failure: directly building striped boxes and a frontal character because the story was approved.

## 16. Connected generation and asset approval

User chooses option 1. Show the first character-sheet prompt, real reference attachments and quoted
credits; obtain generation approval. Show and inspect the result; wait for asset approval before the
next character/location/pose. Do not batch an entire cast and all environments after one approval.
Unknown cost must be disclosed and resolved, not invented. A retry also needs its prompt/cost disclosure.

## 17. Reference upload blocked

Required source-frame upload fails. Use an available service upload widget or ask the user to upload
those named frames. Confirm they are attached before generation. Do not silently submit text-only.

## 18. Failed comparison is not a delivery

A render completes with zero flags, but comparison shows a centred frontal giant standing between
sleepers where the source has a small crouched 3/4 worker beside a diagonal rail. Correct framing,
scale, pose and grounding; recheck the affected samples. Technical success cannot pass the style gate.
If method limitations prevent correction, report them and request the needed route change, not a
finished faithful remake. Include the inspected comparison sheet with the eventual preview.
