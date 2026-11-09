---
name: sdd-write-spec
description: Use when creating a new feature specification document from raw ideas or PRDs, before any implementation plans are made.
metadata:
  type: planning
  composesWith: [superpowers:brainstorming, agent-skills:interview-me]
---

# sdd-write-spec

## Overview
Generates a scoped feature specification (`sdd-specs/features/YYYY-MM-DD-<name>-spec.md`) and updates the roadmap.

**REQUIRED SUB-SKILL:** Use `agent-skills:interview-me` when the seed is NOT a PRD (Step 2).
**REQUIRED SUB-SKILL:** Use `superpowers:brainstorming` yourself, in the main agent, to design the feature (Step 4).

## Workflow

### 1. Constitution Check
**Before anything else**, verify these exist:
- `sdd-specs/mission.md`
- `sdd-specs/tech-stack.md`
- `sdd-specs/roadmap.md`

If ANY are missing: **STOP.** Demand `/sdd-constitution`. Do not proceed.

### 2. Intent Discovery & Distillation
Pick the row that matches the seed:

| Seed | What to do |
|---|---|
| A PRD (`sdd-specs/prds/*-prd.md`) | `sdd-prd` already interviewed the user and got an explicit yes on the intent. Run the **PRD gap check** below. Do not re-run `interview-me`. |
| Anything else (raw idea, bug-fix findings, notes) | Invoke `agent-skills:interview-me` interactively (one question at a time). Do not guess requirements. |

**PRD gap check:**
1. Fill the six intent fields from the PRD: Outcome and Why now ← Objective & Goal; User ← User Personas; Success ← Success Metrics; Constraint ← Technical & Non-Functional Constraints; Out of scope ← Out of Scope + Won't Have. The spec is the only document `/sdd-plan-feature` reads, so also carry these into it at Step 5.1: PRD Acceptance Criteria → spec Acceptance Criteria (reformatted to Given/When/Then/Outcome); Must Have and Should Have → In Scope; Risks & Dependencies → Dependencies; Core User Journeys → Objective & User.
2. List the gaps: leftover `[...]` or `TBD`, every item under the PRD's Handoff Notes → Open questions that is about *what* to build, Should/Could Have items with no in/out decision, and contradictions between sections. Only these become questions. Ask them one at a time in interview-me's `Q:` / `GUESS:` format. Questions about *how* to build belong in Step 4, not here. If a question needs a fact nobody in the session knows, ask the user once whether they can answer it. If not, record it in the spec's Dependencies as `Unverified: <claim>; owner: <name or unassigned>`. Never settle it by assumption.
3. Present the six-line restate (Outcome / User / Why now / Success / Constraint / Out of scope) with the answers folded in. Wait for an explicit yes.

**After the explicit yes (either row):** go straight on to Step 3 in the same turn. interview-me's terminal turn (stop and offer downstream paths, save to `docs/intent/`) does not apply here: this skill is the downstream path.

### 3. Constitution Alignment Check
Map intent against the constitution:
- **`mission.md`**: Name any "Never Do" violations. **STOP if violated.** Demand user modifies `mission.md` first. Surface "Ask First" items as explicit flags.
- **`roadmap.md`**: Identify existing or new phase for this feature.

### 4. Design Brainstorming
Run `superpowers:brainstorming` yourself. Never delegate it to a subagent: it needs live back-and-forth with the user. The brief is the confirmed intent from Step 2 plus the constraints from Step 3. If the PRD has Handoff Notes, add its Decisions & rejected alternatives, Implementation hints, References and any Open questions about *how* to build to the brief; the hints are starting points the design may override. *What* to build is settled; brainstorming decides *how*.

Brainstorming is written to stand alone. Inside this skill, follow its process with these replacements:

| Brainstorming says | In this skill |
|---|---|
| Offer to skip the questions; open "describe it" question; "this skill is done" if they opt out | Intent is already settled (Step 2). Start at *how*. If the user opts out of questions, still write the spec in Step 5. |
| Size the work (quick task / small change / project); offer a spike | The size only sets how much design you present. **Every size ends at Step 5 with a spec file.** Never build, including spikes. Never change code, scaffold, or implement. Code comes later from `/sdd-plan-feature`. |
| Write the design to `docs/superpowers/specs/...-design.md` | Write nothing yet. The design goes into the spec in Step 5. (Brainstorming lets the user's preference for the document's location override its default.) |
| Written-design check, hand over for approval | Done in Step 5.3–5.5, on the spec file. Applies to every size, including a small change. |
| Invoke `writing-plans` | Never. The hand-off is `/sdd-plan-feature` after Step 6. |
| Visual Companion | Allowed. Follow brainstorming's rules: offer it only when seeing beats reading, in its own message with nothing else, and don't re-offer after a decline. If accepted, follow the instructions brainstorming points to for starting it. It is a live discussion aid: don't save its screens into `sdd-specs/` (they are HTML fragments that only render inside the companion's frame). Put what the user approved from them into the spec's Architecture section, and still ask the Step 6 diagram question. It runs its session under `.superpowers/` in the project, so remind the user to gitignore that folder. |

