---
name: sdd-plan-feature
description: Plan a feature within an SDD project — wraps agent-skills:planning-and-task-breakdown and outputs plan.md/requirements.md/validation.md in a dated sdd-specs/ subdirectory
metadata:
  type: implementation
  composesWith: [agent-skills:planning-and-task-breakdown, agent-skills:interview-me]
---

# SDD Feature Planner

Plan a feature within your SDD project. This skill wraps `agent-skills:planning-and-task-breakdown` to produce structured planning output in your project's `sdd-specs/` directory — the same way `sdd-write-spec` wraps brainstorming to produce the constitution.

## Workflow

### Pre-Step 0: Seed Input Check

Before reading any file, check whether the user provided feature context when invoking the skill:

**Accepted seed formats:**
- Free-form prompt text or bullet-point brief
- A reference to a file (e.g., "plan the feature described in `docs/ideas/search.md`") — read that file
- Conversation context from a prior `agent-skills:interview-me`, brainstorming, or `sdd-write-spec` session
- A reference to a roadmap phase (e.g., "next item on the roadmap", "Phase 3")

**If seed input was provided:**
- Parse it through the 4-field lens: Who, Why, Success, Constraint
- Mark which fields are already answered — these are skipped in subsequent interview steps
- Do not re-ask things already covered by the seed

**If no seed input:**
- Check whether `sdd-specs/roadmap.md` exists
  - **Yes:** Read it, identify the next incomplete phase/milestone, present to user for confirmation
  - **No:** Ask: "What feature are you planning?" (single question) and proceed from the answer

### Step 1: Gather Project Context

Read project context **before** any user questions, so questions are informed by existing constraints.

1. Read `sdd-specs/mission.md` (if it exists) — extract objective, boundaries, constraints
2. Read `sdd-specs/tech-stack.md` (if it exists) — extract project structure, code style, testing strategy
3. Read `sdd-specs/roadmap.md` (if it exists and not already read in Pre-Step 0) — understand where this feature fits in the project timeline

Missing files do not block. Note their absence internally but proceed with whatever context is available.

Build an internal context block that informs all subsequent steps:
```
PROJECT CONTEXT:
- Mission:         [from mission.md or "not specified"]
- Tech stack:      [key technologies from tech-stack.md or "not specified"]
- Current phase:   [from roadmap.md or "not specified"]
- Boundaries:      [from mission.md or "not specified"]
```

### Step 2: Minimum Viable Fields Check

Assess whether enough information exists to plan, or whether a deep interview is needed.

**The five fields:**
1. **Who** — who benefits from this feature? (stakeholder, user persona)
2. **Why** — why build it now? (what prompted this, what problem it solves)
3. **Success** — what does "done" look like? (concrete outcome)
4. **Constraint** — what is the binding limit? (time, scope, compatibility, performance)
5. **Dependencies** — does this feature touch or depend on existing systems? (optional but always probed if context is available)

**Assessment logic:**
- Check seed input (Pre-Step 0) and project context (Step 1) against fields 1–4
- Mark each field as: PRESENT (answered by seed or context) or MISSING
- If all four core fields are PRESENT → skip Step 2b, probe Dependencies (line above) if not already clear from context, then proceed to Step 3
- If any core field is MISSING → proceed to Step 2b (Deep Interview)
- Dependencies: always probe if not already clear from context, even when the four core fields are present

### Step 2b: Deep Interview (conditional)

Invoked only when one or more core fields are missing.

**Skill invoked:** `agent-skills:interview-me`

**Instructions for invocation:**
- Frame questions around what the seed and project context could NOT answer — never re-ask covered ground
- Use the project context block from Step 1 to make informed guesses (attach them to each question per interview-me protocol)

**Stop condition:** interview-me's native stop — can predict the user's reaction to the next three questions, and all four core fields are filled.

**Output:** A confirmed intent restatement:
```
- Outcome:      <one line>
- User:         <one line>
- Why now:      <one line>
- Success:      <one line>
- Constraint:   <one line>
- Out of scope: <one line>
```

Wait for explicit "yes" confirmation before proceeding.

### Step 3: Feature Naming

Establish the feature name for the output directory.

- If inferrable from seed input or interview output, propose it:
  > "I'll name this feature `{proposed-name}` (directory: `sdd-specs/plans/YYYY-MM-DD-{proposed-name}/`). Good?"
- If not inferrable, ask:
  > "What should this feature be called? (used as `sdd-specs/plans/YYYY-MM-DD-{name}/`)"

This is a single question — not an interview. Branch strategy is **not** asked here; it belongs to implementation time and is handled by `sdd-implement-plan` or `agent-skills:git-workflow-and-versioning`.

