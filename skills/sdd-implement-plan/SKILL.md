---
name: sdd-implement-plan
description: Execute a feature plan — 3-way mode (subagent-driven with per-slice review, autonomous inline, or checkpoint inline), domain-aware dispatch, TDD enforced, plan.md progress tracking, validation gate, hands off to agent-skills:code-review-and-quality
metadata:
  type: implementation
  composesWith: [superpowers:test-driven-development, superpowers:subagent-driven-development]
---

# SDD Implementation Driver

Execute a feature plan produced by `/sdd-plan-feature`. This skill wraps `superpowers:test-driven-development` and `superpowers:subagent-driven-development` to guarantee co-invocation of the right primitives — closing the triggering gap in the SDD workflow.

## Position in the SDD Trilogy

```
/sdd-write-spec      → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature    → sdd-specs/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan  → commits per slice; plan.md ticked in Step 5e after all reviews pass (subagent-driven)
                       or per-slice atomic with code (inline); validation.md ticked at Step 5b
                       → agent-skills:code-review-and-quality → superpowers:finishing-a-development-branch
```

## Workflow

### Step 1: Locate Spec Directory

If the feature path or name is inferable from conversation context, confirm it with the user before proceeding. If not, list available `sdd-specs/` directories and ask the user to pick.

### Step 2: Read Input Files

Read all three files before any code is touched:

- `plan.md` — task list with checkboxes; execution order; resume point if session interrupted
- `requirements.md` — scope, decisions, constraints; keep in context throughout implementation
- `validation.md` — definition of done; surface only at end

### Step 3: Ask Mode Once

Before starting any slice, ask once using AskUserQuestion:

> "How should slices be executed?
>   - **Subagent-driven** *(recommended for ≥4 slices or production features)* — fresh subagent per slice + task review (spec + quality) per slice. Continuous only. Best for preserving context over long plans.
>   - **Autonomous** — current session executes each slice inline, no pauses. Best for small plans or prototypes.
>   - **Checkpoint** — current session executes each slice inline, pauses after each slice for confirmation."

Do not ask again during execution.

### Step 4: Slice Execution Loop

For each unchecked task in `plan.md`, in order:

**0. CLASSIFY**

Read the task name and description from `plan.md`. Match against these keyword groups:

| Keywords in task name/description | Domain skills |
|-----------------------------------|---------------|
| `frontend`, `UI`, `component`, `page`, `layout`, `design`, `style` | `frontend-design:frontend-design` → `agent-skills:frontend-ui-engineering` |
| `API`, `endpoint`, `schema`, `interface`, `contract`, `route` | `agent-skills:api-and-interface-design` → if a significant choice between alternatives is present, also `agent-skills:documentation-and-adrs` (write ADR before coding) |
| anything else | no domain skill |

Ambiguous slices default to no domain skill — bias toward fewer invocations.

Mode-aware fork after classification:
- **Inline mode**: invoke matching domain skills directly before coding
- **Subagent-driven mode**: embed domain skill name(s) as text instructions in the implementer prompt — do not invoke directly. If an ADR is needed, write it at the controller level *before* dispatching the subagent, then pass the ADR path as context.

**1. ANNOUNCE**

> "Starting slice N of M: [task name from plan.md]"

Show any scope constraints from `requirements.md` relevant to this slice.

---

#### Subagent-Driven Mode

Follow `superpowers:subagent-driven-development` for this slice. The steps below specify only what sdd-implement-plan adds on top — the primitive owns the general dispatch process, file handoffs, and model selection.

**Per-task reviewer note:** The primitive dispatches per-slice reviews using its own `task-reviewer-prompt.md` template, which checks both spec compliance and code quality — a richer check than `superpowers:requesting-code-review` alone (code quality only). The `agent-skills:code-reviewer` agent type being selected at runtime for these dispatches is expected and correct.

**2. SDD ADDITIONS — implementer brief**

When the primitive builds the implementer brief, also include:
- CLASSIFY result: "This is a [frontend/API/general] slice. Invoke [domain skill names] before coding."
- Relevant constraints from `requirements.md` (only what binds this slice)
- If ADR written: ADR path as implementation context
- Instruction: commit code changes only — do not touch `plan.md`

**3. SDD ADDITIONS — task reviewer dispatch**

When the primitive dispatches the task reviewer, also include:
- Full `requirements.md` — the spec compliance verdict requires the actual spec
- Relevant constraints from `requirements.md` for this slice

**4. LEDGER UPDATE (controller)**

After the task review passes, update the progress ledger per the primitive's tracking protocol.

**5. NEXT SLICE**

Proceed immediately to the next unchecked/pending task. No checkpoint in subagent-driven mode.

**When all slices are complete:** proceed directly to Step 5 below. Do not follow the primitive's own "finishing" sequence — this skill owns the post-execution sequence from here.

---

#### Inline Mode (autonomous or checkpoint)

