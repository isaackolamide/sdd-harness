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
   - **Merge duplicates**: When two subagents flag the same line or the same root cause, make it one finding that cites both sources and takes the higher severity.
   - If there are findings:
     - **STOP** and present the [Findings Report](#findings-report) to the user.
     - **STOP** and wait for the user's response. DO NOT proceed until the user replies.
     - **Apply approved `Now` fixes.** Make the edits, then run the workspace lint and test scripts. If a check fails, revert that edit, change the finding's Route to `Plan`, and tell the user. Commit the surviving fixes once, as `chore(verify): in-session fixes (#N, #M)`.
     - **Update verify-owned spec docs.** `requirements.md`, `validation.md`, and `sdd-specs/roadmap.md` belong to this skill; `/sdd-implement-plan` is forbidden to create or edit them. After the user replies, and before appending any task, make every update below that the user's decisions call for. Cite the ruling or ADR and the date in each edit.
       - `requirements.md`: correct stale constants or wording; add a binding requirement for any new behaviour rule an approved code fix introduces.
       - `validation.md`:
         - Reword an acceptance criterion that cannot be tested as written, with a dated note naming the ruling or ADR.
         - Add one checklist item per approved fix (e.g. a new `AC-E*` item or a binding-constraint line) that names the fix task number.
         - Manual checks are notes for a human to do in their own time, never checkboxes. Keep them as plain bullets under `## Manual Checks` (create the section after Automation Checks if absent). Move any manual item found inside a checkbox section there and remove its checkbox. Never tick one.
         - Annotate each manual note the user confirmed with the date and operator; annotate each deferred one with the date, operator, and reason.
         - Record results that needed approval or containers (e.g. a full coverage run) as annotations.
         - Reword any check that contradicts verify's ownership, e.g. "`git diff --stat sdd-specs/roadmap.md` is empty" becomes "no plan-task commit touches `roadmap.md`". Never report such a check as FAIL and never revert the roadmap to satisfy it.
     - **Append fix tasks** for ONLY the findings the user approved with Route `Plan`:
       - Determine the next available Phase number in `plan.md`.
       - Create ONE new phase headed `## Phase N: Fixes` (same level as the template's phases; its tasks stay `### Task N.M`) containing every approved finding, whatever its category (validation, code quality, security), appended after the `## Additional Fixes` header at the end of `plan.md`. Do not split by category.
       - Open each phase with this intro, verbatim: "Verify has already updated `requirements.md`, `validation.md` and `roadmap.md`. These tasks change code, tests and ADRs only." No task's `Files` line may list any of those three files.
       - For each approved finding, append a new task using the standard task structure from `plan.md` (including Scope, Files, Interfaces, Acceptance criteria, Verification, and Dependencies) plus a `Source:` line right after `Scope:` set to `validation`, `code-quality`, or `security` (for a merged finding, list each source, e.g. `code-quality, security`).
       - After appending all tasks for a phase, add a standard Checkpoint block to verify those fixes pass.
     - **Commit**: stage the spec documents you changed together with `plan.md` and commit once, e.g. `docs(verify): add Phase N fixes and verify-owned spec updates`. If no task was appended, commit the spec documents alone as `docs(verify): update verify-owned spec docs`.

5. **Determine Exit or Completion**:
   - If the user approved ANY findings to be fixed (meaning tasks were added to `plan.md`):
     1. Exit and hand back: Stop execution of this skill. Tell the user the spec documents are already updated and committed (name the commit), so `/sdd-implement-plan` only needs to run the new phase(s). Instruct the user to run it to execute and verify these fixes before re-running `/sdd-verify-feature`.
        > Note: If approved findings mixed `Now` and `Plan` routes, the full re-run also covers the `Now` fixes, so do not run the gate twice.
        > Note: Quality and security findings are about code craft, while validation is about spec compliance. However, once fixes for any of these are implemented (and their checkboxes ticked during the implementation loop), you must re-run the parallel verification gate in full to verify the fixes and ensure no regressions were introduced.
   - If there were NO findings initially, OR the user dismissed ALL findings, OR every approved finding was routed `Now` or `Spec` (no plan task appended; those fixes are already committed and lint- and test-checked, so do NOT re-run the parallel gate):
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

Write for a human who has not read the diff. Present a headline, a triage table with its key, one card per finding, the recommendation, then the reply prompt.

**0. Headline** — exactly one line in this shape: `N findings: <count> <Verdict>, <count> <Verdict>. Biggest risk: #<n>, <plain words>.` N counts every row in the table, Low included. List only the verdicts that occur, in this order: Must fix, Should fix, Optional, Dismiss, Confirm. E.g. "3 findings: 1 Must fix, 1 Should fix, 1 Optional. Biggest risk: #1, anyone can read every customer's invoices."

**1. Triage table**, sorted by severity, with one row per merged finding:

| # | Finding | Category | Severity | Likelihood | Verdict | Effort | Route |
|---|---------|----------|----------|------------|---------|--------|-------|
| 1 | Customer ID pasted straight into SQL | Security | Critical | High | Must fix | S | Plan |
| 2 | Typo "seperator" in comment | Quality | Low | Low | Optional | S | Now |
| 3 | Spec says 10,000 rows; ADR-007 (newer) says 50,000 | Validation | Medium | High | Should fix | S | Spec |

Print this key under the table, verbatim:
> **Key** — Severity: how bad if shipped · Likelihood: how likely it is to actually bite · Effort: S small, M medium, L large · Route: `Now` fixed in this session, `Plan` new task for `/sdd-implement-plan`, `Spec` spec doc edited here, `Human` you check it yourself

- **Finding**: plain words of about 8 words or fewer. Leave out file paths and jargon (they go in the card).
- **Category**: Validation · Quality · Security · Manual. A merged finding takes the category of its highest-severity source; on a tie, Security wins over Validation, and Validation over Quality. A `Human` finding is Category Manual, Severity Low, Likelihood Medium, Effort S.
- **Severity** (how bad if shipped): Critical = data loss, a security breach, or a core flow broken · High = a user-visible bug or a failing AC · Medium = an edge-case bug or maintainability risk · Low = cosmetic. Map code-reviewer labels as Critical → Critical, Required → High, Optional → Low, Nit → Low. Raise a label only with a stated reason in the card.
- **Likelihood** (how likely the harm is to actually happen once shipped): High = happens in normal use, anyone can trigger it, or a test or AC already fails · Medium = needs an unusual but realistic input, load, or sequence of steps · Low = needs rare conditions or deliberate effort. Likelihood does not change Severity or Verdict; it tells the user how urgent the finding feels.
- **Verdict** (your recommendation): Must fix · Should fix · Optional · Dismiss. Must fix = Critical severity, a failing test, or an unmet AC. Should fix = High or Medium severity that is not Must fix. Optional = Low severity. A `Human` finding always gets the verdict Confirm. A Dismiss finding gets Route `—`, and its card or Low line gives the reason (false positive or intended design).
- **Effort**: S = one file and about 15 lines or fewer · M = several files, new tests, or more than about 15 lines · L = a design change or an ADR.
- **Route**:
  - `Now`: verify fixes it in this session. Use `Now` only if ALL of these are true: the fix changes no runtime behaviour; it adds or changes no test assertion (cosmetic edits to test files are fine); its Effort is S; it touches 2 files or fewer; and it is not Security, not a failing test, and not an unmet AC. Typical cases are typos, dead imports, comments, formatting, and lint.
  - `Spec`: verify edits `requirements.md`, `validation.md`, or `roadmap.md` directly. Use `Spec` when the spec or ADR is the stale side; when the spec and ADR agree and only the code differs, route `Plan`.
  - `Plan`: a fix task appended to `plan.md` for `/sdd-implement-plan`.
  - `Human`: a manual check for the user.
  - `Spec + Plan`: verify first adds the requirement to the spec, then appends the task that implements it. Use this when the fix brings in a new behaviour rule.

**2. One card per finding** that is not Low. Group all Low findings into a single one-line-each list.

> **#1 Customer ID pasted straight into SQL** — `src/export/query.ts:42` (code-reviewer + security-auditor)
> **Like you're 5:** The app asks "which customer?" and copies whatever you say straight into its question to the database. Say "me, or everyone" and it happily answers both.
> **As a user:** A customer edits the web address to `customerId=1 OR 1=1` and downloads every customer's invoices.
> **As an engineer:** The `customerId` query param is concatenated into the SQL string, so it is parsed as SQL, not as a value.
> **Likelihood:** High — the endpoint is public and the trick takes one edited URL.
> **Impact:** Critical — every customer's invoices leak, which is a reportable data breach.
> **Alternatives:** parameterised query *(recommended)* · ORM query builder · allow-list validation only *(weaker)*

Every card has these lines, in this order:
- **Like you're 5**: one or two sentences, everyday words, built on an object or situation from daily life (a lock, a queue, a recipe, a library book). No code terms, no file names, no acronyms.
- **As a user**: one concrete sentence naming an actor, what they do, and what they see or lose. Describe the user or business consequence, not the code mechanism.
- **As an engineer**: one or two sentences on the cause in code terms: the mechanism, the trigger, and what breaks.
- **Likelihood**: the table value, a dash, then one reason naming who or what triggers it.
- **Impact**: the table's Severity value, a dash, then one reason naming what is lost or broken.
- **Alternatives**: include them only where a real choice exists, and mark the one you recommend.

**Low findings** go in one list, one line each: `#N <finding> — <path:line> — <why it is low-risk, or what you need to do>`. They get no card.

**3. Recommendation** — after the cards, give your suggested decision so the user can accept it in one reply. It has these parts, in order:
- **Suggested reply**: a ready-to-send line in the reply format below, e.g. `approve 1,3 · dismiss 2 (intended)`. Approve every `Must fix` and `Should fix`. Dismiss every `Dismiss`. Approve `Optional` findings only when the route is `Now`. Leave `Human` findings out.
- **Why**: one sentence per group (not per finding) giving the reason, e.g. "1 is a security hole and 3 is a spec mismatch; 2 is a typo that Now fixes for free."
- **Caveat**: only if a recommended approval is a judgement call (a `Should fix` with effort `L`, or a route you would change), name it and say what the user gives up by skipping it.

**4. Reply prompt** — end with exactly this:
> Reply with numbers, e.g. `approve 1,3 · dismiss 2 (intended)`. Approving a finding follows its Route, so `Now` items are fixed in this session and `Plan` items go to `plan.md`. To change a route, say so, e.g. `2 → plan`. For manual checks, `confirm 5` means you did it and `defer 5 (reason)` means you will do it later; each is noted under `## Manual Checks` with the date and your name.

## Red Flags - STOP and Start Over

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
| "An unticked manual check blocks Step 3.1, so I'll tick it and annotate it as deferred." | A tick records a pass that never happened. Manual checks are notes, not checkboxes, so Step 3.1 has nothing to block on. Move it under `## Manual Checks`. |

