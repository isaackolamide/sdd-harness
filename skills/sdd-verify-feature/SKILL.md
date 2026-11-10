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
   - Locate the active `validation.md`, `requirements.md`, `tdd-evidence.md`, `tech-stack.md`, and `plan.md` files. You will pass specific paths to each subagent as defined below. Do not read them into your own context yet to save tokens. `plan.md` is strictly for the controller's use to append required fix phases or verify overall completion status; it MUST NOT be seeded to subagents.
   - Determine the target base branch (e.g., origin/main or a parent feature branch) to be used for the diff.
2. **Ask for Security Audit Consent**:
   - STOP and ask the user: "Would you like to dispatch an optional security auditor subagent for this feature?"
   - STOP and wait for the user's explicit response. DO NOT proceed to Step 1.3 or dispatch ANY subagents in the same response.
3. **Dispatch Parallel Subagents**:
   - In a single response block, dispatch the following subagents to run concurrently:
     - **Validation Subagent (persona: `test-engineer`)**: Provide it ONLY with `validation.md`, `requirements.md`, and `tdd-evidence.md`. Instruct it to verify EVERY checklist section in `validation.md` (Acceptance Criteria, Binding Constraints Checklist, Test Coverage, and Automation Checks) against the implementation, using `tdd-evidence.md` as the committed record of each task's RED/GREEN results. It must provide the specific commands run and brief snippets of the passing output to prove each item is met (avoid dumping full raw logs to prevent context bloat). If an item is strictly visual or requires external system access you lack, do not attempt to ask the user. Instead, mark it as 'Requires Human Verification' in your report. For all other items, verify them silently. `## Manual Checks` entries are notes for humans: do not run or tick them.
     - **Code Quality Subagent (persona: `code-reviewer`)**: Provide it ONLY with `tech-stack.md` and `requirements.md`. Instruct it to generate and evaluate the full feature diff against the target base branch using `tech-stack.md` as its standard for Required and Critical issues.
     - **Security Subagent (`agent-skills:security-auditor`)** *(Only if user approved the security auditor in Step 1.2)*: Provide it ONLY with `requirements.md` and `tech-stack.md`. Instruct it to generate the full feature diff against the target base branch, identify vulnerabilities, and verify that any constraints in the Security Constraints section were met.