Create the feature directory `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` immediately after the name is confirmed.

### Step 4: Run Planning-and-Task-Breakdown, Then Format plan.md

Trigger `agent-skills:planning-and-task-breakdown` with:
- Confirmed feature description (from intent restatement or seed input)
- Project context from Step 1 (mission, tech stack, roadmap phase)
- Constraints and out-of-scope from Steps 2/2b
- Any referenced files read during Pre-Step 0

**User confirmation gate:** Do not proceed until the task order, sizing, and checkpoints are confirmed by the user.

After user confirms the breakdown, format the output directly into `plan.md` using the template in the **File Templates** section below. Format output directly into plan.md with no intermediate files of any kind — write to `sdd-specs/plans/YYYY-MM-DD-{feature-name}/plan.md` directly.

**Key formatting rules:**
- Each task gets a lightweight `Interfaces` line — declare what the task produces (function name + type) and what it consumes from prior tasks. This is NOT pre-written code; it is a contract declaration so subagent implementers know what signatures to implement and what is available from earlier slices. Full signatures are required for both produced and consumed functions — prose descriptions ("produces email sending functionality") are not acceptable; if you cannot name a function signature, the task decomposition is not done yet.
- Each phase ends with a `### Checkpoint — Phase N` block with a checkbox. `sdd-implement-plan` runs this verification before advancing to the next phase.
- No code blocks, no TDD steps, no bash commands — those are `sdd-implement-plan`'s responsibility at execution time.

**ADR trigger:** When decomposition surfaces a significant architectural or technology choice (framework selection, data model, auth strategy, API architecture, or any decision expensive to reverse):
- Invoke `agent-skills:documentation-and-adrs`
- **Save location:** `sdd-docs/decisions/ADR-{NNN}-{title}.md` — sequential numbering; check existing files to determine next number. ADRs are project-level artifacts and are **not** saved inside the feature directory.
- **Cross-reference:** Add the ADR path to `requirements.md` under the Decisions section

Apply the ADR trigger only to choices where the rationale and rejected alternatives have future value — not to every decision.

### Step 5: Pre-Write Review

Before writing any file to disk, present a structured summary of what will be written and probe for gaps.

**Present summary:**
```
I'm about to write three files to sdd-specs/plans/YYYY-MM-DD-{feature-name}/:

plan.md:
  - {N} phases, {M} total tasks
  - Phase names: [list]
  - {K} checkpoint blocks

requirements.md:
  - In scope: [2-3 bullet summary]
  - Out of scope: [1-2 bullets]
  - Key decisions: [list any ADRs written, or "none"]

validation.md:
  - {J} acceptance criteria
  - Definition of done: [one-line summary]
```

**Ask a focused probe:**
> "Before I write these: is there anything in the plan that surprises you, anything missing from scope, or any acceptance criterion that feels wrong?"

**If concerns are raised:**
- Use interview-me's single-question follow-up style to clarify each concern
- Adjust plan content and restate the adjustment
- Confirm the adjustment before continuing

**To proceed to Step 6:** present the summary, ask the focused probe question, then wait for explicit confirmation ("yes", "looks good", or "write it") — do not skip the probe question even if the user has expressed urgency.

### Step 6: Output

Generate the three files:

```
sdd-specs/plans/
└── YYYY-MM-DD-{feature-name}/
    ├── plan.md          → Phase-structured task list with interface contracts and checkpoint blocks
    ├── requirements.md  → Scope, decisions, context, out-of-scope
    └── validation.md    → How to know implementation succeeded and can be merged
```

## File Templates

### plan.md

Phase-structured implementation plan. No code blocks — interface contracts only. Checkboxes on acceptance criteria (ticked by `sdd-implement-plan` at execution time) and checkpoint blocks (run at phase boundaries).

```markdown
# [Feature Name] Implementation Plan

**Goal:** [one sentence describing what this builds]
**Architecture:** [2-3 sentences about approach]
**Tech Stack:** [key technologies]

---

## Phase 1: [Phase Name]

### Task 1.1: [Task Name]
- Scope: S/M/L
- Files: `exact/path/to/file.ts` (create), `exact/path/to/existing.ts` (modify)
- Interfaces: produces `functionName(param: Type): ReturnType`; consumes `otherFn(param: Type): ReturnType` from Task 1.X
- Acceptance criteria:
  - [ ] Given [context], When [action], Then [outcome]
  - [ ] [Additional criterion]
- Verification: `npm test path/to/test.ts`
- Dependencies: none

### Task 1.2: [Task Name]
- Scope: S/M/L
- Files: ...
- Interfaces: produces `anotherFn(input: InputType): OutputType`; consumes `functionName(param: Type): ReturnType` from Task 1.1
- Acceptance criteria:
  - [ ] ...
- Verification: ...
- Dependencies: Task 1.1

### Checkpoint — Phase 1
- [ ] [Integration condition — be specific, not "all tasks complete"; e.g., "all Phase 1 tests pass end-to-end", "API contract validated against consumer"]
- Verification: `[command that proves the condition — e.g., "npm test src/phase1/" or "npm run build"]`

---

## Phase 2: [Phase Name]

### Task 2.1: [Task Name]
...

### Checkpoint — Phase 2
- [ ] [Integration condition for final phase — e.g., "all tests pass and build is clean, no TypeScript errors"]
- Verification: `[command]`
```

