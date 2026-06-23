---
name: sdd-implement-plan
description: Use when executing an approved phase-structured feature plan within an SDD project using step-by-step tasks and checkpoints.
metadata:
  type: implementation
  composesWith: [superpowers:subagent-driven-development]
---

# SDD Implementation Driver

Execute a feature plan produced by `/sdd-plan-feature`. This skill wraps `superpowers:subagent-driven-development` to guarantee invocation of the right primitives — closing the triggering gap in the SDD workflow.

## Position in the SDD Trilogy

```
/sdd-write-spec        → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      → sdd-specs/plans/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan    → commits per slice via subagents; developer self-review (4.1)
                         → hands off to /sdd-verify-feature
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

**Option B Rollback Policy (Rigid)**:
* If the subagent implementer fails to make tests pass after 3 consecutive debugging loops, the controller agent MUST run `git checkout -- <modified-files>` to discard all code changes for the current slice. 
* Stop the implementation loop, divide the task into smaller, more manageable sub-tasks in `plan.md`, commit the updated plan, and resume from a fresh slate. Under no circumstances should you attempt a 4th minor patch on a failing task.

**Atomic Commits per Task**:
* The controller must ensure that every task completion contains exactly the code changes and the updated task checkbox in `plan.md` within a single, atomic git commit.
* You MUST NOT commit code changes for a task if any preceding task in `plan.md` remains unchecked.

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
- Instruction to follow `agent-skills:references/testing-patterns.md` for test structures and mocking boundaries.
- Instruction to follow `harnesspowers:references/clean-architecture-ddd-reference.md` (mapped conceptually if a non-TypeScript project) for layering and dependency flow rules.
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

**When all slices are complete:** proceed directly to Step 4 (Developer Review) below. **CRITICAL:** Do NOT execute the finishing sequence described in `superpowers:subagent-driven-development`. You must explicitly ignore its instructions to dispatch a final code reviewer or use `finishing-a-development-branch` here. This skill ends after Step 4.1 (Developer Review), so follow the steps below instead.

### Step 4: Developer Review (All Slices Complete)

The implementation phase closes with developer self-review to ensure that all changes are integrated, compiled, and clean before handover to formal QA.

#### 4.1. Whole-Branch Code Review

Dispatch `superpowers:requesting-code-review` for a final whole-branch review covering all commits in this feature. Explicitly pass `requirements.md` to the reviewer so they can check for architectural and spec compliance, not just code quality.

Fix any Critical or Important findings before proceeding. Do not advance with open Critical or Important issues.

#### 4.2. Hand-off

Once the whole-branch review passes and all findings are resolved, print this hand-off message:

> "✓ Implementation and initial developer review complete.
> To verify the feature against spec requirements, document changes, and check quality, run:
> 
> /sdd-verify-feature
> "

---

## Key Rules

- Always read all three spec files before touching code
- Never skip a failing test
- Never advance past 4.1 with open Critical or Important review findings
- `plan.md` checkboxes track implementation progress — phase checkpoint boxes are ticked by the controller at phase boundaries (Step 3.6) and must not be re-ticked; acceptance criteria checkboxes are left unchecked for `/sdd-verify-feature` to administrative-tick at the end of verification
- `superpowers:subagent-driven-development` owns per-slice dispatch and progress ledger; this skill owns the developer review
- When all slices are done, proceed directly to Step 4 (Developer Review). **CRITICAL**: Ignore the finishing sequence described in `subagent-driven-development`. Do not execute its final reviewer dispatch or branch finishing; follow Step 4 and 4.2 above instead.

