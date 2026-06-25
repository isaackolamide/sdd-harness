---
name: sdd-verify-feature
description: Use when a feature implementation is complete and ready for formal validation, code quality checks, and roadmap ticking before merging to the base branch.
metadata:
  type: verification
  composesWith: [agent-skills:code-review-and-quality, superpowers:finishing-a-development-branch]
---

# SDD Feature Verification Driver

Verify that the implemented feature complies with the spec guidelines, passes rigorous tests, has up-to-date documentation, and conforms to code quality standards before integrating it into the base branch.

## Position in the SDD Trilogy

```
/sdd-write-spec        → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      → sdd-specs/plans/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan    → slice coding & developer self-review
/sdd-verify-feature    → validation gate (Step 1) → docs check (Step 2) → quality checklist (Step 3) 
                         → ticks plan/roadmap (Step 4) → pre-merge checks & git branch integration (Step 5)
```

## Workflow

### Step 0: Locate Spec Directory & Verify Branch

1. Confirm the spec directory name. If it is inferable from conversation history, use it. Otherwise, list available directories under `sdd-specs/plans/` and ask the user to select the active one.
2. Confirm the active Git branch. Ensure you are not on `main`, `master`, or another shared base branch.

### Step 1: Validation Gate

1. Print `validation.md` in full. Walk through each criterion group in order.
2. Instead of verifying the criteria yourself, **dispatch the `agent-skills:test-engineer` subagent**.
3. Provide the subagent with `validation.md` and instruct it to rigorously and adversarially verify each criterion. The test engineer should actively write and execute test scripts, queries, or API requests to definitively prove the implementation works as specified.
   - Instruct the test engineer **not** to ask the user for confirmation unless the criterion is strictly visual (e.g., "UI looks correct") or requires external system access you lack.
   - **Logs Audit Check**: The test engineer MUST provide the raw terminal execution stdout/stderr logs of all tests, queries, or scripts executed. The controller agent MUST inspect these raw logs to verify that the assertions actually ran and passed. Do not accept a simple text assertion of "all tests passed".
   - Wait for the test engineer's report. If the subagent fails to provide the raw command output logs, if any test fails, or if a criterion is unmet, stop. Dispatch an implementation subagent or instruct the user to run `/sdd-implement-plan` to resolve the bugs, then verify again.
4. For each criterion the test engineer proves is met: tick it `[ ]` → `[x]` in `validation.md`.
5. Once all criteria are ticked:
   ```bash
   git add sdd-specs/plans/[feature-dir]/validation.md
   git commit -m "✓ validation complete"
   ```

**STOP.** Do not proceed to tick `plan.md` or `roadmap.md` yet. You must complete Step 2 first.

### Step 2: Code Quality Review

1. Read the `agent-skills:code-review-and-quality` skill instructions and follow its review checklist against the full feature diff.
2. If there are any Critical or Important findings, you (the controller) must append them to the bottom of `plan.md` as new tasks under a `## Review Fixes` section. Each task must have a `### Task X.Y: [Fix Name]` header and a `- [ ] Task Completed` checkbox list item. 
   - **Objective Quality Gates**: Any finding violating the `tech-stack.md` guidelines (e.g. missing unit tests, incorrect naming conventions, duplicated code, or files in the wrong directory), violations of dependency rules (mapped conceptually if a non-TypeScript project), or violations of `sdd-harness:references/testing-patterns.md` conventions (mocking internal logic, poor test structures, or test anti-patterns) is automatically classified as **Important** (or **Critical** if it causes build/runtime failures or regression). Downgrading findings to "Minor" to bypass this hand-back rule is strictly prohibited.
   - **Exit and hand back**: Stop execution of this skill. Instruct the user to run `/sdd-implement-plan` to execute and verify these fixes before re-running `/sdd-verify-feature`.
   > Note: Quality findings are about code craft, not spec compliance — they do not invalidate Step 1 validation. Once the fixes are implemented (and their checkboxes ticked during the implementation loop), re-run only the quality review phase; do not re-open the validation gate unless a finding reveals an unmet spec requirement.

### Step 3: Administrative Ticking (Feature Completion)

The controller is responsible for updating the progress files to officially signal feature completion.

1. **Tick `plan.md`**: Re-read `plan.md` to confirm current checkbox state. Ensure all task checkboxes, phase checkpoints, plan code review checkboxes, and review fixes checkboxes in `plan.md` are ticked `[x]`. (Note: Since tasks, phase checkpoints, and the plan code review are ticked by the controller during implementation, and any review fixes are ticked during their execution, at this point all checkboxes in `plan.md` must be ticked `[x]`).
2. **Tick `roadmap.md`**: Open `sdd-specs/roadmap.md` and locate the feature or phase you just completed. Change its checkbox from `[ ]` to `[x]`.
3. Commit the changes:
   ```bash
   git add sdd-specs/plans/[feature-dir]/plan.md sdd-specs/roadmap.md
   git commit -m "✓ feature complete: plan and roadmap updated"
   ```

### Step 4: Programmatic Verification Gate

Before performing any merge operations, programmatically audit the feature readiness:

1. **Check checklists**: Read the active `plan.md` and `validation.md` files. 
   - Verify that **every single checkbox** in both files is ticked `[x]`. 
   - If any checkbox is left unchecked `[ ]` (whether a slice task, checkpoint, review fix, or validation criterion), **STOP immediately**. Print a warning:
     > "⚠ Integration Blocked: Feature has unchecked items in plan.md or validation.md. Please resolve outstanding tasks first."
2. **Check Git cleanliness**: Run `git status --porcelain` to check the local working tree.
   - You may allow local files that are registered in `.gitignore` (e.g., local configs, workspace cache files).
   - If there are uncommitted changes in tracked source files, or untracked source files (such as `.ts`, `.js`, `.py`, `.go`, or spec `.md` files) not listed in `.gitignore`, **STOP immediately**. Print a warning:
     > "⚠ Integration Blocked: Local git working tree has uncommitted source files. Please commit or stash your changes before integrating."
3. **Pre-Merge Test Run**: Run the main workspace build, lint, and test scripts on the feature branch. If any tests fail, type-checking errors occur, or linting fails, **STOP immediately** and report the failure. Do not merge broken code.

### Step 5: Branch Integration

Once all checks pass, handle the integration:

1. **Determine target base branch**: 
   - Check the Git upstream tracking branch configuration for the current branch.
   - Check the header metadata of `plan.md` for a target base branch if specified.
   - If neither resolves it, prompt the user to confirm the target base branch (e.g. `main` or a parent feature branch) and default to `main`.
2. **Invoke Integration Primitive**: Invoke `superpowers:finishing-a-development-branch` to perform the merge, pull request generation, or branch cleanup.
   - **CRITICAL**: State the resolved target base branch explicitly in your invocation to override default behaviors.

---

## Key Rules

- Never proceed past the validation gate (Step 1) if any criterion is unmet.
- Never advance past Step 2 with open Critical or Important quality review findings.
- **No Checkbox Conflation**: Ticking `validation.md` (Step 1) and ticking `plan.md`/`roadmap.md` (Step 3) are separated by critical documentation and quality checks. They must be executed in strict sequence.
- Never merge a branch if there are any unchecked boxes `[ ]` in `plan.md` or `validation.md`.
- Never merge a branch with uncommitted changes in the working directory.
- Always explicitly override the target base branch when invoking the finishing primitive to avoid merging into the wrong base branch.
