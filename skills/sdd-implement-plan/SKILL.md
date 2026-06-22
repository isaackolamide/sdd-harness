---
name: sdd-implement-plan
description: Execute a feature plan — domain-aware subagent dispatch, TDD enforced, plan.md progress tracking, validation gate, hands off to agent-skills:code-review-and-quality
metadata:
  type: implementation
  composesWith: [superpowers:subagent-driven-development]
---

# SDD Implementation Driver

Execute a feature plan produced by `/sdd-plan-feature`. This skill wraps `superpowers:subagent-driven-development` to guarantee invocation of the right primitives — closing the triggering gap in the SDD workflow.

## Position in the SDD Trilogy

```
/sdd-write-spec      → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature    → sdd-specs/plans/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan  → commits per slice via subagents; plan.md ticked in Step 4.5 after all reviews pass
                       validation.md ticked at Step 4b
                       → agent-skills:code-review-and-quality → superpowers:finishing-a-development-branch
```

## Workflow

### Step 0: Locate Spec Directory

If the feature path or name is inferable from conversation context, confirm it with the user before proceeding. If not, list available `sdd-specs/` directories and ask the user to pick.

### Step 1: Branch Creation

Before modifying any files, ensure you are on an isolated feature branch. If you are on `main` or another shared branch, ask the user to confirm a branch name (e.g., `feature/<feature-name>`) and run `git checkout -b <branch-name>`. Do not start implementation on `main`.

### Step 2: Read Input Files

Read all three files before any code is touched:

- `plan.md` — task list with checkboxes; execution order; resume point if session interrupted
- `requirements.md` — scope, decisions, constraints; keep in context throughout implementation
- `validation.md` — definition of done; surface only at end

### Step 3: Slice Execution Loop

For each unchecked task in `plan.md`, in order:

**3.1. CLASSIFY**

Read the task name and description from `plan.md`. Match against these keyword groups:

| Keywords in task name/description | Domain skills |
|-----------------------------------|---------------|
| `frontend`, `UI`, `component`, `page`, `layout`, `design`, `style` | `frontend-design:frontend-design` → `agent-skills:frontend-ui-engineering` |
| `API`, `endpoint`, `schema`, `interface`, `contract`, `route` | `agent-skills:api-and-interface-design` → if a significant choice between alternatives is present, also `agent-skills:documentation-and-adrs` (write ADR before coding) |
| anything else | no domain skill |

Ambiguous slices default to no domain skill — bias toward fewer invocations.

Match keywords against the task title, scope description, and file names only — not the `Interfaces:`, `Acceptance criteria:`, `Verification:`, or `Dependencies:` template fields.

Embed domain skill name(s) as text instructions in the implementer prompt — do not invoke directly. If an ADR is needed, write it at the controller level *before* dispatching the subagent, then pass the ADR path as context.

**3.2. ANNOUNCE**

> "Starting slice N of M: [task name from plan.md]"

Show any scope constraints from `requirements.md` relevant to this slice.

Follow `superpowers:subagent-driven-development` for this slice. The steps below specify only what sdd-implement-plan adds on top — the primitive owns the general dispatch process, file handoffs, and model selection.

**Per-task reviewer note:** The primitive dispatches per-slice reviews using `task-reviewer-prompt.md`. It is expected and correct that the `agent-skills:code-reviewer` agent type is selected here, as it is highly specialized for this review task. Do not override this.

**3.3. SDD ADDITIONS — implementer brief**

When the primitive builds the implementer brief, also include:
- CLASSIFY result: "This is a [frontend/API/general] slice. Invoke [domain skill names] before coding."
- Task's `Interfaces` line from `plan.md` — what this slice must produce (function name + type) and what it may consume from prior tasks. This is the contract to honour; do not invent different names or signatures.
- Relevant constraints from `requirements.md` (only what binds this slice)
- If ADR written: ADR path as implementation context
- Instruction: commit implementation and test files only — do not touch `plan.md`

**3.4. SDD ADDITIONS — task reviewer dispatch**

When the primitive dispatches the task reviewer, also include:
- Full `requirements.md` — the spec compliance verdict requires the actual spec
- Relevant constraints from `requirements.md` for this slice

**3.5. LEDGER UPDATE (controller)**

After the task review passes, update the progress ledger per the primitive's tracking protocol.

**3.6. PHASE CHECKPOINT (controller — at phase boundary)**

After the last reviewed task in a `## Phase N` section completes:

1. Run the `Verification:` command from the `### Checkpoint — Phase N` block in `plan.md`. The controller may run this command directly — this is targeted shell execution to verify a phase gate, not a TDD invocation.
2. If the checkpoint passes: tick the condition checkbox `[ ]` → `[x]` in `plan.md` (not the `Verification:` line — that line is never ticked), then:
   ```bash
   git add sdd-specs/plans/[feature-dir]/plan.md
   git commit -m "✓ Checkpoint — Phase N"  # substitute the actual phase number, e.g. "✓ Checkpoint — Phase 1"
   ```
   - If Phase N+1 exists: dispatch the first task of Phase N+1
   - If no Phase N+1 exists: proceed directly to Step 4 (Finalization)
3. If the checkpoint fails: surface the failure to the user and stop — do not advance until resolved

**3.7. NEXT SLICE**

Proceed to the next unchecked/pending task.

**When all slices are complete:** proceed directly to Step 4 (Finalization) below. **CRITICAL:** Do NOT execute the finishing sequence described in `superpowers:subagent-driven-development`. You must explicitly ignore its instructions to dispatch a final code reviewer or use `finishing-a-development-branch` here. This skill owns the post-execution sequence, so follow Step 4 (Finalization) below instead.

