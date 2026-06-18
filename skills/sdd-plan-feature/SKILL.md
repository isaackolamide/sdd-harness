---
name: sdd-plan-feature
description: Plan a feature within an SDD project — wraps superpowers:writing-plans and outputs plan.md/requirements.md/validation.md in a dated specs/ subdirectory
metadata:
  type: implementation
  composesWith: [agent-skills:planning-and-task-breakdown, superpowers:writing-plans]
---

# SDD Feature Planner

Plan a feature within your SDD project. This skill wraps `superpowers:writing-plans` to produce structured planning output in your project's `specs/` directory — the same way `sdd-write-spec` wraps brainstorming to produce the constitution.

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
- Check whether `specs/roadmap.md` exists
  - **Yes:** Read it, identify the next incomplete phase/milestone, present to user for confirmation
  - **No:** Ask: "What feature are you planning?" (single question) and proceed from the answer

### Step 1: Gather Project Context

Read project context **before** any user questions, so questions are informed by existing constraints.

1. Read `specs/mission.md` (if it exists) — extract objective, boundaries, constraints
2. Read `specs/tech-stack.md` (if it exists) — extract project structure, code style, testing strategy
3. Read `specs/roadmap.md` (if it exists and not already read in Pre-Step 0) — understand where this feature fits in the project timeline

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
- If all four core fields are PRESENT → skip Step 2b, proceed to Step 3
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
  > "I'll name this feature `{proposed-name}` (directory: `specs/plans/YYYY-MM-DD-{proposed-name}/`). Good?"
- If not inferrable, ask:
  > "What should this feature be called? (used as `specs/plans/YYYY-MM-DD-{name}/`)"

This is a single question — not an interview. Branch strategy is **not** asked here; it belongs to implementation time and is handled by `sdd-implement-plan` or `agent-skills:git-workflow-and-versioning`.

Create the feature directory `specs/plans/YYYY-MM-DD-{feature-name}/` immediately after the name is confirmed. This ensures a landing spot for the breakdown written in Step 4a.

### Step 4a: Run Planning-and-Task-Breakdown

Trigger `agent-skills:planning-and-task-breakdown` with:
- Confirmed feature description (from intent restatement or seed input)
- Project context from Step 1 (mission, tech stack, roadmap phase)
- Constraints and out-of-scope from Steps 2/2b
- Any referenced files read during Pre-Step 0

**User confirmation gate:** Do not proceed to Step 4b until the task order, sizing, and checkpoints are confirmed.

**CRITICAL:** The breakdown produced here is a confirmation artifact only — it is NOT plan.md and must NOT be written to disk as plan.md. Step 4b transforms it into the final format.

After user confirms, write the breakdown to `specs/plans/YYYY-MM-DD-{feature-name}/breakdown.md`. This persists the task list against context compaction or session interruption — Step 4b reads from this file.

**ADR trigger:** When decomposition surfaces a significant architectural or technology choice (framework selection, data model, auth strategy, API architecture, or any decision expensive to reverse):
- Invoke `agent-skills:documentation-and-adrs`
- **Save location:** `docs/decisions/ADR-{NNN}-{title}.md` — sequential numbering; check existing files to determine next number. ADRs are project-level artifacts and are **not** saved inside the feature directory.
- **Cross-reference:** Add the ADR path to `requirements.md` under the Decisions section

Apply the ADR trigger only to choices where the rationale and rejected alternatives have future value — not to every decision.

### Step 4b: Run Writing-Plans

Trigger `superpowers:writing-plans` using `specs/plans/YYYY-MM-DD-{feature-name}/breakdown.md` as the task source. If Step 4a's output is not in context (e.g., after compaction or session restart), read that file before triggering. Use project context from Step 1 as background. Its output becomes plan.md. Before writing, strip the `**For agentic workers:**` routing line from the top if present — execution routing is handled by `sdd-implement-plan`.

