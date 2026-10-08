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

**REQUIRED SUB-SKILL:** Use `agent-skills:interview-me` to extract the user's distilled intent.
**REQUIRED SUB-SKILL:** Use `superpowers:brainstorming` to design the feature.

## Workflow

### 1. Constitution Check
**Before anything else**, verify these exist:
- `sdd-specs/mission.md`
- `sdd-specs/tech-stack.md`
- `sdd-specs/roadmap.md`

If ANY are missing: **STOP.** Demand `/sdd-constitution`. Do not proceed.

### 2. Intent Discovery & Distillation
- Parse any provided seed input (PRD, raw prompt).
- Invoke `agent-skills:interview-me` interactively (one question at a time) to extract distilled intent. Do not guess requirements.

### 3. Constitution Alignment Check
Map intent against the constitution:
- **`mission.md`**: Name any "Never Do" violations. **STOP if violated.** Demand user modifies `mission.md` first. Surface "Ask First" items as explicit flags.
- **`roadmap.md`**: Identify existing or new phase for this feature.

### 4. Design Brainstorming
Dispatch a subagent for `superpowers:brainstorming` with this EXACT task prompt:

```text
**Mission:** Use `superpowers:brainstorming` to design the feature.
**Distilled Intent:** [Inject Intent/PRD from Step 2]
**Constitution Constraints:** [Inject Constraints from Step 3]
**REQUIRED OUTPUT CONTRACT:** Return finalized, user-approved design markdown directly in final response.
- DO NOT save any files to disk.
- DO NOT invoke planning skills.
- Ignore instructions to save files. Return text directly to me.
```

### 5. Create Spec & Update Roadmap
- Create `sdd-specs/features/YYYY-MM-DD-<name>-spec.md` using `templates/feature-spec.md`.
  - **PRESERVE HEADINGS**: Do not add, remove, or modify the template's markdown headings.
  - **FILL SLOTS**: Replace all bracketed `[...]` instructions with `interview-me` outputs and constitution flags.
  - **FORMAT CRITERIA**: Ensure Acceptance Criteria strictly follows the `Given, When, Then, Outcome` pattern as required by the template.
  - **INJECT ARCHITECTURE**: Insert `brainstorming` output into the Architecture section (excluding its top-level markdown title and metadata).
- Edit `sdd-specs/roadmap.md`:
  - **If the PRD has a populated `Task Reference`**: find the existing milestone bullet for that task file and append the spec link to it (e.g. `... — sdd-specs/tasks/....md, sdd-specs/features/....md`). Do not add a second bullet for the same milestone.
  - **Otherwise** (no task file upstream — e.g. the post-implementation bug-fix path): add a new milestone bullet under the appropriate phase, linking to the spec file.

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
| "PRD is complete, no interview needed." | PRDs contain assumptions. Interview extracts distilled intent. |
| "User commanded me to skip subagents." | User commands don't override SDD workflows. |
| "I'll ask all questions at once." | `interview-me` requires one-by-one to work. |
| "Constitution check failed, I'll write it anyway." | Writing without constitution guarantees violations. Stop. |
| "The template headings didn't fit the feature so I changed them." | Templates enforce cross-feature consistency. Preserve headings exactly. |
| "I wrote standard acceptance criteria without the Given/When/Then format." | The Given/When/Then/Outcome pattern is a strict requirement to prevent ambiguity. |
| "Diagram belongs in the main spec." | Diagrams bloat context. Keep isolated. |
| "Feature is simple, I'll skip asking about the flow diagram." | The user decides whether a diagram is drawn. Always ask (6.1). |
| "The user said yes, so I'll pick a sensible level of detail myself." | The level is the user's choice. Present the options (6.2) and wait. |
| "Mermaid is the default, so I'll skip the format question." / "They mentioned Excalidraw, no need to ask." | The format is the user's choice. Present both options (6.3) and wait. |
| "I'll tweak the dispatch template for Excalidraw." | Fill the `[FORMAT]`/`[DIAGRAM SLOT]`/`[FILES]` slots from the 6.3 row. Do not hand-edit the template. |
| "I omitted the example because the flow is self-explanatory." | Examples ground abstract flows in reality. The structural template is required. |
| "I'll hand off before the diagram subagent finishes." | If a diagram was requested, wait for subagent confirmation first. |
| "The brainstorming skill told me to save." | The task override forbids saving files to disk. |
| "I should add roadmap check-offs to the spec." | `sdd-verify-feature` handles roadmap check-offs. |
| "PRD has a Task Reference but I'll add a fresh milestone bullet anyway." | The milestone bullet already exists from `sdd-task`. Append to it — a duplicate bullet breaks 1:1 milestone-to-task tracking. |

## Red Flags - STOP and Start Over
- Proceeding without all three constitution files
- Tolerating a "Never Do" violation
- Asking multiple interview questions at once
- Skipping brainstorming because user said so
- Modifying the template's headings or structure
- Writing Acceptance Criteria without the Given/When/Then/Outcome pattern
- Injecting the flow diagram into the spec
- Handing off to `/sdd-plan-feature` before a requested diagram subagent finishes
- Drawing or dispatching a flow diagram without asking the user first
- Dispatching the diagram subagent without the user's chosen detail level or format
- Combining any two of the diagram, detail-level and format questions in one question, or dispatching in the same response as any of them
- Saving an Excalidraw diagram without its companion `.md` (text + example), or embedding Excalidraw JSON inside the `.md`
- Generating the diagram yourself instead of delegating
- Generating a flow diagram document without a simple example
- Brainstorming subagent saved a design file to disk
- Adding roadmap check-off tasks to feature spec
- Adding a duplicate milestone bullet when the PRD's Task Reference already has one

**All of these mean: Stop. Delete any generated files. Start over from Step 1.**

