---
name: sdd-integrate-feature
description: Use when merging a verified and fully checklist-complete feature branch into the target base branch.
metadata:
  type: integration
  composesWith: [superpowers:finishing-a-development-branch]
---

# SDD Integration Driver

Safely integrate a fully verified feature branch into the base branch and clean up local tracking.

## Position in the SDD Trilogy

```
/sdd-write-spec        → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      → sdd-specs/plans/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan    → slice coding & developer self-review (4.1)
/sdd-verify-feature    → validation & quality checklist ticked
/sdd-integrate-feature → verifies checklists (Step 1) → branch integration (Step 2)
```

## Workflow

### Step 0: Locate Spec Directory & Verify Branch

1. Confirm the spec directory name. If it is inferable from conversation history, use it. Otherwise, list available directories under `sdd-specs/plans/` and ask the user to select the active one.
2. Confirm the active Git branch. Ensure you are not on `main`, `master`, or another shared base branch.

### Step 1: Verification Gate (Programmatic Checks)

Before performing any merge operations, programmatically audit the feature readiness:

1. **Check checklists**: Read the active `plan.md` and `validation.md` files. 
   - Verify that **every single checkbox** in both files is ticked `[x]`. 
   - If any checkbox is left unchecked `[ ]` (whether a slice task, checkpoint, review fix, or validation criterion), **STOP immediately**. Print a warning:
     > "⚠ Integration Blocked: Feature has unchecked items in plan.md or validation.md. Please run /sdd-verify-feature first."
2. **Check Git cleanliness**: Run `git status --porcelain` to check the local working tree.
   - You may allow local files that are registered in `.gitignore` (e.g., local configs, workspace cache files).
   - If there are uncommitted changes in tracked source files, or untracked source files (such as `.ts`, `.js`, `.py`, `.go`, or spec `.md` files) not listed in `.gitignore`, **STOP immediately**. Print a warning:
     > "⚠ Integration Blocked: Local git working tree has uncommitted source files. Please commit or stash your changes before integrating."

### Step 2: Branch Integration

Once all checks pass, handle the integration:

1. **Determine target base branch**: 
   - Check the Git upstream tracking branch configuration for the current branch.
   - Check the header metadata of `plan.md` for a target base branch if specified.
   - If neither resolves it, prompt the user to confirm the target base branch (e.g. `main` or a parent feature branch) and default to `main`.
2. **Invoke Integration Primitive**: Invoke `superpowers:finishing-a-development-branch` to perform the merge, pull request generation, or branch cleanup.
   - **CRITICAL**: State the resolved target base branch explicitly in your invocation to override default behaviors.
3. **Pre-Merge Test Run**: Run the main workspace build, lint, and test scripts on the feature branch one final time. If any tests fail, type-checking errors occur, or linting fails, **STOP immediately** and report the failure. Do not merge broken code.

---

## Key Rules

- Never merge a branch if there are any unchecked boxes `[ ]` in `plan.md` or `validation.md`.
- Never merge a branch with uncommitted changes in the working directory.
- Always explicitly override the target base branch when invoking the finishing primitive to avoid merging into the wrong base branch.