Output location: `specs/plans/YYYY-MM-DD-{feature-name}/plan.md` (not writing-plans' default `docs/superpowers/plans/`).

### Step 5: Pre-Write Review

Before writing any file to disk, present a structured summary of what will be written and probe for gaps.

**Present summary:**
```
I'm about to write three files to specs/plans/YYYY-MM-DD-{feature-name}/:

plan.md:
  - {N} task groups, {M} total tasks
  - Key phases: [list group names]

requirements.md:
  - In scope: [2-3 bullet summary]
  - Out of scope: [1-2 bullets]
  - Key decisions: [list any ADRs written, or "none"]

validation.md:
  - {K} acceptance criteria
  - Definition of done: [one-line summary]
```

**Ask a focused probe:**
> "Before I write these: is there anything in the plan that surprises you, anything missing from scope, or any acceptance criterion that feels wrong?"

**If concerns are raised:**
- Use interview-me's single-question follow-up style to clarify each concern
- Adjust plan content and restate the adjustment
- Confirm the adjustment before continuing

**If confirmed (explicit "yes", "looks good", or "write it"):** proceed to Step 6.

### Step 6: Output

Create the feature directory and generate the three files:

```
specs/plans/
└── YYYY-MM-DD-{feature-name}/
    ├── plan.md          → TDD implementation plan from writing-plans
    ├── requirements.md  → Scope, decisions, context, out-of-scope
    └── validation.md    → How to know implementation succeeded and can be merged
```

`breakdown.md` is written during Step 4a as a context-safety handoff. Delete it after `plan.md` is confirmed written in Step 6.

## File Templates

### plan.md

Executable implementation plan produced by `superpowers:writing-plans`. Format is owned by that skill — do not reformat or simplify the output. Exception: strip the `**For agentic workers:**` routing line from the top if present.

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
- specs/mission.md — Project objective and boundaries
- specs/tech-stack.md — Technical constraints and code style
- specs/roadmap.md — Phase this feature belongs to
- docs/decisions/ADR-{NNN}-{title}.md — [decision title] (include only if an ADR was written)
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
2. If no seed: check for `specs/roadmap.md` → present next incomplete phase; if no roadmap: ask "what feature?"
3. Read `specs/mission.md`, `specs/tech-stack.md`, `specs/roadmap.md` for project context (missing files don't block)
4. Assess minimum viable fields (Who/Why/Success/Constraint) — if all present, skip to Step 6 (feature naming)
5. If any core field is missing: invoke `agent-skills:interview-me` — one question at a time, informed by project context; require explicit "yes" before continuing
6. Probe Dependencies if not already clear from context
7. Confirm feature name (propose if inferrable; otherwise ask a single question) — create `specs/plans/YYYY-MM-DD-{feature-name}/` directory immediately after confirmation
8. Trigger `agent-skills:planning-and-task-breakdown` — dependency graph, vertical slices, task sizing, checkpoints
9. If a significant architectural decision surfaces: invoke `agent-skills:documentation-and-adrs` → save to `docs/decisions/ADR-{NNN}-{title}.md`; cross-reference in requirements.md
10. Confirm task order and sizing with user before continuing — then write the confirmed breakdown to `specs/plans/YYYY-MM-DD-{feature-name}/breakdown.md`
11. Trigger `superpowers:writing-plans` using `breakdown.md` as the source — its output becomes plan.md; save to `specs/plans/YYYY-MM-DD-{feature-name}/plan.md`
12. Present pre-write summary of all three files — ask focused probe; resolve concerns before writing
13. Write plan.md, requirements.md, and validation.md to `specs/plans/YYYY-MM-DD-{feature-name}/` — then delete `breakdown.md`

## Key Points

- Minimum viable fields check (Who/Why/Success/Constraint + Dependencies) gates interview-me — only invoke the deep interview when fields are genuinely missing
- Two-pass planning: breakdown first (order + sizing), writing-plans second (executable detail) — never skip the breakdown pass
- breakdown.md is a temporary handoff file — written after Step 4a confirmation, read by Step 4b if context is lost, deleted after plan.md is written
- ADRs are project-level artifacts saved to `docs/decisions/` with sequential numbering — not in the feature directory
- Pre-write review probes for gaps with a structured summary and a focused probe question before committing files to disk
- requirements.md makes out-of-scope explicit, not just in-scope
- validation.md defines "done" before implementation starts — not after
