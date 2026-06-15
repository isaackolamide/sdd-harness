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

### Step 1: Read the Roadmap
Open `specs/roadmap.md`. Identify the next incomplete phase or milestone and present it to the user for confirmation before continuing.

### Step 2: Ask Before Planning
Use AskUserQuestion / `agent-skills:interview-me` grouped on the 3 output files (plan.md, requirements.md, validation.md) to confirm:

1. Continue on current branch, or create a new branch for this feature?
2. What is the feature name? (used as `YYYY-MM-DD-{feature-name}` for the directory)
3. Brief description: what should this feature do?

Do not proceed to writing-plans or disk until these are confirmed.

### Step 3: Gather Context
Read `specs/mission.md` and `specs/tech-stack.md` — use them to inform scope, constraints, and code style decisions during planning.

### Step 4a: Run Planning-and-Task-Breakdown
Trigger `agent-skills:planning-and-task-breakdown` with the confirmed feature description and context from specs/. This pass establishes:
- Dependency graph (what must be built before what)
- Vertical slices (each task delivers working software, not just a layer)
- Task sizing (break down anything too large before continuing)
- Checkpoint placement between phases

Do not proceed to 4b until the task order, sizing, and checkpoints are confirmed.

**ADR trigger:** When `requirements.md` records a significant architectural or technology choice (framework selection, data model, auth strategy, API architecture, or any decision that would be expensive to reverse), invoke `agent-skills:documentation-and-adrs` to write an ADR alongside the plan files. Do not apply this to every decision — only to choices where the rationale and rejected alternatives have future value.

### Step 4b: Run Writing-Plans
Trigger `superpowers:writing-plans` on the structured task list from 4a. This pass fills in executable detail for each task:
- Actual code for every step
- Exact commands with expected output
- TDD steps (write failing test → run → implement → run → commit)

Let writing-plans drive the per-task detail — do not hand-write steps.

### Step 5: Output
Create the feature directory and generate the 3 files:

```
specs/
└── YYYY-MM-DD-{feature-name}/
    ├── plan.md          → Numbered task groups (what to build, in order)
    ├── requirements.md  → Scope, decisions, context, out-of-scope
    └── validation.md    → How to know implementation succeeded and can be merged
```

Important: Use AskUserQuestion / `agent-skills:interview-me` grouped on these 3 before writing any file to disk.

## File Templates

### plan.md

Structured output from writing-plans, reformatted into task groups:

```markdown
# Feature Plan: {feature-name}

## Group 1: {Group Name}
1. [ ] Task
2. [ ] Task

## Group 2: {Group Name}
1. [ ] Task
2. [ ] Task

## Group N: {Group Name}
1. [ ] Task
```

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
```

### validation.md

Definition of "done" — how to confirm implementation is mergeable:

```markdown
# Validation: {feature-name}

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

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

1. Open `specs/roadmap.md` → identify next incomplete phase → present to user
2. Use AskUserQuestion / `agent-skills:interview-me` grouped on plan.md / requirements.md / validation.md — confirm branch strategy, feature name, and description before writing anything
3. Read `specs/mission.md` and `specs/tech-stack.md` for project context
4. Trigger `agent-skills:planning-and-task-breakdown` — dependency graph, vertical slices, task sizing, checkpoints
5. Confirm task order and sizing with user before continuing
6. Trigger `superpowers:writing-plans` on the structured task list — fill in code, commands, TDD steps
7. Create `specs/YYYY-MM-DD-{feature-name}/` directory
8. Write plan.md, requirements.md, and validation.md from combined output

## Key Points

- Always read roadmap.md first — plans should map to an existing phase
- Branch decision is confirmed before anything touches disk
- Two-pass planning: breakdown first (order + sizing), writing-plans second (executable detail)
- Never skip the breakdown pass — writing-plans without ordering produces well-written tasks in the wrong sequence
- plan.md combines structure from planning-and-task-breakdown with executable steps from writing-plans
- requirements.md makes out-of-scope explicit, not just in-scope
- validation.md defines "done" before implementation starts — not after