**Visual Companion check.** Brainstorming leaves the offer to the agent noticing a visual moment, and that is easy to miss. Here it is an explicit check. Run it against the Step 2 intent before your first design playback, and again before each later chunk until the offer has been made. Does the feature involve any of these?
- a screen, page, or printout
- a layout or arrangement
- a flow or sequence of steps
- a state machine or lifecycle
- how components, services, or data relate
- design options that would look different from each other

If yes and the user hasn't seen the offer yet, send it now as its own message, with nothing else in it, using brainstorming's wording: "This might be easier if I show you. Want me to open a browser tab with some mockups?" Don't add cost or setup caveats; they read as reasons to decline. If they declined earlier, stay in text.

### 5. Create Spec & Review
**5.1. Create** `sdd-specs/features/YYYY-MM-DD-<name>-spec.md` using `templates/feature-spec.md`.
  - **PRESERVE HEADINGS**: Do not add, remove, or modify the template's markdown headings.
  - **FILL SLOTS**: Replace all bracketed `[...]` instructions with the confirmed intent from Step 2 and constitution flags.
  - **FORMAT CRITERIA**: Ensure Acceptance Criteria strictly follows the `Given, When, Then, Outcome` pattern as required by the template.
  - **INSERT ARCHITECTURE**: Put the approved Step 4 design into the Architecture section. For a small change, that is the short design the user approved in chat.
**5.2. Edit** `sdd-specs/roadmap.md`:
  - **If the PRD's `Task Reference` is a path (not `None`)**: find the existing milestone bullet for that task file and append the spec link to it (e.g. `... — sdd-specs/tasks/....md, sdd-specs/features/....md`). Do not add a second bullet for the same milestone.
  - **Otherwise** (`Task Reference: None`, e.g. a typed or session-context seed, or the post-implementation bug-fix path): add a new milestone bullet under the appropriate phase, linking to the spec file.

**5.3. Self-review.** Check: no placeholders or `TBD`; sections don't contradict each other; scope fits one feature plan; no requirement reads two ways. Also check: headings match the template, every criterion is Given/When/Then/Outcome, no `[...]` left. Fix issues inline.

**5.4. Reviewer subagent.** Dispatch a fresh subagent with the reviewer prompt that `superpowers:brainstorming` ships for its written-design check. Read that skill's `SKILL.md` to find which file it names for the step; do not assume a filename. Fill the prompt's placeholders by meaning: the document path is the spec path, the domain is "software engineer". If the skill names no such file, dispatch with this brief: "You must plan the build from this spec and cannot ask its author anything. Read `<spec path>` and report only the issues or questions where a wrong guess would change the plan, ranked by importance, or say nothing important is left."
  - **Nothing left** (approved): go to 5.5.
  - **Issues or questions:** sort each into *already answered* (put the answer in the spec), *minor* (settle it, mark it as your call in the spec; a missing fact is never minor, record it as `Unverified` in Dependencies), or *only the user can answer* (the answer changes what gets built). Fix the first two inline. Ask the user the third in one message, most important first. Then dispatch again.
  - After 3 rounds without a clean result, show the open items to the user and let them decide.

**5.5. User review gate.** Say: "Spec written to `sdd-specs/features/YYYY-MM-DD-<name>-spec.md` and roadmap updated. Please review it and tell me about any changes before we continue." Wait for explicit approval. If they ask for changes, edit and repeat 5.3–5.4.

### 6. Flow Diagram (Ask First)

**6.1. Ask whether to draw it.** STOP and ask the user: "Would you like a companion flow diagram for this spec?" Wait for the answer. Do not dispatch anything in the same response.
- **No:** Skip to the hand-off below. Do not create a diagram file.
- **Yes:** Go to 6.2.

**6.2. Ask for the level of detail.** STOP and present these options, then wait for the user's choice:

| Level | What the diagram covers |
|---|---|
| **High-level** | Happy path only, 5–8 nodes. One box per major step; no error branches. |
| **Standard** | Happy path plus the main decision points and error branches from the spec's Acceptance Criteria. |
| **Detailed** | Every branch: happy path, error states, boundary conditions, retries, and which actor or component owns each step. |

**6.3. Ask for the diagram format.** STOP and present these options, then wait for the user's choice. Ask even if the user already mentioned a tool, so they can confirm it:

| Format | Diagram slot | Files saved to `sdd-specs/diagrams/` |
|---|---|---|
| **Mermaid** | A Mermaid flowchart code block inside the `.md` file. Renders inline in Git hosts and IDE previews. | `YYYY-MM-DD-<name>-flow.md` |
| **Excalidraw** | A valid Excalidraw scene file (JSON: `type`, `version`, `elements`, `appState`) with bound arrows between labelled shapes. The `.md` file links to it. Open it at excalidraw.com or in the VS Code Excalidraw extension. | `YYYY-MM-DD-<name>-flow.md` + `YYYY-MM-DD-<name>-flow.excalidraw` |

