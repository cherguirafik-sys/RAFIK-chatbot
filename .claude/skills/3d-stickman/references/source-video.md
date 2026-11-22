# Recreate an existing video — entry route

This route starts at Stage 1, alongside creating a new story. It converges with the same optional design,
narration, storyboard, and Remotion stages. It is not Cast Swap and does not require an external video model.

## 1. Inspect the source

Use an accessible uploaded video or authorized accessible link. A title, thumbnail, or remembered scene
is not sufficient evidence. If the link cannot supply inspectable media, ask for the video rather than
inventing it. Honor any no-copy/storage preference for source media and derived frames.

Reuse `scripts/scan_video.py`, included unchanged from the supplied Seedance Studio scanner, when code
and permission to save analysis frames are available:

```sh
python3 scripts/scan_video.py --check
python3 scripts/scan_video.py /path/to/source.mp4 --out /path/to/project/source-analysis
```

Run from the installed skill folder or substitute the actual absolute script path. The scanner requires
Pillow and a working decoder, and produces metadata, contact sheets and candidate cuts. Inspect the
sheets in order, then the per-shot and transition sheets. Detected cuts can be false positives. The
scanner's whole-second prompt/segment helpers and model-specific trim suggestions are not the Remotion
timeline; preserve measured source times and build the output timeline separately.

The scanner only identifies audio-track presence; it does not transcribe or understand speech. Listen
with a supported tool or obtain a transcript, aligning it when possible. If neither is available, ask
for the missing spoken content. Distinguish visible story facts from narration-dependent claims. A
no-storage request may require in-memory inspection or user-provided frames; do not run a disk-writing
scanner contrary to it. A fallback based on the user's summary is labelled as such, not “video verified”.

## 2. Establish and lock the story

Create SOURCE_STORY.md (or a conversation record when saving is disallowed):

- Source ID, accessible locator, duration, inspected range, and evidence limitations.
- Ordered beats with observed source times: setup, intention, actions, cause/effect, payoff/ending.
- Cast roles and story-critical props; locations and important spatial relationships.
- Narration/dialogue transcript or stated uncertainty; factual claims needing verification if relevant.
- What the remake preserves: story order, causal mechanism, key actions, and outcome.
- Output scope: whole source or explicitly selected excerpt; proposed duration and narration route.

Show a concise account so the user can correct it. Lock once accepted, or under explicit prior direction
to recreate faithfully when the source is sufficiently understood. Do not lock guessed details. If the
source/summary is unclear, request the critical missing information while continuing independent work.
An existing approved source/story does not need repeated approval.

## 3. Lock the visual style, then offer creative changes

Immediately after story lock follow [recreation-fidelity.md](recreation-fidelity.md): write STYLE.md and
show 2–3 actual source frames with the environment/character media, outlines, palette, lighting, camera
habits and scale. Keep this evidence active in downstream prompts and shots. Story analysis alone is
incomplete recreation analysis. “No changes” locks story/cast/setting, not the asset-production method.


Offer one compact choice: keep original roles/setting, change characters, change environments, or both.
Carry choices already given. Use a role map:

| Source role | Remake character | Action | Story constraints |
| --- | --- | --- | --- |
| Role observed in source | User choice or proposed design | keep / replace / add | Beat function, essential relationships/props |

A new character can replace a role or be added as a supporting presence. Do not silently change who
causes the key event or introduce a new plot. If an addition would alter the story, ask about that exact
change. Likewise changing the environment must preserve the story's physical requirements; a bridge
collapse cannot become an unrelated garden scene without explicit story revision.

Character and environment images remain optional, but Stage 2's numbered asset-route question is
mandatory unless explicitly answered already. Source frames remain visual references even if the user
selects code-only. Offer connected Higgsfield generation, external prompts, uploads or the simpler
code-only route; follow asset-production.md. Never infer code-only from “keep the original”.

## 4. Create the remake script and continue

Write/adapt the script from the locked story with the requested cast/environment changes. Preserve
approved dialogue/narration where directed; otherwise describe the intended retelling rather than claiming
an exact transcript. Keep the story lock and remade script linked by beat IDs. Do not automatically reuse
source music or voices; establish the narration route from the user's request.

If the user wants original timing, map output shots to measured source times and check any new recording
fits. Otherwise actual final narration controls output timing while source beat order remains fixed.
Source timestamps and output timestamps are separate fields. Never stretch/truncate narration to make
it fit silently. Only an explicit story change reopens the story lock.

Continue to the explicit Stage 2 choice in SKILL.md. Build in Remotion from STYLE.md, the source analysis,
adaptation and approved assets. Before each video/preview delivery apply the 4–5-frame side-by-side gate
in recreation-fidelity.md. Storyboard images remain optional.
