---
name: sdd-implement-plan
description: Use when executing an approved phase-structured feature plan within an SDD project.
metadata:
  type: implementation
  composesWith: [superpowers:subagent-driven-development, superpowers:test-driven-development, agent-skills:code-review-and-quality]
---

# SDD Implementation Driver

Execute a feature plan produced by `/sdd-plan-feature`. This skill supports three execution modes: Subagent-driven, Autonomous, and Checkpoint. It wraps `superpowers:subagent-driven-development` and `superpowers:test-driven-development` to guarantee invocation of the right primitives.

## Position in the SDD Trilogy

```
/sdd-write-spec        → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      → sdd-specs/plans/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan    → commits per slice (via subagents or self-execution); developer self-review (4.1)
                         → hands off to /sdd-verify-feature
```

## Workflow

### Step 0: Locate Spec Directory
Confirm the target feature path with the user (infer from context or prompt to select from `sdd-specs/`).

### Step 1: Branch Creation
Ensure execution is on an isolated feature branch. If on `main` or a shared branch, prompt for a name and run `git checkout -b <branch-name>` before editing files.

### Step 2: Read Input Files & Select Mode
1. Read all three files before touching code:
   - `plan.md` (task list & checkboxes)
   - `requirements.md` (scope & design constraints)
   - `validation.md` (definition of done)
2. Select the **Execution Mode**:
   - **Subagent-driven Mode**: (Requires the `invoke_subagent` tool). Spawns a subagent per task using `superpowers:subagent-driven-development`. Recommended when available.
   - **Autonomous Mode**: (Fallback if `invoke_subagent` tool is not available in your toolset, or if selected). You execute each task slice sequentially in the current session without pausing.
   - **Checkpoint Mode**: (Fallback if `invoke_subagent` tool is not available, or if selected). You execute each task slice, but pause to ask the user for confirmation before committing.
   *Note: If `invoke_subagent` is not listed in your tool declarations, you MUST fallback to Autonomous or Checkpoint mode.*

### Step 3: Slice Execution Loop
Loop through each unchecked task in `plan.md` in order:

1. **CLASSIFY**: Match the task title, scope description, and filenames against keywords to identify required instructions:
   - `frontend`, `UI`, `component`, `page`, `layout`, `design`, `style` → Instruct implementation/use of `agent-skills:frontend-ui-engineering`
   - `API`, `endpoint`, `schema`, `interface`, `contract`, `route` → Instruct implementation/use of `agent-skills:api-and-interface-design`. (If making a significant architectural design choice, write an ADR at the controller level using `agent-skills:documentation-and-adrs` first, then pass the ADR path).
   - *Ambiguous cases*: Default to no domain skill. Match keywords only against task title, scope description, and filenames.
2. **ANNOUNCE**: Print `"Starting slice N of M: [task name]"`. Highlight any relevant constraints from `requirements.md`.
3. **DISPATCH / EXECUTE**: Depending on the chosen mode:
   - **If Subagent-driven**: Activate and run `superpowers:subagent-driven-development` for the task (load its `SKILL.md` using `view_file` with `IsSkillFile: true`).
     - **Implementer Brief**: Embed the classification domain skill, the task's `Interfaces` line contract, relevant constraints from `requirements.md`, any ADR path, and instructions to follow `harnesspowers:references/testing-patterns.md` and commit implementation/test files only (do not touch `plan.md`).
     - **Reviewer Brief**: Pass the full `requirements.md` and slice constraints. (The primitive will run review using `agent-skills:code-reviewer`).
   - **If Autonomous or Checkpoint (Self-Execution)**:
     - Load the domain-specific skill identified in the CLASSIFY step (`agent-skills:frontend-ui-engineering` or `agent-skills:api-and-interface-design`) with `IsSkillFile: true` and follow its instructions.
     - Load `superpowers:test-driven-development` with `IsSkillFile: true` and follow TDD strictly: write/update tests covering the task first, verify they fail, write implementation code, and ensure all tests pass.
     - Conduct a self-review using `agent-skills:code-review-and-quality` (load with `IsSkillFile: true`) against the slice constraints in `requirements.md` and the `Interfaces` contract. Fix all critical/important issues.
     - **If Checkpoint Mode**: Print the diff and test output to the user, and wait for confirmation before committing.
