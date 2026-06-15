---
name: sdd-implement-plan
description: Execute a feature plan produced by sdd-plan-feature — wraps agent-skills:incremental-implementation and superpowers:test-driven-development, drives slice-by-slice execution with plan.md progress tracking, and hands off to /i-need-code-review on completion
metadata:
  type: implementation
  composesWith: [agent-skills:incremental-implementation, superpowers:test-driven-development]
---

# SDD Implementation Driver

Execute a feature plan produced by `/sdd-plan-feature`. This skill wraps `agent-skills:incremental-implementation` and `superpowers:test-driven-development` to guarantee co-invocation of both primitives — closing the triggering gap in the SDD workflow.

## Position in the SDD Trilogy

```
/sdd-write-spec      → specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature    → specs/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan  → commits per slice (plan.md checkboxes ticked) → /i-need-code-review
```

## Workflow

### Step 1: Locate Spec Directory

If the feature path or name is inferable from conversation context, confirm it with the user before proceeding. If not, list available `specs/` directories and ask the user to pick.

### Step 2: Read Input Files

Read all three files before any code is touched:

- `plan.md` — task list with checkboxes; execution order; resume point if session interrupted
- `requirements.md` — scope, decisions, constraints; keep in context throughout implementation
- `validation.md` — definition of done; surface only at end

### Step 3: Ask Mode Once

Before starting any slice, ask once using AskUserQuestion:

> "Run in **autonomous mode** (proceed through all slices without pausing) or **checkpoint mode** (pause after each slice for your confirmation)?"

Do not ask again during execution.

### Step 4: Slice Execution Loop

For each unchecked task in `plan.md`, in order:

**0. CLASSIFY**

Read the task name and description from `plan.md`. Match against these keyword groups and invoke matching domain skills *before* coding:

| Keywords in task name/description | Invoke (in order) |
|-----------------------------------|-------------------|
| `frontend`, `UI`, `component`, `page`, `layout`, `design`, `style` | `frontend-design:frontend-design` → `agent-skills:frontend-ui-engineering` |
| `API`, `endpoint`, `schema`, `interface`, `contract`, `route` | `agent-skills:api-and-interface-design` → if a significant choice between alternatives is present, also `agent-skills:documentation-and-adrs` (write ADR before coding) |
| anything else | no domain skill |

Ambiguous slices default to no domain skill — bias toward fewer invocations.

**1. ANNOUNCE**

> "Starting slice N of M: [task name from plan.md]"

Show any scope constraints from `requirements.md` relevant to this slice.

**2. INVOKE agent-skills:incremental-implementation**

Apply the incremental-implementation discipline for this slice:
- One logical thing only — do not mix concerns
- Rule 0: simplest thing that could work
- Rule 0.5: touch only what this task requires; note but do not fix anything outside scope
- The slice must leave the codebase compilable with all tests passing

**3. INVOKE superpowers:test-driven-development**

Follow Red-Green-Refactor strictly:
- Write ONE failing test showing the desired behaviour
- Run it — verify it fails for the right reason (not a syntax error, not a missing import)
- Write minimal code to pass the test
- Run it — verify it passes and no other tests break
- Refactor only after green

For framework-specific test patterns, structure conventions, and anti-patterns relevant to this project's test stack, consult `agent-skills:test-driven-development`'s `references/testing-patterns.md`.

**Failure rule:** If a RED test will not go green after a reasonable attempt, block regardless of mode. Surface the problem to the user. Never skip a failing test to preserve momentum.

**4. VERIFY**

Using commands from `specs/mission.md` Quick Commands (if available), run in sequence:
- Test suite passes
- Build clean
- Type check passes

**5. TICK + COMMIT**

Update `plan.md`: mark the completed task `[ ]` → `[x]`

Commit slice code and updated `plan.md` together:

```bash
git add [changed files] specs/[feature-dir]/plan.md
git commit -m "[task name from plan.md]"
```

Never tick and commit separately — they must be atomic.

**6. CHECKPOINT (checkpoint mode only)**

> "Slice N complete. Continue to slice N+1: [next task name]?"

Autonomous mode: proceed immediately to the next slice.

### Step 5: All Slices Complete

When all checkboxes in `plan.md` are ticked:

1. Print the full contents of `validation.md`
2. Walk through each criterion:
   > "Are all acceptance criteria above met? Any manual checks still outstanding?"
3. If any criteria are unmet, surface exactly which ones and do not proceed
4. Documentation check — before handing off, confirm:
   - ADRs written for any significant decisions made during this feature?
   - README updated if user-facing behaviour changed?
   - Changelog entry for user-facing changes?
   - API docs / type definitions current?
5. When all confirmed:
   > "Implementation complete and validated. Next step: `/i-need-code-review`"

Do **not** auto-invoke `/i-need-code-review`. The user triggers it explicitly.

## Key Rules

- Always read all three spec files before touching code
- Always ask mode once — never mid-execution
- Always tick `plan.md` and commit together — never separately
- Never skip a failing test regardless of mode
- Never proceed past `validation.md` if any criterion is unmet
