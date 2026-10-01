# HPOS Prompt Series — How to Use This

13 prompts (`00` through `12`), designed to be pasted **one at a time** into Claude Code, in order. Each prompt is self-contained (references the spec docs in the parent folder rather than repeating them) and checkpointed via `PROGRESS.md`.

## How to run this
1. Copy the whole `himalaya-plast-hpos/` folder (spec docs + this `prompts/` folder) into your repo/working directory, so Claude Code can read both.
2. Start a Claude Code session, paste the contents of `00_environment_foundation.md` as your first message.
3. Let it run to completion, check its `PROGRESS.md` update actually reflects reality (don't just trust "done" — skim the verification result it logged).
4. Start your next session (or continue the same one) and paste `01_selling.md`. Repeat through `12_fixtures_deploy_prep.md`.
5. You do not need to keep one continuous session alive — because of the `PROGRESS.md` checkpoint pattern, each prompt re-establishes context by reading it first. It's fine to close Claude Code between prompts, or run them across multiple days.

## Rules baked into every prompt
- Never skip ahead if a prior prompt isn't marked `done` in `PROGRESS.md`.
- No real Himalaya Plast data is used — every prompt uses clearly `TEST-` prefixed placeholder records and explicitly flags what's blocked on real client data (per your decision: structure/config only, no dummy data pretending to be real).
- Every prompt ends with a verification checklist that must pass before it's marked `done` — don't let the agent mark something done on the honor system.
- Server-side permission checks are required everywhere — the agent is repeatedly instructed not to rely on hiding UI elements as the only access control.

## If something goes wrong mid-series
Check `PROGRESS.md` for the last `done` entry and the first `blocked`/`in progress` one. Read that prompt's "Notes" and "Verification result" fields — they should tell you exactly what broke, since every prompt is instructed to log failure details, not just silently retry.

## After Prompt 12
The system is dev-complete for Phase 0–1 + the 3 custom screens, reproducible via fixtures, and ready for staging deploy. What's NOT done yet, by design:
- Planning Board (Phase 3) and AI Email & Forecast (Phase 4) — no prompts written for these; write them as a follow-up series once Phase 1's real production data exists (Planning Board was deliberately deferred for this reason in the original pitch deck too).
- Actual production data entry and go-live — blocked on the client supplying real company/item/customer/BOM data (tracked in `PROGRESS.md`'s open items list).
- Live (non-sandbox) GST/e-Invoice credentials.
