---
name: sdd-verify-feature
description: Use when a feature implementation is complete and you need to verify it against the spec, ensure code quality, and integrate the branch.
metadata:
  type: verification
  composesWith: [superpowers:finishing-a-development-branch, superpowers:dispatching-parallel-agents]
---

# SDD Feature Verification Driver

Verify that the implemented feature complies with the spec guidelines, passes rigorous tests, has up-to-date documentation, and conforms to code quality standards before integrating it into the base branch.

**REQUIRED SUB-SKILL:** Use `superpowers:dispatching-parallel-agents` to run verification concurrent audits.
**REQUIRED SUB-SKILL:** Use `superpowers:finishing-a-development-branch` to merge the branch.


## Workflow

### Step 0: Locate Spec Directory & Verify Branch

1. Confirm the spec directory name. If it is inferable from conversation history, use it. Otherwise, list available directories under `sdd-specs/plans/` and ask the user to select the active one.
2. Confirm the active Git branch. Ensure you are not on `main`, `master`, or another shared base branch.

### Step 1: Parallel Verification Gate (Validation & Code Quality)

To minimize execution time and collect all feedback in a single run, perform the functional validation and code quality audit concurrently using `superpowers:dispatching-parallel-agents`.

1. **Prepare Inputs**:
   - Read the active `requirements.md` and `validation.md` files in full.
   - Read the `tech-stack.md` file in full.
   - Determine the target base branch (e.g., origin/main or a parent feature branch) to be used for the diff.
2. **Dispatch Parallel Subagents**:
   - In a single response block, dispatch the following two subagents to run concurrently:
     - **Validation Subagent (persona: `test-engineer`)**: Provide it with both `validation.md` and `requirements.md`. Instruct it to verify EVERY checklist section in `validation.md` (Acceptance Criteria, Binding Constraints Checklist, Test Coverage, Automation Checks, and PR Checklist) against the implementation. It must provide raw stdout logs of the passing tests to prove each item is met. It must not ask the user for confirmation unless the item is strictly visual or requires external system access you lack.
     - **Code Quality Subagent (persona: `code-reviewer`)**: Provide it with `tech-stack.md` and `requirements.md`. Instruct it to generate and evaluate the full feature diff against the target base branch using `tech-stack.md` as its standard for Required and Critical issues.
3. **Audit & Collect Findings**:
   - Wait for both subagents to return their reports.
   - **Validation Audit**: Inspect the raw terminal logs from the `test-engineer` to verify that the assertions actually ran and passed. Do not accept a simple text assertion of "all tests passed". If any test fails, or if any checklist item is unmet:
     - First, scan `plan.md` to find the highest phase number `N` currently defined (e.g. `## Phase N: [Phase Name]`).
     - Append a new `## Phase <N+1>: Validation Fixes` header directly under the pre-existing `## Validation Fixes` header in `plan.md` (where `<N+1>` is the next phase number).
     - For each failed or unchecked item, append a new structured task to `plan.md` under this new phase section.
     - Each task must follow the standard task structure:
       - `### Task <N+1>.Y: [Validation Failure Name]`
       - `- [ ] Task Completed`
       - `Scope: S/M/L`
       - `Files: [comma-separated paths or N/A]`
       - `Interfaces: N/A`
       - `Acceptance criteria:`
         - [Specific description of what must pass, including raw failure snippets and logs]
       - `Verification: [specific command to rerun/verify the failure, e.g. npm test path/to/failing_test.ts]`
       - `Dependencies: [none, or previous task <N+1>.X]`
     - After appending all validation tasks, append a validation fixes checkpoint block at the end of the section:
       - `### Checkpoint — Phase <N+1>`
       - `- [ ] All validation fixes pass`
       - `Verification: [command to run validation suite, e.g., npm test]`
   - **Code Quality Audit**: Review the code quality report.
     - Any findings categorized as **Required** (no prefix) or **Critical** by the `code-reviewer` must be addressed. Do not downgrade these findings.
     - For any Required or Critical findings, append them to `plan.md` under the pre-existing `## Code Quality Review Fixes` section.
     - First, determine the target phase number `Q` for the code quality review (e.g., `N + 2` if validation fixes were appended; `N + 1` if no validation fixes were appended).
     - Append a new `## Phase <Q>: Code Quality Review Fixes` header directly under the pre-existing `## Code Quality Review Fixes` header in `plan.md`.
     - Each task must follow the standard task structure:
       - `### Task <Q>.Y: [Fix Name]`
       - `- [ ] Task Completed`
       - `Scope: S/M/L`
       - `Files: [comma-separated paths or N/A]`
       - `Interfaces: N/A`
       - `Acceptance criteria:`
         - [Detailed report of the required/critical design or quality issue to fix]
       - `Verification: [command to verify code quality, e.g. npm run lint]`
       - `Dependencies: [none, or previous task <Q>.X]`
     - After appending all code quality tasks, append a code quality checkpoint block at the end of the section:
       - `### Checkpoint — Phase <Q>`
       - `- [ ] All code quality fixes pass`
       - `Verification: [command to run quality suite, e.g. npm run lint && npm run build]`