**6.4. Delegate the diagram.** Dispatch a background subagent with this EXACT task. Fill `[LEVEL]` and `[LEVEL DESCRIPTION]` from 6.2. Fill `[FORMAT]`, `[DIAGRAM SLOT]` and `[FILES]` from the user's row in 6.3:

```text
**Mission**: Read `sdd-specs/features/YYYY-MM-DD-<name>-spec.md`.
Draft a companion flow diagram document.
**Detail Level**: [LEVEL] — [LEVEL DESCRIPTION]. Include exactly this much detail: no less, no more.
**Diagram Format**: [FORMAT]
**REQUIRED OUTPUT STRUCTURE** (in the `.md` file):
1. **Descriptive Text**: Step-by-step explanation of the flow
2. **Simple Example**: A concrete example scenario
3. **Diagram**: [DIAGRAM SLOT]

Save to: [FILES] (all under `sdd-specs/diagrams/`).
Return confirmation listing every file saved.
```

Wait for subagent confirmation and notify the user.

**Hand-off** (after 6.1 "No", or after the diagram is confirmed):
`/sdd-plan-feature sdd-specs/features/YYYY-MM-DD-<name>-spec.md`

*(Context Isolation Rule: Diagrams stay in `diagrams/` folder. NEVER inject into the main feature spec to prevent context bloat.)*

## Common Mistakes
- **Creating feature roadmaps:** Append to the main `roadmap.md`. Do not create `features/roadmap.md`.
- **Absolute paths:** Use relative paths (`sdd-specs/features/...`).
- **Roadmap check-offs in spec:** `sdd-verify-feature` handles check-offs. Do not include them in feature spec tasks.

## Rationalization Table
| Excuse | Reality |
|--------|---------|
| "There's a PRD, so I'll skip Step 2." | The PRD path still runs the gap check and needs an explicit yes on the restate. |
| "There's a PRD, but I'll re-run the full interview to be safe." | `sdd-prd` already interviewed the user and got a yes. Re-asking settled topics wastes their time. Ask only about gaps. |
| "interview-me says stop my turn and offer downstream paths." | This skill is the downstream path. Continue to Step 3. |
| "Brainstorming would run fine in a subagent." | A subagent can't talk to the user, so it fakes approvals. Run it yourself. |
| "It's a small change, so brainstorming says build it after approval." / "A spike would settle this." | In this skill every size ends at the spec. Code comes from `/sdd-plan-feature`. |
| "A small change has no written design, so no review." | Every spec gets the self-review, the reviewer subagent and the user review gate. |
| "Brainstorming says save to `docs/superpowers/specs/`." | The feature spec is the only design file. |
| "The reviewer subagent approved, so I'll skip the user review." | The reviewer checks quality; the user checks it's what they want. Both are required. |
| "We used the Visual Companion" / "Feature is simple" — "so no need to ask about the flow diagram." | The companion is a live aid; the diagram is a saved file. The user decides whether one is drawn. Always ask (6.1). |
| "I'll pick a sensible level myself." / "Mermaid is the default." / "They mentioned Excalidraw, no need to ask." | Level and format are the user's choice. Ask 6.2 and 6.3 separately and wait. |
| "I'll tweak the dispatch template for Excalidraw." | Fill the `[FORMAT]`/`[DIAGRAM SLOT]`/`[FILES]` slots from the 6.3 row. Do not hand-edit the template. |
| "PRD has a Task Reference path but I'll add a fresh milestone bullet anyway." | The milestone bullet already exists from `sdd-task`. Append to it — a duplicate bullet breaks 1:1 milestone-to-task tracking. |

## Red Flags - STOP and Start Over
- Proceeding without all three constitution files
- Tolerating a "Never Do" violation
- Asking multiple interview questions at once
- Re-asking a topic the PRD already answers when it has no gap
- Stopping after intent confirmation to ask permission to continue
- Skipping brainstorming because user said so
- Delegating brainstorming to a subagent
- Playing back a design chunk about a screen, layout, flow, or component relationships without having made the Visual Companion offer
- Changing code, scaffolding, or invoking `writing-plans` during this skill
- Writing a design file outside the feature spec (e.g. `docs/superpowers/specs/`)
- Skipping the self-review, reviewer subagent, or user review gate (at any size)
- Modifying the template's headings or structure
- Writing Acceptance Criteria without the Given/When/Then/Outcome pattern
- Injecting the flow diagram into the spec
- Handing off to `/sdd-plan-feature` before a requested diagram subagent finishes
- Drawing or dispatching a flow diagram without asking the user first
- Dispatching the diagram subagent without the user's chosen detail level or format
- Combining any two of the diagram, detail-level and format questions in one question, or dispatching in the same response as any of them
- Diagram `.md` missing its descriptive text or simple example, or Excalidraw JSON embedded in the `.md`
- Generating the diagram yourself instead of delegating
- Adding a duplicate milestone bullet when the PRD's Task Reference already has one

**All of these mean: Stop. Delete any generated files. Start over from Step 1.**
