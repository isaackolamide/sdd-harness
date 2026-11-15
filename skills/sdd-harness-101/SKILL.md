---
name: sdd-harness-101
description: Use when a new user asks for an intro, tour, walkthrough, onboarding, or "how do I get started" with sdd-harness or spec-driven development, asks what spec-driven development is or why to use it, or invokes /sdd-harness-101.
---

# SDD Harness 101

Interactive tour: about 12 minutes typical, 15 minutes hard cap. One example, ten short stops, a pause after most. **Read-only**: it never invokes the real skills and never writes files.

**REQUIRED:** Read `tour-script.md` (same directory) first. It holds the running example, each stop's content, the path table, and the quiz. Present from it; do not improvise content.

## Recipe

1. **Detect start state.** Check whether `sdd-specs/` exists. Record `has-constitution` or `fresh`. Keep it to yourself until the close.
2. **Open** with two sentences: what the tour is, and that it uses one example ("bookmark a todo") and takes about 12 minutes (15 at most).
3. **Choose the route.**
   - If the request already asks to skip, shorten, or jump to the end ("in a hurry", "just the summary"), run only stop 10, then close.
   - Otherwise present stop 1, wait for the answer, then present stop 2. Stop 2 sets the user's path; follow that path's stop order from the path table in `tour-script.md`.
4. **One stop per message, then wait for the answer.** Each message has these parts, in order:
   - `Stop N of 10: <title>` and the command(s) it covers.
   - The stop's body from `tour-script.md`.
   - Its sample snippet (max 8 lines, code block).
   - One `AskUserQuestion` with **Next stop** (default) / **Go deeper on this stop** / **Skip to the cheat sheet**. Stop 2 asks the path question instead. Stop 9 offers **Take the quick quiz** / **Go to the cheat sheet**. Stop 10 has no question.
5. **Go deeper** = read `deeper.md` now, show that stop's entry, then ask the same question again. Do not open `deeper.md` before this answer, and do not mention what the Deeper text contains in the option labels.
6. **Skip to the cheat sheet** jumps to stop 10.
7. **Close** after stop 10 with the `tour-script.md` first-steps checklist, then one line naming the next command: `fresh` → `/sdd-constitution`; `has-constitution` → `/sdd-task`. Mention `/using-sdd-harness` for "which skill do I need?".

## Scope

The tour contains only what `tour-script.md` lists. Anything else a user asks about (parallel plans, implement modes, install, CLAUDE.md audits) is answered after the tour by pointing to `README.md` and `sdd-workflow.md`.

If the user asks to try a real skill mid-tour, name the command and let them end the tour first.
