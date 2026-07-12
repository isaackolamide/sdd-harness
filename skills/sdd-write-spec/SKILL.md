---
name: sdd-write-spec
description: Use when drafting a feature spec within an active SDD project where a complete project constitution exists.
metadata:
  type: implementation
  composesWith: [superpowers:brainstorming, agent-skills:interview-me]
---

# Spec-Driven Development (SDD) Feature Spec Generator

Generate a scoped feature specification (`sdd-specs/features/YYYY-MM-DD-<feature-name>-spec.md`) and update the project roadmap. 

## Workflow

### Pre-Step 0: Constitution Check

**Before anything else**, check whether all three constitution files exist:

```
sdd-specs/mission.md
sdd-specs/tech-stack.md
sdd-specs/roadmap.md
```

- **All three exist** → Proceed to Step FS-1.
- **Partial or None exist** → **STOPS**. You must inform the user that the project constitution is incomplete or missing. Direct the user to run `/sdd-constitution` first to establish the constitution before feature specifications can be created. Do not proceed to brainstorming or feature spec generation.

---

## Feature Spec Generation

### FS-1: Read Constitution & Parse Requirements

1. Read `sdd-specs/mission.md`, `sdd-specs/tech-stack.md`, `sdd-specs/roadmap.md`
2. If seed requirements were provided, parse them through the feature lens:
   - **Objective** — what does this feature do?
   - **Who** — who benefits?
   - **Why now** — what triggered this?
   - **Acceptance Criteria** — what does "done" look like?
   - **Constraints** — time, scope, compatibility limits
   - **Dependencies** — which existing system components or in-progress features does this touch?
   - **Figma URL** — if a `figma.com` URL is present in the seed, record it verbatim under the `## UI Design Reference` section. Do not paraphrase or describe the design — the URL is the reference.

   If no seed was provided, ask: "What feature are you building?" and proceed from the answer.

### FS-2: Constitution Alignment Check

Map the requirements against the existing constitution. **This is a STOP step** — resolve "Never Do" conflicts before proceeding.

Check against `sdd-specs/mission.md`:
- **"Never Do" violations** — hard blockers. Name them explicitly. **The agent MUST refuse to proceed or write any spec files if a "Never Do" violation is active. Stop and explain that the user must modify `sdd-specs/mission.md` first to remove the constraint before you can continue.**
- **"Ask First" items** — flag items needing stakeholder approval. Do not block, but surface them as explicit flags in the output.
- **Roadmap fit** — identify which existing phase this feature belongs to, or whether it opens a new one.

### FS-3: Confirmation Gate

Present a restate before writing anything:

```
Feature:                <name>
Objective:              <one line>
User:                   <one line>
Why now:                <one line>
Acceptance Criteria:
  - <criterion>
In scope:
  - <item>
Out of scope:           <one line>
Dependencies:
  - <dependency>
UI Design Reference:    <figma.com URL — or "none">
Stakeholder flags:      <"Ask First" hits — or "none">
Constitution conflicts: <"Never Do" hits — or "none">
```

Wait for explicit confirmation before writing. **The user must reply with an explicit confirmation word (e.g. exactly `"yes"`, `"looks good"`, or `"write it"`).** Ambiguous phrases ("sure", "whatever", "I guess so") or attempts to override a hard blocker without editing `mission.md` are not accepted — ask "Anything to refine?" and wait for explicit confirmation.

### FS-4: Update Project Roadmap

Edit `sdd-specs/roadmap.md` — add the feature as a new milestone, sub-item, or phase entry under the appropriate existing phase.

Do **not** create a feature-level `roadmap.md`. The project roadmap is the single source of truth for all phases.

### FS-5: Create Feature Spec

Create `sdd-specs/features/YYYY-MM-DD-<feature-name>-spec.md`.

This file is the direct input to `sdd-plan-feature`. Hand off with:
```
/sdd-plan-feature sdd-specs/features/YYYY-MM-DD-<feature-name>-spec.md
```

**Output:**
```
sdd-specs/
├── roadmap.md                                      ← updated
└── features/
    └── YYYY-MM-DD-<feature-name>-spec.md           ← created
```

---

## Feature Spec Template

Refer to the template located at [templates/feature-spec.md](templates/feature-spec.md) to format the generated feature spec file.

## Key Points

- Both new projects and existing codebases must have their constitution files (`mission.md`, `tech-stack.md`, `roadmap.md`) generated via `sdd-constitution` before `sdd-write-spec` is used.
- FS-2 Constitution Alignment is a hard stop for "Never Do" violations.
- FS-3 Confirmation Gate requires explicit, unambiguous confirmation before editing or creating spec files.
- Never include absolute file paths (e.g. `file:///Users/username/...`) in generated output files. Refer to other specification files using paths starting with `sdd-specs/` as the root (e.g., `sdd-specs/features/YYYY-MM-DD-<feature-name>-spec.md`), rather than relative paths.