### Step 4: Finalization (All Slices Complete)

The primitive's per-slice progress ledger tracks completion state throughout execution — `plan.md` ticking is deferred to Step 4.5, after all reviews pass, so the checkbox state reflects work that is truly finished and verified.

**CRITICAL ANTI-PATTERN: CHECKBOX CONFLATION**
Do not group checkbox operations. Ticking `validation.md` (Step 4.2) and ticking `plan.md`/`roadmap.md` (Step 4.5) are separated by critical quality gates (4.3 and 4.4). Ticking them at the same time skips these gates. Steps 4.1 through 4.5 MUST be executed in strict sequence.

#### 4.1. Whole-Branch Code Review

Dispatch `superpowers:requesting-code-review` for a final whole-branch review covering all commits in this feature. Explicitly pass `requirements.md` to the reviewer so they can check for architectural and spec compliance, not just code quality.

Fix any Critical or Important findings before proceeding. Do not advance to 4.2 with open Critical or Important issues.

#### 4.2. Validation Gate

Print `validation.md` in full. Walk through each group in order.

Instead of verifying the criteria yourself, **dispatch the `agent-skills:test-engineer` subagent**. 
Provide the subagent with `validation.md` and instruct it to rigorously and adversarially verify each criterion. The test engineer should actively write and execute test scripts, queries, or API requests to definitively prove the implementation works as specified.

- Instruct the test engineer **not** to ask the user for confirmation unless the criterion is strictly visual (e.g., "UI looks correct") or requires external system access you lack.
- Wait for the test engineer's report. If any test fails or a criterion is unmet, stop. Dispatch an implementation subagent to fix the issue, then have the test engineer verify it again.

For each criterion the test engineer proves is met: tick it `[ ]` → `[x]` in `validation.md`.

Once all criteria are ticked:

```bash
git add sdd-specs/plans/[feature-dir]/validation.md
git commit -m "✓ validation complete"
```

**STOP.** Do not proceed to tick `plan.md` or `roadmap.md` yet. You must complete Step 4.3 and 4.4 first.

#### 4.3. Documentation Check

Before advancing, confirm:
- ADRs written for any significant decisions made during this feature?
- README updated if user-facing behaviour changed?
- Changelog entry for user-facing changes?
- API docs / type definitions current?

If README, changelog, or API docs are missing and the change is user-facing, update them before proceeding to 4.4.

#### 4.4. Code Quality Review

Read the `agent-skills:code-review-and-quality` skill instructions and follow its review checklist against the full feature diff.

If there are any Critical or Important findings, you (the controller) must append them to the bottom of `plan.md` as new tasks under a `## Review Fixes` section. Execute these fixes, verify them, and tick them off in `plan.md` before proceeding.

> Note: 4.4 findings are about code craft, not spec compliance — they do not invalidate 4.2. Fix and re-run 4.4 only; do not re-open the validation gate unless a finding reveals an unmet spec requirement.

#### 4.5. Tick plan.md and roadmap.md

The controller is responsible for ticking `plan.md` and updating the project roadmap.

1. **Tick `plan.md`**: Re-read `plan.md` to confirm current checkbox state. Tick all acceptance criteria checkboxes — phase checkpoint boxes were already ticked at phase boundaries (Step 3.6) and must not be re-ticked here. By this point, all criteria have been verified via automated tests in Step 4.2. This is strictly an administrative completion signal. If any acceptance criterion was already ticked by a subagent, they violated the no-touch instruction — investigate before committing.
2. **Tick `roadmap.md`**: Open `sdd-specs/roadmap.md` and locate the feature or phase you just completed. Change its checkbox from `[ ]` to `[x]`.

```bash
git add sdd-specs/plans/[feature-dir]/plan.md sdd-specs/roadmap.md
git commit -m "✓ feature complete: plan and roadmap updated"
```

#### 4.6. Branch Integration

Precondition: 4.1 and 4.4 findings resolved, 4.2 validation fully ticked, plan.md fully ticked (4.5). Invoke `superpowers:finishing-a-development-branch` to handle merge, PR creation, or cleanup.

**CRITICAL**: When invoking the skill, you must explicitly state the correct target base branch (e.g., `main`, or the parent feature branch like `feat-a` if this branch is `feat-a/code`). The primitive defaults to checking `main`/`master`, so you must override this behavior by explicitly passing the actual base branch in your invocation.

---

## Key Rules

- Always read all three spec files before touching code
- Never skip a failing test
- Never proceed past the validation gate (4.2) if any criterion is unmet
- Never advance past 4.1 or 4.4 with open Critical or Important review findings
- `plan.md` checkboxes track implementation progress — acceptance criteria ticked at Step 4.5; phase checkpoint boxes ticked by the controller at phase boundaries (Step 3.6) and not re-ticked at Step 4.5
- `validation.md` checkboxes track spec compliance — ticked during the validation gate (4.2), never before
- **No Checkbox Conflation**: Do not tick `plan.md` or `roadmap.md` immediately after ticking `validation.md`. Steps 4.1 through 4.5 must be executed in strict order.
- `superpowers:subagent-driven-development` owns per-slice dispatch and progress ledger; this skill owns the post-execution sequence (Step 4 onward)
- When all slices are done, proceed directly to Step 4 (Finalization). **CRITICAL**: Ignore the finishing sequence described in `subagent-driven-development`. Do not execute its final reviewer dispatch or branch finishing; follow Step 4 below instead.

