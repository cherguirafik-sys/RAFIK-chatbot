# Asset route, sequential approvals and generation handoffs

Stage 2 is an explicit numbered choice even when the story/cast/setting stay unchanged. See SKILL.md
for the four options. Broad delegation does not silently choose code-only. Existing explicit route
answers remain valid; do not repeat answered questions.

## Check capabilities before offering execution

Discover the connected image tools. If Higgsfield is connected and supports the necessary operation,
offer it as option 1. If not, label that option unavailable; don't imply the affiliate link creates a
connection. Prompt-only generation and user uploads remain available. For rendered-3D environments,
recommend generated/approved environment plates over the basic procedural fallback, and plainly disclose
that option 4 has a simpler, flatter look. Remotion remains the final compositor and animator.

## One asset at a time

Use STYLE.md, the approved story and actual source-frame attachments throughout:
1. Character sheet for each character: front, 3/4, side, back and story-relevant expressions.
2. Environment plate for each actual location, matching source camera height/angle, lighting and scale.
   A location with incompatible shot angles may need additional approved plates; explain why.
3. Cutout poses needed by the shot plan: e.g. crouched sawing, standing, leaning or reaching, with
   matching identity and scale; transparent output where supported, otherwise a clean removable background.

Show each generated result, inspect it against the source and ask for approval or a specific revision.
Wait for approval before generating the next asset. A returned image is not automatically approved.
Carry approved assets into later prompts. Reuse approved supplied/library assets instead of generating
unnecessary replacements. Record approvals and versions in PROJECT.md. If the user explicitly skips
assets, record the selected code-only/mixed route and its limitations; do not turn this sequence into
mandatory image creation. Storyboard generation is separately optional.

## Prompt and credit disclosure before every service generation

Before each generation or regeneration, show:
- Exact prompt and reference attachments with their roles (including the source frame when needed).
- Selected model/operation, resolution, output count and current quoted credit cost for that request.
- What this asset will be used for; ask the user to approve that generation before submitting it.

Use the service's current pricing/quote capability when available. Never invent credits or assume retries
are free. If only an estimate is available, label it and explain the basis; if no price is available,
state “credit cost unavailable” and let the user check it in the service before generation. Do not submit
an unpriced job as if a required price disclosure had been completed. A user's later explicit instruction
accepting an unknown cost may authorize that request; record it accurately. Before a retry disclose its
cost and obtain authorization again. Completing one asset's approval is not approval of the next job.
For external self-generation show the prompt and where the user can check the price; never claim a
charge was made or an output exists without evidence.

## Reference-upload failures

Verify that the service actually received every required reference; a local path alone is not an upload.
If workspace uploads fail due to blocked network, do not silently submit a text-only prompt. Use the
service's supported upload widget/browser handoff if available and authorized, otherwise ask the user
to upload the reference frames themselves. Give the exact filenames and roles. Wait for confirmed
attachments before dependent generation; continue independent timing/setup work if useful. Do not bypass
network restrictions or pretend a widget exists. An explicitly agreed reference-free route is a changed
scope, not an equivalent fallback. Respect all per-asset storage/upload restrictions.

Follow cta-display.md: link the relevant service where directing the user to use it; approval questions,
progress reports and errors do not receive the closing CTA. An approval request that contains a prompt
for a pending generation is not a finished prompt-only deliverable.