**2. INVOKE domain skills (if applicable)**

If CLASSIFY matched a domain, invoke the matching skills directly before coding:
- Frontend slice: `frontend-design:frontend-design` → `agent-skills:frontend-ui-engineering`
- API slice: `agent-skills:api-and-interface-design` → write ADR if significant choice present

**3. SLICE CONSTRAINTS**

Before writing any code, verify these constraints hold for this slice:
- One logical thing only — do not mix concerns
- Rule 0: simplest thing that could work
- Rule 0.5: touch only what this task requires; note but do not fix anything outside scope
- The slice must leave the codebase compilable with all tests passing

**4. INVOKE superpowers:test-driven-development**

Follow Red-Green-Refactor strictly:
- Write ONE failing test showing the desired behaviour
- Run it — verify it fails for the right reason (not a syntax error, not a missing import)
- Write minimal code to pass the test
- Run it — verify it passes and no other tests break
- Refactor only after green

For framework-specific test patterns, structure conventions, and anti-patterns relevant to this project's test stack, consult `agent-skills:test-driven-development`'s `references/testing-patterns.md`.

**Failure rule:** If a RED test will not go green after a reasonable attempt, block regardless of mode. Surface the problem to the user. Never skip a failing test to preserve momentum.

**5. VERIFY**

Using commands from `sdd-specs/mission.md` Quick Commands (if available), run in sequence:
- Test suite passes
- Build clean
- Type check passes

**6. TICK + COMMIT**

Mark the completed task `[ ]` → `[x]` in `plan.md`.

Commit slice code and updated `plan.md` together:

```bash
git add [changed files] sdd-specs/[feature-dir]/plan.md
git commit -m "[task name from plan.md]"
```

Never tick and commit separately — they must be atomic.

**7. CHECKPOINT (checkpoint mode only)**

> "Slice N complete. Continue to slice N+1: [next task name]?"

Autonomous mode: proceed immediately to the next slice.

---

### Step 5: All Slices Complete

This sequence applies to both modes. In subagent-driven mode, the primitive's per-slice progress ledger tracks completion state throughout execution — plan.md ticking is deferred to Step 5e, after all reviews pass, so the checkbox state reflects work that is truly finished and verified.

#### 5a: Whole-Branch Code Review

Dispatch `superpowers:requesting-code-review` for a final whole-branch review covering all commits in this feature.

Fix any Critical or Important findings before proceeding. Do not advance to 5b with open Critical or Important issues.

#### 5b: Validation Gate

> Note: `validation.md` may contain criteria that require manual verification — for those, Claude will pause and ask you to confirm they are met before ticking.

Print `validation.md` in full. Walk through each group in order:

> "Group N — [group name]: go through each criterion — is it met?"

For each criterion the user confirms met: tick it `[ ]` → `[x]` in `validation.md`.
If any criterion is unmet: surface it and stop. Do not proceed until resolved.

Once all criteria are ticked:

```bash
git add sdd-specs/[feature-dir]/validation.md
git commit -m "✓ validation complete"
```

#### 5c: Documentation Check

Before advancing, confirm:
- ADRs written for any significant decisions made during this feature?
- README updated if user-facing behaviour changed?
- Changelog entry for user-facing changes?
- API docs / type definitions current?

#### 5d: Code Quality Review

Use the Skill tool to load `agent-skills:code-review-and-quality`. Follow its review checklist against the full feature diff.

Fix any Critical or Important findings before proceeding.

#### 5e: Tick plan.md (subagent-driven mode only)

Tick all checkboxes in `plan.md` and commit. This step is the completion signal: plan.md checked off means all slices are done and all reviews are clean.

```bash
git add sdd-specs/[feature-dir]/plan.md
git commit -m "✓ all slices complete"
```

#### 5f: Branch Integration

Invoke `superpowers:finishing-a-development-branch` to handle merge, PR creation, or cleanup.

---

## Key Rules

- Always read all three spec files before touching code
- Always ask mode once — never mid-execution
- Never skip a failing test regardless of mode
- Never proceed past the validation gate (5b) if any criterion is unmet
- Never advance past 5a or 5d with open Critical or Important review findings
- `plan.md` checkboxes track implementation progress — ticked per-slice atomic with code (inline) or at Step 5e after all reviews pass (subagent-driven)
- `validation.md` checkboxes track spec compliance — ticked during the validation gate (5b), never before
- **Subagent-driven mode**: `superpowers:subagent-driven-development` owns per-slice dispatch and progress ledger; this skill owns the post-execution sequence (Step 5 onward)
- **Subagent-driven mode**: when all slices are done, proceed directly to Step 5 — do not follow the primitive's own finishing sequence
- **Subagent-driven mode**: never invoke `superpowers:test-driven-development` at the controller level — TDD is the subagent's responsibility
- **Inline mode**: orchestrator invokes domain skills directly and commits tick atomically with code