4. **LEDGER & COMMIT**: Once the task review passes, update the progress ledger. Tick the task header checkbox `[ ]` → `[x]` in `plan.md`. Stage and commit `plan.md` atomically with the task's code changes (one git commit per task).
5. **CHECKPOINT**: At the end of a `## Phase N` section:
   - Run the `Verification:` command from the `### Checkpoint — Phase N` block in `plan.md`.
   - If it passes: tick the checkpoint checkbox in `plan.md`, then run:
     `git add sdd-specs/plans/[feature-dir]/plan.md && git commit -m "✓ Checkpoint — Phase N"`
   - If it fails: halt implementation and ask the user. Do not proceed until resolved.

---

### Step 4: Bookkeeping & Hand-off
Once all tasks and phases are complete:
1. **Whole-Branch Review**:
   - **If Subagent-driven**: Run the final code review and fix loops from `superpowers:subagent-driven-development`, passing the path to `requirements.md` for the `[PLAN_OR_REQUIREMENTS]` template placeholder.
   - **If Self-Execution**: Run a final whole-branch review using `agent-skills:code-review-and-quality` against `requirements.md`, and fix any remaining findings.
2. **Tick Checkbox**: Once review passes, tick `- [ ] Feature plan code review passed` to `- [x] ...` in `plan.md`, then stage and commit `plan.md`.
3. **Finish Branch**: Run `superpowers:finishing-a-development-branch`. If running `/sdd-verify-feature` next, select Option 2 (push/PR) or Option 3 (keep as-is) to preserve the branch.
4. **Handoff**: Print:
   > "✓ Implementation and initial developer review complete. Run: /sdd-verify-feature"

---

## Key Rules

* **Branch Isolation**: Never implement code directly on `main` or a shared branch.
* **Spec First**: Always read `plan.md`, `requirements.md`, and `validation.md` before touching code.
* **Contract Adherence**: Implement signatures exactly as specified in the task's `Interfaces` line.
* **Checkpoints**: Never skip verification commands or phase checkpoints.
* **Task Ordering**: Do not commit code for a task if any preceding task in `plan.md` remains unchecked.
* **No Unreviewed Code**: Never advance past Step 4 with open Critical or Important review findings.

---

## Bulletproofing

### Red Flags (STOP and Start Over)
- You have made 3 consecutive debugging loops on a task and are about to attempt a 4th minor patch.
- You are committing code changes without also ticking the task checkbox in `plan.md` in the same commit.
- You are writing code before writing or updating tests.
- You are modifying files on `main` or another shared branch.
- You are trying to call `invoke_subagent` but it is not available in your tool declarations.

### Common Rationalizations

| Excuse | Reality / Action |
|--------|------------------|
| "The 4th patch will definitely fix it, it's just a small typo." | **Option B Rollback applies.** Run `git checkout -- <modified-files>` to discard changes. Break the task down in `plan.md`, commit the plan, and restart from a fresh slate. |
| "I'll commit the code changes now and update `plan.md` in a later commit." | **Atomic commit rule violated.** Both code changes and the `[x]` tick in `plan.md` must be in a single, atomic commit. |
| "I don't need to read `requirements.md` because I already know the task scope." | **Context loss risk.** Requirements contain critical design constraints. Read all 3 spec files before coding. |
| "I don't have the `invoke_subagent` tool, so I can't follow the implementation plan." | **Use Self-Execution Fallback.** You do not need the subagent tool to implement. Select Autonomous or Checkpoint mode and execute the slices yourself following TDD and self-review. |