4. **Determine Exit or Completion**:
   - If there are any failed checklist items OR critical/required quality review findings:
     1. Exit and hand back: Stop execution of this skill. Instruct the user to run `/sdd-implement-plan` to execute and verify these fixes before re-running `/sdd-verify-feature`.
        > Note: Quality findings are about code craft, while validation is about spec compliance. However, once fixes for either validation or code quality are implemented (and their checkboxes ticked during the implementation loop), you must re-run the parallel verification gate in full to verify the fixes and ensure no regressions were introduced.
   - If all validation items across all sections are met AND there are no open Critical/Required quality findings:
     1. Tick all checkboxes `[ ]` → `[x]` across all sections in `validation.md`.
     2. Stage and commit validation:
        ```bash
        git add sdd-specs/plans/[feature-dir]/validation.md
        git commit -m "✓ validation complete"
        ```
     3. Proceed to Step 2.

### Step 2: Administrative Ticking (Feature Completion)

The controller is responsible for updating the progress files to officially signal feature completion.

1. **Tick `plan.md`**: Re-read `plan.md` to confirm current checkbox state. Ensure all task checkboxes, phase checkpoints, plan code review checkboxes, and any validation fixes and code quality review checkboxes in `plan.md` are ticked `[x]`. (Note: Since tasks, phase checkpoints, and the plan code review are ticked by the controller during implementation, and any fixes are ticked during their execution, at this point all checkboxes in `plan.md` must be ticked `[x]`).
2. **Tick `roadmap.md`**: Open `sdd-specs/roadmap.md` and locate the feature or phase you just completed. Change its checkbox from `[ ]` to `[x]`.
3. Commit the changes:
   ```bash
   git add sdd-specs/plans/[feature-dir]/plan.md sdd-specs/roadmap.md
   git commit -m "✓ feature complete: plan and roadmap updated"
   ```

### Step 3: Programmatic Verification Gate

Before performing any merge operations, programmatically audit the feature readiness:

1. **Check checklists**: Read the active `plan.md` and `validation.md` files.
   - Verify that **every single checkbox** in both files is ticked `[x]`.
   - If any checkbox is left unchecked `[ ]` (whether a slice task, checkpoint, validation/quality fix, or validation criterion), **STOP immediately**. Print a warning:
     > "⚠ Integration Blocked: Feature has unchecked items in plan.md or validation.md. Please resolve outstanding tasks first."
2. **Check Git cleanliness**: Run `git status --porcelain` to check the local working tree.
   - You may allow local files that are registered in `.gitignore` (e.g., local configs, workspace cache files).
   - If there are uncommitted changes in tracked source files, or untracked source files (such as `.ts`, `.js`, `.py`, `.go`, or spec `.md` files) not listed in `.gitignore`, **STOP immediately**. Print a warning:
     > "⚠ Integration Blocked: Local git working tree has uncommitted source files. Please commit or stash your changes before integrating."
3. **Pre-Merge Test Run**: Run the main workspace build, lint, and test scripts on the feature branch. If any tests fail, type-checking errors occur, or linting fails, **STOP immediately** and report the failure. Do not merge broken code.

### Step 4: Branch Integration

Once all checks pass, handle the integration:

1. **Determine target base branch**:
   - Check the Git upstream tracking branch configuration for the current branch.
   - Check the header metadata of `plan.md` for a target base branch if specified.
   - If neither resolves it, prompt the user to confirm the target base branch (e.g. `main` or a parent feature branch) and default to `main`.
2. **Invoke Integration Primitive**: Invoke `superpowers:finishing-a-development-branch` to perform the merge, pull request generation, or branch cleanup.
   - **CRITICAL**: State the resolved target base branch explicitly in your invocation to override default behaviors.

---

## Key Rules

- Never proceed past the parallel verification gate (Step 1) if any validation checklist item is unmet or any critical/required code quality findings are unresolved.
- **No Checkbox Conflation**: Ticking `validation.md` (Step 1) and ticking `plan.md`/`roadmap.md` (Step 2) are separated by critical validation and quality reviews. They must be executed in strict sequence.
- Never merge a branch if there are any unchecked boxes `[ ]` in `plan.md` or `validation.md`.
- Never merge a branch with uncommitted changes in the working directory.
- Always explicitly override the target base branch when invoking the finishing primitive to avoid merging into the wrong base branch.

