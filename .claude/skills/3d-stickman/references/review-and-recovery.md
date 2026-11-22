# Review, revisions, and recovery

## Preview checks before delivery

Use visual-checks.md for per-shot samples, action extremes, scene geometry warnings, documented
exceptions and optional reference metrics. The starter checker fails on unresolved warnings; the
legacy video checker below remains diagnostic only. Neither replaces motion/listening review.
For recreations also apply recreation-fidelity.md before preview/export delivery: show 4–5 matched
source/output comparisons and correct unapproved visual mismatches. A clean technical report does not
waive this gate.

## Final review

1. Inspect the actual final file: dimensions, fps, duration, audio streams, sample rate, and output size.
2. Confirm that narration and picture use the same timeline revision and that no ending was truncated.
3. Listen to representative narration and sound where playback/audio tools permit. Check loudness and
   peaks independently. If listening is unavailable, disclose that rather than claiming it happened.
4. Inspect the opening, ending, key action, and transitions. Check identities, framing, occlusion,
   character feet/contact shadows, lighting changes, and readable props.
5. Run the frame QA helper if Python/ffmpeg are available; inspect flagged moments in context.

`templates/scripts/short_qa.py` accepts video, output folder, and optional metadata JSON. It requires
NumPy/Pillow and ffmpeg/ffprobe. Copy it into the working project's scripts folder when using it.
Its metadata format is an object, despite the older comment showing a bare array:

```json
{
  "shots": [{"id": 1, "a": 0, "b": 60}],
  "xfade": [],
  "planned": []
}
```

Export these fields from the canonical timeline. Include `flash` only when it is a real frame window;
never pass `null`. The helper labels 60-frame sheets as two seconds, assuming 30 fps. Its freeze threshold
is 12 frames. Adapt those assumptions for other frame rates. It loads all decoded frames into memory;
for long videos or memory failures, use a streaming/chunked check instead.

A zero exit code means the script ran; it does not mean the film passed. The helper writes findings
without enforcing delivery thresholds. It also misses a frozen run continuing through the final frame,
so inspect the ending independently. Intentional holds, cuts, and flashes need contextual review.
Record pass/fail/not checked and remaining limitations in DELIVERY.md.

## Fix by symptom

| Symptom | First inspection | Next action |
| --- | --- | --- |
| Skill installed, nothing renders | Working project manifest, entry, dependencies | Return to setup; create and test the minimal app |
| Browser executable not found | Hardcoded Windows path in still helper | Use supported browser resolution or the actual executable |
| Composition not found | Registered ID versus render command | Use the actual ID; verify entry file |
| Missing props / sparse scene | Asset requests and loader errors | Supply or replace assets; inspect a new preview |
| New story still shows soldiers/bridge | world, build, cast, story | Adapt the example content, not just its name |
| Voice input missing or unreadable | voice path, WAV encoding, sample rate | Request/import the recording and normalize a working copy |
| Audio/animation drift | Canonical timeline versus scene/audio constants | Synchronize timing, invalidate affected outputs, rebuild |
| Sound changes do not appear | Filename-only audio caches | Invalidate this project's affected cache and rerender sound |
| Narration gets cut off | Actual voice length versus total frames | Extend/replan timeline and dependent outputs |
| Final video silent/wrong track | Mux stream selection | Explicitly map the intended mix and verify final streams |
| Camera blocked / huge foreground blobs | Camera positions and nearby geometry | Reposition/remove blocking props, then review the motion |
| QA flags a hold/cut/flash | Intended timing and neighboring frames | Fix a real error or record a reviewed intentional effect |
| Out of disk / memory | Project temp directory, public assets, QA frame loading | Reduce avoidable copies or process in chunks; preserve unrelated files |

## Reference and source-story revisions

Read the asset/shot dependency tables in PROJECT.md before revising. Compare against the actual selected
image version, not only the original prompt. Update the affected Remotion components and previews.

| Change | Scope |
| --- | --- |
| Character reference replaced | Shots using that character/version; preserve other characters |
| Environment reference replaced | Shots in that location; preserve other locations |
| One storyboard panel revised | Corresponding shot/key pose and neighboring transition if affected |
| Optional image step skipped | Continue from written design/shot plan; do not block or fabricate assets |
| New reference arrives after AI-directed build | Register its role, inspect difference, update dependent shots |
| Narration length changes | Re-align affected cues and downstream time ranges; preserve reusable designs |
| Source story changed explicitly | Update SOURCE_STORY.md and dependent script/shots; retain unaffected assets |

If recreating, visual substitutions preserve the locked story. Flag a requested change that alters its
causal mechanism or ending instead of silently inventing a different plot. Missing optional image files
may fall back to written direction when the user chooses; missing source evidence cannot be invented.
Use revised character/environment/storyboard prompts only if the user wants external visual direction.
Do not require regeneration for a camera adjustment that can be made directly in Remotion.

## Resume without starting over

Read PROJECT.md, then verify referenced artifacts exist and correspond to the saved revision.
Mark stale/missing work as `needs update`. State the next specific action and continue it.
If no record exists, reconstruct one from real files, asking only about choices that cannot be inferred.
Do not overwrite existing scripts, recordings, or final exports while reconstructing state.

| Requested change | Keep | Reopen |
| --- | --- | --- |
| Music quieter | Script, voice, timing, picture | Mix, mux, final audio QA |
| Different outfit | Script, voice, timing | Character visuals, affected previews, picture export, final QA |
| Camera adjustment | Script, voice | Affected shot, preview, picture; sound if dependent on camera |
| Narration rewrite / new language | Reusable designs and assets | Script approval if needed, recording, timing, dependent picture/audio |
| Change export resolution only | Creative plan, voice, timing | Resolution-sensitive effects check, export, QA |
| New topic | Reusable rendering techniques | New brief and story-specific stages |

## Honest blocked-state delivery

Name the blocker and completed outputs. Example: “The approved script and shot plan are ready. The video
has not been rendered because this chat cannot run the renderer. Continue in a code-capable environment
with this project folder; the next action is the setup test frame.” A blocker report does not receive
the closing CTA; follow `cta-display.md`.
Do not manufacture preview links, completion statuses, or an available tool to make the flow look finished.