**Scope sizing reference:**
- S = 1 file, 1-2 hours
- M = 2-3 files, half day
- L = 4-5 files, full day (consider breaking down further)

### requirements.md

Scope and context to guide implementation:

```markdown
# Feature Requirements: {feature-name}

## Scope

In scope:
-

Out of scope:
-

## Decisions

Key technical decisions made:
-

## Context

Why this feature is being built:
-

## References
- sdd-specs/mission.md — Project objective and boundaries
- sdd-specs/tech-stack.md — Technical constraints and code style
- sdd-specs/roadmap.md — Phase this feature belongs to
- sdd-docs/decisions/ADR-{NNN}-{title}.md — [decision title] (include only if an ADR was written)
```

### validation.md

Definition of "done" — how to confirm implementation is mergeable:

```markdown
# Validation: {feature-name}

## Acceptance Criteria

For behavioral criteria, prefer Given/When/Then:
- [ ] Given [context], When [action], Then [outcome]

For non-functional or structural criteria, a plain statement is fine:
- [ ] Criterion

## Test Coverage
- [ ] Unit tests pass for new logic
- [ ] Integration tests pass
- [ ] E2E covers critical path (if applicable)

## Manual Checks
- [ ] Check 1
- [ ] Check 2

## Definition of Done

This feature is mergeable when:
- All acceptance criteria above are checked
- No regressions in existing tests
- Code review approved
```

## Implementation

When you invoke `/sdd-plan-feature`:

1. Check for seed input (prompt text, file reference, conversation context, roadmap phase reference) — parse through Who/Why/Success/Constraint lens and mark what is already answered
2. If no seed: check for `sdd-specs/roadmap.md` → present next incomplete phase; if no roadmap: ask "what feature?"
3. Read `sdd-specs/mission.md`, `sdd-specs/tech-stack.md`, `sdd-specs/roadmap.md` for project context (missing files don't block)
4. Assess minimum viable fields (Who/Why/Success/Constraint) — if all present, skip to item 6 (probe Dependencies), then proceed to Step 3 (feature naming)
5. If any core field is missing: invoke `agent-skills:interview-me` — one question at a time, informed by project context; require explicit "yes" before continuing
6. Probe Dependencies if not already clear from context
7. Confirm feature name (propose if inferrable; otherwise ask a single question) — create `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` directory immediately after confirmation
8. Trigger `agent-skills:planning-and-task-breakdown` — dependency graph, vertical slices, task sizing, checkpoints
9. If a significant architectural decision surfaces: invoke `agent-skills:documentation-and-adrs` → save to `sdd-docs/decisions/ADR-{NNN}-{title}.md`; cross-reference in requirements.md
10. Confirm task order and sizing with user before continuing — then format output directly into `plan.md` using the template above (no breakdown.md intermediate file)
11. Present pre-write summary of all three files — ask focused probe; resolve concerns before writing
12. Write plan.md, requirements.md, and validation.md to `sdd-specs/plans/YYYY-MM-DD-{feature-name}/`

## Key Points

- Minimum viable fields check (Who/Why/Success/Constraint + Dependencies) gates interview-me — only invoke the deep interview when fields are genuinely missing
- Single-pass planning: planning-and-task-breakdown output is formatted directly into plan.md — no intermediate files of any kind, no writing-plans pass
- Plans contain interface contracts (function name + type per task), not code — TDD execution is sdd-implement-plan's job at implementation time. If you cannot name a function signature for a task, decompose that task further: inspect existing code for caller conventions, ask the user what the consuming task expects, or stub a name and type from the task description
- Phase sections with checkpoint blocks enable phase-level verification gates during implementation
- ADRs are project-level artifacts saved to `sdd-docs/decisions/` with sequential numbering — not in the feature directory
- Pre-write review probes for gaps with a structured summary and a focused probe question before committing files to disk
- requirements.md makes out-of-scope explicit, not just in-scope
- validation.md defines "done" before implementation starts — not after
