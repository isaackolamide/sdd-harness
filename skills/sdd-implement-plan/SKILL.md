---
name: sdd-implement-plan
description: Use when executing an approved phase-structured feature plan within an SDD project.
metadata:
  type: implementation
  composesWith: [superpowers:subagent-driven-development]
---

# SDD Implementation Driver

Execute a feature plan produced by `/sdd-plan-feature`. This skill wraps `superpowers:subagent-driven-development` to guarantee invocation of the right primitives.

## Position in the SDD Trilogy

```
/sdd-write-spec        → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      → sdd-specs/plans/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan    → commits per slice via subagents; developer self-review (4.1)
                         → hands off to /sdd-verify-feature
```

## Workflow

### Step 0: Locate Spec Directory
Confirm the target feature path with the user (infer from context or prompt to select from `sdd-specs/`).

### Step 1: Branch Creation
**(Replaces primitive's use of superpowers:using-git-worktrees)** **Always** create a new isolated feature branch before touching any files — regardless of the current branch. Even if you are already on a feature branch, create a new one scoped to this plan. Prompt the user for a branch name (or infer one from the plan directory name), then run `git checkout -b <branch-name>` before any edits.

### Step 2: Read Input Files
Read all three files before touching code:
- `plan.md` (task list & checkboxes)
- `requirements.md` (scope & design constraints)
- `validation.md` (definition of done)

### Step 3: Slice Execution Loop
Loop through each unchecked task in `plan.md` in order:

3.1. **CLASSIFY**: Match the task title, scope description, and filenames against keywords to identify required instructions:
- `frontend`, `UI`, `component`, `page`, `layout`, `design`, `style` → Instruct implementation/use of `agent-skills:frontend-ui-engineering`
- `API`, `endpoint`, `schema`, `interface`, `contract`, `route` → Instruct implementation/use of `agent-skills:api-and-interface-design`. (If making a significant architectural design choice, write an ADR at the controller level using `agent-skills:documentation-and-adrs` first, then pass the ADR path).
- *Ambiguous cases*: Default to no domain skill. Match keywords only against task title, scope description, and filenames.

**Figma Design Context:** If `requirements.md` contains a `## UI Design Reference` section with a Figma URL, record it as `[figma_url]` to pass to the implementer brief in Step 3.3. **Do not fetch the URL here.**

3.2. **ANNOUNCE**: Print:
`Starting slice N of M: [task name from plan.md]`
Show any scope constraints from `requirements.md` relevant to this slice.

**REQUIRED SUB-SKILL:** You MUST use `superpowers:subagent-driven-development` for this slice and follow its complete lifecycle (implementer dispatch, task reviewer dispatch, and if bugs are found, fixer subagent dispatch). The steps below specify only what `sdd-implement-plan` adds on top — the primitive owns the general dispatch process, file handoffs, and model selection.



3.3. **SDD ADDITIONS — implementer dispatch prompt**: When the primitive constructs the dispatch prompt (alongside the generated brief file), also include the following fields. Every field is required; use `N/A` only where the instruction explicitly permits it.

| Field | Content |
|---|---|
| Slice type | `"This is a [frontend/API/general] slice. Invoke [domain skill names] before coding."` |
| Interface contract | Task's `Interfaces` line from `plan.md` (or `"N/A"` if the task has no interfaces line or is a validation/quality review task) — what this slice must produce (function name + type) and what it may consume from prior tasks. This is the contract to honour; do not invent different names or signatures. |
| Spec constraints | Relevant constraints from `requirements.md` scoped to this slice only |
| ADR reference | ADR path if written for this slice; else `N/A` |
| **Figma design** | If this is a UI task and `[figma_url]` was recorded: `"REQUIRED: Figma design at [figma_url]. (Call figma:get_design_context if available)."` Else: `N/A` |
| Commit scope | `"Commit implementation and test files only — do not touch plan.md"` |

3.4. **SDD ADDITIONS — task reviewer dispatch**: Fill the `[GLOBAL_CONSTRAINTS]` placeholder with two items: the path to `requirements.md`, AND the exact **Acceptance Criteria** and **Verification** text copied from the current task slice.

3.5. **SDD ADDITIONS — fix subagent dispatch**: If a fix subagent is required, pass it the exact same **Interface contract**, **Spec constraints**, **Figma design**, and **Commit scope** fields that the implementer received. Fixers must adhere to the same constraints to prevent breaking contracts while fixing bugs.

3.6. **LEDGER & COMMIT**: Once the task review passes, update the progress ledger (`.superpowers/sdd/progress.md`). Then, tick the task's checklist checkbox `- [ ] Task Completed` → `- [x] Task Completed` in `plan.md`. Stage and commit `plan.md` as a bookkeeping commit (e.g., `git add sdd-specs/plans/[feature-dir]/plan.md && git commit -m "✓ Task [N] Complete"`).

3.7. **CHECKPOINT**: At the end of a phase or review section (e.g. `## Phase N`, `## Validation Fixes`, `## Code Quality Review Fixes`):
- Run the `Verification:` command from the corresponding checkpoint block (e.g. `### Checkpoint — Phase N`, `### Checkpoint — Validation Fixes`, `### Checkpoint — Code Quality Review Fixes`) in `plan.md`.
- If it passes: tick the checkpoint checkbox in `plan.md`, then run:
  `git add sdd-specs/plans/[feature-dir]/plan.md && git commit -m "✓ Checkpoint — [Section Name]"`
- If it fails: halt implementation and ask the user. Do not proceed until resolved.

---

### Step 4: Bookkeeping & Hand-off
Once all tasks and phases are complete:
1. **Whole-Branch Review**: Run the final code review and fix loops from `superpowers:subagent-driven-development`, passing the path to `requirements.md` for the `[PLAN_OR_REQUIREMENTS]` template placeholder.
2. **Tick Checkbox**: Once review passes, tick `- [ ] Feature plan code review passed` to `- [x] ...` in `plan.md`, then stage and commit `plan.md`.
3. **Finish Branch**: Run `superpowers:finishing-a-development-branch`. If running `/sdd-verify-feature` next, select Option 2 (push/PR) or Option 3 (keep as-is) to preserve the branch.
4. **Handoff**: Print:
   > "✓ Implementation and initial developer review complete. Run: /sdd-verify-feature"

---

## Key Rules

* **Violating the letter of the rules is violating the spirit of the rules.**
* **Branch Isolation**: Always create a new branch at Step 1. Never implement on any existing branch — including `main`, shared branches, or prior feature branches.
* **Subagent Isolation**: Never write implementation code in the controller session. Always dispatch a subagent for each slice as required by `superpowers:subagent-driven-development`.
* **Full Subagent Lifecycle**: You MUST execute the complete `superpowers:subagent-driven-development` lifecycle for every task. This includes the task reviewer phase, and if a bug is found, you MUST dispatch a fixer subagent. Never bypass the fixer subagent by fixing issues directly in the controller.
* **Spec First**: Always read `plan.md`, `requirements.md`, and `validation.md` before touching code.
* **Contract Adherence**: Implement signatures exactly as specified in the task's `Interfaces` line.
* **Checkpoints**: Never skip verification commands or checkpoints.
* **Task Ordering**: Do not commit code for a task if any preceding task in `plan.md` remains unchecked.

---

## Bulletproofing

### Red Flags (STOP and Start Over)
- You are writing implementation code directly in the controller session instead of dispatching a subagent.
- You are fixing a bug found by the task reviewer directly in the controller session instead of dispatching a fixer subagent.
- You skipped invoking `superpowers:subagent-driven-development` for a task because you assumed you remembered the flow.
- You have made 3 consecutive debugging loops on a task and are about to attempt a 4th minor patch.
- You are batching `plan.md` checkbox updates instead of committing them immediately after each task.
- You are modifying files on `main` or another shared branch.
- You skipped `git checkout -b` because you thought the current branch was already suitable.

### Common Rationalizations

| Excuse | Reality / Action |
|--------|------------------|
| "It's a small change, I can just write the code here instead of dispatching a subagent." | **Controller pollution.** The controller session must remain isolated to orchestrate the plan. Always dispatch a subagent for implementation. |
| "I've already used `subagent-driven-development` for previous tasks, I don't need to invoke it again." | **Process drift.** You MUST use the skill for EVERY task to ensure all steps (including reviewer and fixer loops) are strictly executed. |
| "The task reviewer found a tiny issue, I'll just fix it in the controller session instead of dispatching a fixer subagent." | **Controller pollution.** The controller cannot write or fix code. You MUST dispatch a fixer subagent as mandated by `superpowers:subagent-driven-development`. |
| "The 4th patch will definitely fix it, it's just a small typo." | **Option B Rollback applies.** Run `git reset --hard <BASE_COMMIT>` (the commit before the task started) to discard the subagent's commits and changes. Break the task down in `plan.md`, commit the plan, and restart from a fresh slate. |
| "I'll tick the checkbox in `plan.md` but wait until the end of the phase to commit it." | **Progress loss risk.** You MUST commit `plan.md` immediately after ticking the checkbox to ensure durable progress tracking. |
| "I don't need to read `requirements.md` because I already know the task scope." | **Context loss risk.** Requirements contain critical design constraints. Read all 3 spec files before coding. |
| "I'm already on a feature branch, so I don't need to create a new one." | **Step 1 is unconditional.** Always run `git checkout -b <branch-name>`. The current branch is irrelevant. |
| "There's a Figma URL in requirements.md but I'll just infer the UI from the task description." | **Design-to-code skipped.** When `requirements.md` has a `## UI Design Reference` and the slice is a UI task, the brief's **Figma design** field is REQUIRED — the subagent must call `figma:get_design_context` before writing UI code. Inferring from prose defeats the design reference. |
