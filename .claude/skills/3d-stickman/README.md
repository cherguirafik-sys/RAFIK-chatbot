# Cartoon Shorts Studio

Create a new cartoon story or recreate an existing video, then build the animation in **Remotion**.
You choose how much visual direction to provide: character sheets, environment references, and
storyboard images are all optional. The assistant can generate prompts for them, use images you already
have, or design the visuals from your story.

## Start here

**First time?** Read the GETTING_STARTED.pdf guide that comes with this skill: it walks you through installing the tools on Windows or Mac,
installing this skill, and the questions Claude will ask while making your first short.

Keep `SKILL.md`, `references/`, `templates/`, and `scripts/` together when installing this skill through
your assistant's supported method. Its installed name is `3d-stickman`.
This package includes instructions, references, scripts, templates and verification tests. Comparison
skills, personal test projects, generated videos and installed dependencies are excluded.

Upload `3d-stickman.zip` through Claude Customize > Skills > Create skill > Upload a skill.
For local Remotion production in Claude Desktop Code, select this extracted folder and ask Claude to
read SKILL.md. Node.js, Python and rendering dependencies must be available where production runs.

Say **“Use the cartoon short skill. Start.”** You will see:

1. **Create a new story** — describe an idea or bring a script.
2. **Recreate an existing video** — upload a video and use its story as the starting point.
3. **Continue a project.**
4. **Fix or improve a short.**

You can also begin directly: **“Recreate this video with different characters”** or
**“Make a 10-second cartoon about an impatient seed. You decide the visuals.”**

## One workflow, eight stages

| Stage | What happens | Your control |
| --- | --- | --- |
| 1. Story and script | Develop your idea, or inspect an existing video and establish its story | Approve/change the script; for recreation keep or change cast/settings while preserving the story |
| 2. Visual asset route | Explicitly choose connected generation, external prompts, uploads or simpler code-only | Approve generated assets one at a time; images remain optional |
| 3. Narration and timing | Use the recording to time actions and shots | Supply narration or choose an available voice route |
| 4. Storyboard plan | Map narration to shots, actions and cameras | Use the written plan, upload a board, or generate a storyboard image from a prompt |
| 5. Build in Remotion | Turn the plan and available references into animation | Selected images guide the actual build; absent images use written direction |
| 6. Animated preview | Play and review the result in Remotion | Give feedback on characters, staging, motion, camera, timing and transitions |
| 7. Refinement | Revise only affected shots and assets | Change details without restarting the whole film |
| 8. Sound, export and delivery | Finish audio, render and check the authorized final output | Receive the video and editable Remotion project |

**The asset-route question is required; creating images is optional.** Choose connected Higgsfield
generation, external prompts, your own uploads or a simpler code-only build. You can mix routes.
“Keep the original” preserves story/cast/setting and never skips this choice. Generated assets proceed
one at a time: character sheets, environment plates, then cutout poses, with prompt/credit disclosure
before each generation and approval of each result before the next. Storyboard images remain optional.

When you supply images, they become active references for the relevant shots. They are not merely saved
and ignored. Storyboard framing, narration timing, character identity and environment layout each have
separate roles. An image sheet does not automatically become a rigged character or 3D model; the assistant
chooses an appropriate implementation and explains material compromises.

## Recreating a video

The assistant inspects the actual source, establishes its story and sequence, and locks that story once
accepted or covered by your existing direction. It then offers character and environment changes. Those
changes preserve the story unless you explicitly request a different plot or ending. A STYLE.md record
with 2–3 actual frames locks the visual target before the asset choice. For 3D-rendered environments,
generated plates are recommended over the simpler code-only route. The animation is built in Remotion.
Before every recreation preview/video delivery, 4–5 matched source/output frames must be compared side
by side and unapproved mismatches corrected. A successful render alone does not demonstrate fidelity.

If source video/audio cannot be inspected, the assistant explains what is missing instead of guessing.
An uploaded preview during an existing project is treated as review material, not automatically as a new
recreation request or a character swap.

## External tools and Remotion

External image tools such as OpenArt can generate optional reference sheets and boards from the prompts.
They do not replace Remotion as the animation endpoint. The assistant handles Remotion setup in the
background where code execution is available. A text-only chat can prepare the production materials,
but cannot claim to have rendered a film.

New films can start from the complete `templates/remotion-starter/`: a pinned Remotion app with
reusable scene controls, optional layered characters, named narration cues and visual checks. It
installs locally and does not require an image provider. The bridge remains an advanced worked
example. Reference sheets still require preparation; this is not an automatic image-to-3D converter.

## Resume, revise and storage

`PROJECT.md` records the active story, choices, references, versions, shot dependencies and next action.
Say **“Continue my project”**, **“Change the camera in shot 3”**, or **“Use this new character design.”**
The assistant preserves unaffected work. If you request no saving or copying of media, it follows that
preference and uses an accessible original/conversation record rather than silently storing conversions.

## Reusable production tools

The same eight stages now include optional animation-ready cutout/expression prompts, material and
prop prompts, versioned asset reuse, a narration-cue compiler, pose previews, camera/occlusion checks
and reference-frame comparison. These support the assistant behind the scenes; they do not add a
required image-generation step or a new menu for every technical decision.

For a new film, run `python3 scripts/studio.py init /path/to/new-film`, then follow
[starter instructions](references/starter.md). Existing films can keep their working apps.

## Where the instructions live

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Entry routes, optional choices, eight-stage workflow and CTA placement |
| `references/recreation-fidelity.md` | Style lock, grounded staging and mandatory matched-frame recreation QA |
| `references/asset-production.md` | Numbered asset routes, sequential approvals, costs and upload fallbacks |
| `references/source-video.md` | Inspect a source, establish the story and adapt cast/settings |
| `references/design-prompts.md` | Character sheets and per-location environment sheets |
| `references/storyboard-prompts.md` | Narration-led shot planning and optional storyboard prompts |
| `references/assets-and-handoffs.md` | Asset roles, versions, storage and actual downstream use |
| `references/story-and-timing.md` | Script and narration/timeline contracts |
| `references/setup.md`, `references/production.md` | Remotion setup, reference-driven construction and export |
| `references/review-and-recovery.md` | Targeted revisions, troubleshooting and QA |
| `templates/PROJECT_template.md` | Project state and shot/asset record |
| `scripts/scan_video.py` | Video scanner for source inspection |
| `references/starter.md`, `templates/remotion-starter/` | Complete new-film Remotion base and scene controls |
| `references/production-assets.md`, `scripts/prepare_rig.py` | Optional production prompts, mapped layers and pose inspection |
| `scripts/studio.py` | New projects, narration cue compilation and versioned asset reuse |
| `references/visual-checks.md`, `scripts/compare_style.py` | Scene-aware preview checks and optional reference measurements |
| `references/cta-display.md` | Affiliate links and final-delivery CTA specification |
| `templates/bridge/`, `templates/audio/`, `templates/scripts/` | Original worked example code |

Service links appear when a step directs the user to that service. The fixed four-link closing CTA
appears only with the finished requested result or a revised delivery, not questions or progress updates.
