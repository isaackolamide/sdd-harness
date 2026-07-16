---
name: sdd-verify-feature
description: Use when a feature implementation is complete, all tasks are checked off, and you are ready for final integration.
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

### Step 1: Parallel Verification Gate (Validation, Code Quality & Optional Security)

To minimize execution time and collect all feedback in a single run, perform the functional validation, code quality audit, and optionally a security audit concurrently using `superpowers:dispatching-parallel-agents`.

1. **Prepare Inputs**:
   - Locate the active `validation.md`, `requirements.md`, `tech-stack.md`, and `plan.md` files. You will pass specific paths to each subagent as defined below. Do not read them into your own context yet to save tokens. `plan.md` is strictly for the controller's use to append required fix phases or verify overall completion status; it MUST NOT be seeded to subagents.
   - Determine the target base branch (e.g., origin/main or a parent feature branch) to be used for the diff.
2. **Ask for Security Audit Consent**:
   - STOP and ask the user: "Would you like to dispatch an optional security auditor subagent for this feature?"
   - STOP and wait for the user's explicit response. DO NOT proceed to Step 1.3 or dispatch ANY subagents in the same response.
3. **Dispatch Parallel Subagents**:
   - In a single response block, dispatch the following subagents to run concurrently:
     - **Validation Subagent (persona: `test-engineer`)**: Provide it ONLY with `validation.md` and `requirements.md`. Instruct it to verify EVERY checklist section in `validation.md` (Acceptance Criteria, Binding Constraints Checklist, Test Coverage, and Automation Checks) against the implementation. It must provide the specific commands run and brief snippets of the passing output to prove each item is met (avoid dumping full raw logs to prevent context bloat). If an item is strictly visual or requires external system access you lack, ask the user for confirmation. For all other items, verify them silently without asking for user confirmation.
     - **Code Quality Subagent (persona: `code-reviewer`)**: Provide it ONLY with `tech-stack.md` and `requirements.md`. Instruct it to generate and evaluate the full feature diff against the target base branch using `tech-stack.md` as its standard for Required and Critical issues.
     - **Security Subagent (`agent-skills:security-auditor`)** *(Only if user approved the security auditor in Step 1.2)*: Provide it ONLY with `requirements.md` and `tech-stack.md`. Instruct it to generate the full feature diff against the target base branch, identify vulnerabilities, and verify that any constraints in the Security Constraints section were met.
4. **Audit & Collect Findings**:
   - Wait for all dispatched subagents to return their reports.
   - **Validation Audit**: Inspect the provided commands and output snippets from the `test-engineer` to verify that the assertions actually ran and passed. Do not accept a simple text assertion of "all tests passed". If any test fails, or if any checklist item is unmet:
     - First, find the highest Phase number currently defined in `plan.md`.
     - Append a new incrementally numbered phase (e.g., `## Phase 4: Validation Fixes`) directly under the pre-existing `## Validation Fixes` header in `plan.md`.
     - For each failed or unchecked item, append a new task using the standard task structure from `plan.md` (including Scope, Files, Interfaces, Acceptance criteria, Verification, and Dependencies).
     - After appending all validation tasks, add a standard Checkpoint block for this phase to verify all validation fixes pass.
   - **Code Quality Audit**: Review the code quality report.
     - Any findings categorized as **Required** (no prefix) or **Critical** by the `code-reviewer` must be addressed. Do not downgrade these findings.
     - For any Required or Critical findings, append them to `plan.md` under the pre-existing `## Code Quality Review Fixes` section.
     - First, find the highest Phase number currently defined in `plan.md` (accounting for any Validation Fixes just added).
     - Append a new incrementally numbered phase (e.g., `## Phase 5: Code Quality Review Fixes`) directly under the `## Code Quality Review Fixes` header in `plan.md`.
     - For each finding, append a new task using the standard task structure from `plan.md`.
     - After appending all code quality tasks, add a standard Checkpoint block for this phase to verify all code quality fixes pass.
   - **Security Audit**: If the optional security auditor subagent was dispatched, review its report.
     - Any vulnerabilities found by the `security-auditor` subagent must be addressed. Do not downgrade these findings.
     - For any vulnerabilities, append them to `plan.md` under the pre-existing `## Security Fixes` section.
     - First, find the highest Phase number currently defined in `plan.md` (accounting for any earlier fixes).
     - Append a new incrementally numbered phase (e.g., `## Phase 6: Security Fixes`) directly under the `## Security Fixes` header in `plan.md`.
     - For each vulnerability, append a new task using the standard task structure from `plan.md`.
     - After appending all security tasks, add a standard Checkpoint block for this phase to verify all security fixes pass.
5. **Determine Exit or Completion**:
   - If there are any failed checklist items, critical/required quality review findings, OR security vulnerabilities:
     1. Exit and hand back: Stop execution of this skill. Instruct the user to run `/sdd-implement-plan` to execute and verify these fixes before re-running `/sdd-verify-feature`.
        > Note: Quality and security findings are about code craft, while validation is about spec compliance. However, once fixes for any of these are implemented (and their checkboxes ticked during the implementation loop), you must re-run the parallel verification gate in full to verify the fixes and ensure no regressions were introduced.
   - If all validation items across all sections are met AND there are no open Critical/Required quality findings or security vulnerabilities:
     1. Tick all checkboxes `[ ]` → `[x]` in the Acceptance Criteria, Binding Constraints Checklist, Test Coverage, and Automation Checks sections of `validation.md`.
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

## Red Flags - STOP and Start Over

- Proceeding past the parallel verification gate (Step 1) while any validation checklist item is unmet or any critical/required code quality findings are unresolved. **STOP and wait for fixes.**
- **Checkbox Conflation**: Ticking `validation.md` (Step 1) and ticking `plan.md`/`roadmap.md` (Step 2) at the same time. They are separated by critical validation and quality reviews and must be executed in strict sequence.
- Attempting to merge a branch if there are ANY unchecked boxes `[ ]` in `plan.md` or `validation.md`. **STOP and fix.**
- Attempting to merge a branch with uncommitted changes in the working directory. **STOP and commit/stash.**
- Failing to explicitly override the target base branch when invoking the finishing primitive. **STOP and specify the base branch.**

