# Script, narration, and timing contracts

## Script

For factual stories, verify the central event, numbers, and explanation using appropriate sources.
Save links and uncertainty in a source section that is not part of the narration. Do not present the
bridge example's historical claims as verified just because they are in the template.

Use a hook → setting → escalation → turning point → explanation or consequence → payoff structure
when it fits. The “Luckily / Unluckily” joke, soldiers, physics analogy, and historical setting are
optional example content. Avoid padding a short story just to reach the default duration.

Estimate spoken duration from word count and the chosen delivery. The original example uses about
3.7 words/second; treat that as a fast delivery estimate, not a requirement or measured audio duration.
Show the estimate and update it after the recording. Keep source notes and stage directions outside
the copyable spoken script. Save draft/approved status and the approved revision in PROJECT.md.

## Voice routes

1. User recording: inspect the actual audio and use it as the timing authority.
2. Available authorized voice tool: generate from the approved script using the agreed voice.
3. No voice capability: deliver the copyable narration and ask the user to upload their recording.
   Continue independent visual planning; do not pretend a voice file or word timings exist.

Inspect the original recording in place first. Convert to PCM WAV at 48,000 Hz only when the chosen
audio pipeline needs it and storage permissions allow a derived copy. A no-copy recording remains a
reference to the original; adapt playback/input paths rather than saving an unauthorized conversion. Check the
start/end, intelligibility, clipping, and duration. Reconcile any differences between the recording and
approved script before locking the timeline. Do not silently truncate narration to fit the old 67.5 s.

## Word timings

When saving is allowed, `voice/words.json` is a JSON array. Otherwise retain the alignment record in
conversation or approved volatile memory. Seconds are relative to the actual selected narration source:

```json
[
  {"word": "Imagine", "s": 0.12, "e": 0.48},
  {"word": "a", "s": 0.49, "e": 0.55},
  {"word": "bridge.", "s": 0.56, "e": 0.92}
]
```

The example mixer reads `s` and `e`; the `word` field makes alignment inspectable. Phrase-level timing
may drive an initial preview if word alignment is unavailable, but must be labelled with its actual
precision. Silence detection and file duration do not prove correspondence between words and actions. Adapt a transcription
provider's output to this schema instead of assuming compatible field names. Check numeric finite
values, `0 <= s < e <= voice duration`, chronological order, and correspondence with the spoken words.
Review suspicious timings and manually correct them against the recording. Without a timing tool,
manual alignment is acceptable if actually inspected; estimates remain labelled provisional.

## Canonical timeline

Create `TIMELINE.json` as the working project's timing authority. This is a workflow contract;
the legacy bridge source does not automatically import it. Implement the import/export or explicitly
synchronize and compare its values before declaring timing locked.

Example of a two-second test timeline (not a complete short):

```json
{
  "revision": 1,
  "fps": 30,
  "durationInFrames": 60,
  "shots": [
    {"id": 1, "a": 0, "b": 30, "beat": "hook"},
    {"id": 2, "a": 30, "b": 60, "beat": "reaction"}
  ],
  "events": [{"id": "reaction", "frame": 30, "type": "sfx"}],
  "xfade": [],
  "planned": [],
  "flash": null
}
```

- Shot ranges are half-open `[a, b)` and cover `[0, durationInFrames)` without gaps or overlaps.
- Use integer frames. Derive duration from actual narration plus the intended ending; do not inherit
  `TOTAL = 2025` from the example unless the new film really lasts 67.5 seconds at 30 fps.
- Events stay within the duration. Reactions may lead their narrated word by 0–3 frames when appropriate.
- `xfade` and `planned` are lists of frame windows for intended transitions/effects. `flash` is a frame
  window or null. QA metadata must omit `flash` when null because the legacy checker expects a window.
- Keep creative shot descriptions in VISUAL_PLAN.md and precise timing here. Update both when needed.
- Record the timeline revision used for scene, audio, preview, and final render. Do not mix revisions.

## Changing approved work

Narration edits reopen alignment and all affected shots/sound. A camera adjustment that preserves frame
ranges does not require re-recording the voice. Reopen sound when a camera-dependent effect changes.
Save the old approved version before replacing it and record exactly which stages need an update.

## Reference-aware shots and recreation

TIMELINE.json remains the timing authority. Extend each shot with `narrationCue`, `characterRefs`,
`environmentRef`, and `storyboardRef` as needed. A reference is an object with an asset `id` and `version`;
board references also identify the panel. Use `[]` for no character image references and `null` for an
absent environment/storyboard image. Written design IDs can be recorded separately as `designIds`.
Optional images are never fabricated merely to fill these fields. Resolve active versions from PROJECT.md.

For recreation, attach `sourceBeatId` and `sourceTimeRange` separately from output `a`/`b` frame ranges.
The source story controls event order and outcome, while the selected narration normally controls output
duration. Preserve original timing only when requested and feasible; resolve recording-length conflicts.
The scanner's rounded video-prompt beats are not word alignment and must not replace precise timing.

When narrative text is approved but visual planning is unfinished, a timeline may be a draft. Do not
mark all timing verified because the container duration is known. Reconcile actual spoken words with
the script, and keep original narration separate from diegetic dialogue or generated sound effects.

## Optional named-cue compiler

For starter-based films, starter.md describes SHOT_PLAN.json + ALIGNMENT.json -> TIMELINE.json.
The alignment wrapper names duration, method and verification status; it may contain the existing
word/s/e records under `words`, or phrase text/s/e records under `phrases`. The compiler resolves
explicit narration phrases, reports missing/repeated matches, and validates rounded shot boundaries.
It neither transcribes audio nor estimates word positions inside phrases. Recompile after narration
changes and inspect downstream actions, transitions and captions if requested. Older projects need
not migrate just to continue their current work.