4. **Audit & Collect Findings**:
   - Wait for all dispatched subagents to return their reports.
   - **Validation Audit**: Inspect the provided commands and output snippets from the `test-engineer` to verify that the assertions actually ran and passed. Do not accept a simple text assertion of "all tests passed". Identify any failed tests or unmet checklist items.
   - **Code Quality Audit**: Review the code quality report. Collect every finding whatever its label (Critical, Required, Optional, Nit). Low-value findings still go in the report, because many of them can be fixed in this session (Route `Now`).
   - **Security Audit**: If the optional security auditor subagent was dispatched, review its report. Identify any vulnerabilities found by the `security-auditor`.
   - **Debt overlap**: if `sdd-specs/tech-debt.md` exists, grep its `## Open` rows (never the whole file) for the paths in `git diff --name-only <base>`. Each match not already a finding becomes a Low-severity, Optional, Route `Plan` finding, "TD-N still open in a file this feature changed", Source `tech-debt TD-N`. If there are no other findings, skip the Findings Report and ask one line: "TD-N is still open in a file this feature changed. `plan TD-N` to fix it, or `continue`." Wait for the reply; `continue` proceeds to Step 1.5 as "no findings".
   - **Merge duplicates**: When two subagents flag the same line or the same root cause, make it one finding that cites both sources and takes the higher severity.
   - If there are findings:
     - **STOP** and present the Findings Report (see [Findings Report](#findings-report)) to the user.
     - **STOP** and wait for the user's response. DO NOT proceed until the user replies.
     - **Apply approved `Now` fixes.** Make the edits, then run the workspace lint and test scripts. If a check fails, revert that edit, change the finding's Route to `Plan`, and tell the user. Commit the surviving fixes once, as `chore(verify): in-session fixes (#N, #M)`.
     - **Update verify-owned spec docs.** `requirements.md`, `validation.md`, `sdd-specs/roadmap.md`, and `sdd-specs/tech-debt.md` belong to this skill; `/sdd-implement-plan` is forbidden to create or edit them. After the user replies, and before appending any task, make every update below that the user's decisions call for. Cite the ruling or ADR and the date in each edit.
       - `requirements.md`: correct stale constants or wording; add a binding requirement for any new behaviour rule an approved code fix introduces.
       - `validation.md`:
         - Reword an acceptance criterion that cannot be tested as written, with a dated note naming the ruling or ADR.
         - Add one checklist item per approved fix (e.g. a new `AC-E*` item or a binding-constraint line) that names the fix task number.
         - Manual checks are notes for a human to do in their own time, never checkboxes. Keep them as plain bullets under `## Manual Checks` (create the section after Automation Checks if absent). Move any manual item found inside a checkbox section there and remove its checkbox. Never tick one.
         - Annotate each manual note the user confirmed with the date and operator; annotate each deferred one with the date, operator, and reason.
         - Record results that needed approval or containers (e.g. a full coverage run) as annotations.
         - Reword any check that contradicts verify's ownership, e.g. "`git diff --stat sdd-specs/roadmap.md` is empty" becomes "no plan-task commit touches `roadmap.md`". Never report such a check as FAIL and never revert the roadmap to satisfy it.
     - **Record approved `Debt` findings** in `sdd-specs/tech-debt.md`, following [Tech Debt Ledger](#tech-debt-ledger). Commit once, separately: `docs(verify): record tech debt (TD-N)`. A `Debt` finding gets no plan task and no checkbox.
     - **Append fix tasks** for ONLY the findings the user approved with Route `Plan`:
       - Determine the next available Phase number in `plan.md`.
       - Create ONE new phase headed `## Phase N: Fixes` (same level as the template's phases; its tasks stay `### Task N.M`) containing every approved finding, whatever its category (validation, code quality, security), appended after the `## Additional Fixes` header at the end of `plan.md`. Do not split by category.
       - Open each phase with this intro, verbatim: "Verify has already updated `requirements.md`, `validation.md` and `roadmap.md`. These tasks change code, tests and ADRs only." No task's `Files` line may list any of those three files.
       - For each approved finding, append a new task using the standard task structure from `plan.md` (including Scope, Files, Interfaces, Acceptance criteria, Verification, and Dependencies) plus a `Source:` line right after `Scope:` set to `validation`, `code-quality`, `security`, or `tech-debt TD-N` (for a merged finding, list each source, e.g. `code-quality, security`).
       - After appending all tasks for a phase, add a standard Checkpoint block to verify those fixes pass.
     - **Commit**: stage the spec documents you changed together with `plan.md` and commit once, e.g. `docs(verify): add Phase N fixes and verify-owned spec updates`. If no task was appended, commit the spec documents alone as `docs(verify): update verify-owned spec docs`.

5. **Determine Exit or Completion**:
   - If the user approved ANY findings to be fixed (meaning tasks were added to `plan.md`):
     1. Exit and hand back: Stop execution of this skill. Tell the user the spec documents are already updated and committed (name the commit), so `/sdd-implement-plan` only needs to run the new phase(s). Instruct the user to run it to execute and verify these fixes before re-running `/sdd-verify-feature`.
        > Note: If approved findings mixed `Now` and `Plan` routes, the full re-run also covers the `Now` fixes, so do not run the gate twice.
        > Note: Quality and security findings are about code craft, while validation is about spec compliance. However, once fixes for any of these are implemented (and their checkboxes ticked during the implementation loop), you must re-run the parallel verification gate in full to verify the fixes and ensure no regressions were introduced.
   - If there were NO findings initially, OR the user dismissed ALL findings, OR every approved finding was routed `Now`, `Spec`, or `Debt` (no plan task appended; those fixes are already committed and lint- and test-checked, so do NOT re-run the parallel gate):
     1. Tick all checkboxes `[ ]` → `[x]` in the Acceptance Criteria, Binding Constraints Checklist, Test Coverage, and Automation Checks sections of `validation.md`.
     2. Stage and commit validation:
        ```bash
        git add sdd-specs/plans/[feature-dir]/validation.md
        git commit -m "✓ validation complete"
        ```
     3. Proceed to Step 2.

### Step 2: Administrative Ticking (Feature Completion)

The controller is responsible for updating the progress files to officially signal feature completion.

1. **Tick `plan.md`**: Re-read `plan.md` to confirm current checkbox state. Ensure all task checkboxes, phase checkpoints, plan code review checkboxes, and any `## Additional Fixes` checkboxes in `plan.md` are ticked `[x]`. (Note: Since tasks, phase checkpoints, and the plan code review are ticked by the controller during implementation, and any fixes are ticked during their execution, at this point all checkboxes in `plan.md` must be ticked `[x]`).
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
2. **Check TDD evidence coverage**: For every `### Task X.Y` in `plan.md` (including fix-phase tasks), confirm `tdd-evidence.md` has a matching `## Task X.Y` heading — with RED and GREEN lines if the task is `TDD: required`, or the N/A reason otherwise. The validation subagent cannot do this check because it never sees `plan.md`.
   - If any task is missing its entry, **STOP immediately**. Print a warning:
     > "⚠ Integration Blocked: tdd-evidence.md has no entry for [Task X.Y]. Re-run /sdd-implement-plan for that task or restore the entry from its implementer report."
3. **Check Git cleanliness**: Run `git status --porcelain` to check the local working tree.
   - You may allow local files that are registered in `.gitignore` (e.g., local configs, workspace cache files).
   - If there are uncommitted changes in tracked source files, or untracked source files (such as `.ts`, `.js`, `.py`, `.go`, or spec `.md` files) not listed in `.gitignore`, **STOP immediately**. Print a warning:
     > "⚠ Integration Blocked: Local git working tree has uncommitted source files. Please commit or stash your changes before integrating."
4. **Pre-Merge Test Run**: Run the main workspace build, lint, and test scripts on the feature branch. If any tests fail, type-checking errors occur, or linting fails, **STOP immediately** and report the failure. Do not merge broken code.

### Step 4: Branch Integration

Once all checks pass, handle the integration:

1. **Determine target base branch**:
   - Check the Git upstream tracking branch configuration for the current branch.
   - Check the header metadata of `plan.md` for a target base branch if specified.
   - If neither resolves it, prompt the user to confirm the target base branch (e.g. `main` or a parent feature branch) and default to `main`.
2. **Invoke Integration Primitive**: Invoke `superpowers:finishing-a-development-branch` to perform the merge, pull request generation, or branch cleanup.
   - **CRITICAL**: State the resolved target base branch explicitly in your invocation to override default behaviors.

---

## Findings Report

**Read `references/findings-report.md` in full before presenting any findings.** It defines the headline, triage table, key, cards, recommendation, and reply prompt, including the Route rules for `Now`, `Spec`, `Plan`, `Human`, `Debt`, and `Spec + Plan`. Do not present a report from memory.


## Tech Debt Ledger

`sdd-specs/tech-debt.md` is the one place accepted risk lives. Only this skill writes it, plus the opt-in brownfield seed in `sdd-constitution`, which uses the format below. Create it on the first `Debt` approval, with this header and both tables; never scaffold it earlier.

```markdown
# Tech Debt

Verify-owned. Do not edit by hand or from plan tasks. IDs are never reused.

## Open

| ID | Finding | Where | Sev / Lik / Effort | Origin | Recorded | Accepted by, reason | Revisit when |
|----|---------|-------|--------------------|--------|----------|---------------------|--------------|
| TD-004 | Export loads all rows in memory | src/export/query.ts | Med / Low / L | 2026-11-10-export | 2026-11-10 | Isaac: under 10k rows today | Rows > 10k, or before multi-tenant |

## Resolved

| ID | Finding | Outcome | Resolved | By | Note |
|----|---------|---------|----------|----|------|
```

- One row per finding, one line per row. The finding card is not saved, so the reason goes in the row.
- `Revisit when` is mandatory. Propose one if the user gave none.
- `Where` is a path; the line number is optional. Leave it blank if the finding names no path.
- `Accepted by` is the output of `git config user.name`, then the user's reason.
- If one reply mixes allowed and barred approvals, apply the allowed ones, hold the barred finding on its current Route, and tell the user why.
- A Critical Security finding is prefixed `CRITICAL-ACCEPTED` in `Finding`, and its `Revisit when` is "before next release".
- If a finding matches an open row, annotate that row "seen again in <feature>, <date>". Do not add a duplicate.
- Resolve a row only after a `Plan` fix for it passes the gate. Find these in Step 1 by the `Source: tech-debt TD-N` line on the fix tasks. Move the row to Resolved with `Outcome` (`fixed`, `obsolete`, or `accepted permanently`), `Resolved` set to today's date, and `By` set to the feature, phase and commit. Commit as `docs(verify): resolve TD-N`, before `✓ validation complete`.
- If `git log` shows anyone but this skill changed `tech-debt.md` (e.g. an implementer marked a row resolved), revert that edit and redo it here, and tell the user.
- At 30 open rows, tell the user to triage before adding more.

## Red Flags - STOP and Start Over

- Recording an accepted risk anywhere but `sdd-specs/tech-debt.md` (`validation.md`, `## Manual Checks`, a per-feature file), or as `Dismiss`. **STOP: route it `Debt`.**
- Approving `Debt` for a failing test or an unmet AC. **STOP: route it `Plan`, or update the spec if it is stale.**
- Approving `Debt` for a Critical Security finding without the user typing the acceptance. **STOP: ask for `debt N (accept <risk> risk)`.**
- Writing a `Debt` row with no reason or no `Revisit when`. **STOP and fill both.**

- Proceeding past the parallel verification gate (Step 1) if the user approved findings that were added to `plan.md`. **STOP and exit so the user can fix them.**
- Automatically adding findings to `plan.md` without explicitly presenting them to the user and asking for consent. **STOP and ask for consent.**
- **Checkbox Conflation**: Ticking `validation.md` (Step 1) and ticking `plan.md`/`roadmap.md` (Step 2) at the same time. They are separated by critical validation and quality reviews and must be executed in strict sequence.
- Attempting to merge a branch if there are ANY unchecked boxes `[ ]` in `plan.md` or `validation.md`. **STOP and fix.**
- Attempting to merge a branch with uncommitted changes in the working directory. **STOP and commit/stash.**
- Accepting a strict-TDD claim from `plan.md` or the conversation instead of `tdd-evidence.md`. **The committed evidence file is the only proof the validator and Step 3.2 accept.**
- Failing to explicitly override the target base branch when invoking the finishing primitive. **STOP and specify the base branch.**
- **Dismissing Hard Failures**: If the user attempts to dismiss a failing unit test or missing Acceptance Criterion, warn them that bypassing validation breaks the SDD contract. Suggest they either fix the code, or update `validation.md` / `requirements.md` if the spec is outdated.
- Appending a plan task whose Files include `requirements.md`, `validation.md` or `roadmap.md`. **STOP: make the edit yourself in this verify session.**
- Ticking a manual check, or leaving it as a checkbox, so that Step 3.1 passes. **STOP: make it a plain note under `## Manual Checks`.**
- Routing a finding `Now` when it changes behaviour, needs a test, has Effort M or L, or is Security, a failing test, or an unmet AC. **STOP: route it `Plan`.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "The implementer can fix the stale constant in `requirements.md`." | `/sdd-implement-plan` is forbidden to touch that file, so the task gets deferred or blocked. Verify edits it now. |
| "This bug fix is only 3 lines, so I'll route it `Now` to save the round trip." | Size is not the test. A behaviour change needs RED/GREEN evidence in `tdd-evidence.md`, and only `/sdd-implement-plan` writes that file. Route it `Plan`. |
| "The owner accepts the risk, so I'll log it in `validation.md` and merge." | An accepted risk belongs in `sdd-specs/tech-debt.md` as `Debt`, where plan-feature can find it. A Critical Security finding also needs the typed acceptance. |
| "The user said ship it, so I'll tick the failing AC and note it as debt." | `Debt` is barred for a failing test or an unmet AC. A tick records a pass that never happened. Fix it, or update the spec. |
| "It's a Should fix, so `Dismiss` with an accepted-risk note is close enough." | `Dismiss` means it isn't a problem. A real problem the user accepts is `Debt`, so it stays visible. |
| "An unticked manual check blocks Step 3.1, so I'll tick it and annotate it as deferred." | A tick records a pass that never happened. Manual checks are notes, not checkboxes, so Step 3.1 has nothing to block on. Move it under `## Manual Checks`. |

