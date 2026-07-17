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
- Edit `sdd-specs/roadmap.md` to add the feature under the appropriate phase, linking to the spec file.

### 6. Delegate Flow Diagram
Dispatch a background subagent with this EXACT task:

```text
**Mission**: Read `sdd-specs/features/YYYY-MM-DD-<name>-spec.md`.
Draft a companion flow diagram document.
**REQUIRED OUTPUT STRUCTURE**:
1. **Descriptive Text**: Step-by-step explanation of the flow
2. **Simple Example**: A concrete example scenario
3. **Diagram**: Mermaid flow diagram annotations

Save to `sdd-specs/diagrams/YYYY-MM-DD-<name>-flow.md`.
Return confirmation when saved.
```

Wait for subagent confirmation, notify the user, then hand off:
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
| "Feature is simple, I'll skip the flow diagram." | You must dispatch the flow diagram subagent. |
| "I omitted the example because the flow is self-explanatory." | Examples ground abstract flows in reality. The structural template is required. |
| "I'll hand off before the diagram subagent finishes." | Wait for subagent confirmation first. |
| "The brainstorming skill told me to save." | The task override forbids saving files to disk. |
| "I should add roadmap check-offs to the spec." | `sdd-verify-feature` handles roadmap check-offs. |

## Red Flags - STOP and Start Over
- Proceeding without all three constitution files
- Tolerating a "Never Do" violation
- Asking multiple interview questions at once
- Skipping brainstorming because user said so
- Modifying the template's headings or structure
- Writing Acceptance Criteria without the Given/When/Then/Outcome pattern
- Injecting the flow diagram into the spec
- Handing off to `/sdd-plan-feature` before diagram subagent finishes
- Skipping flow diagram subagent
- Generating the diagram yourself instead of delegating
- Generating a flow diagram document without a simple example
- Brainstorming subagent saved a design file to disk
- Adding roadmap check-off tasks to feature spec

**All of these mean: Stop. Delete any generated files. Start over from Step 1.**

