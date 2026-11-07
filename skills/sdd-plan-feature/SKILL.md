---
name: sdd-plan-feature
description: Use when planning a validated feature spec file within an active SDD project.
metadata:
  type: planning
  composesWith: [agent-skills:planning-and-task-breakdown, agent-skills:security-and-hardening, agent-skills:observability-and-instrumentation, agent-skills:deprecation-and-migration, agent-skills:api-and-interface-design, agent-skills:frontend-ui-engineering, frontend-design:frontend-design, agent-skills:documentation-and-adrs]
---

# SDD Feature Planner

**REQUIRED SUB-SKILL:** Use `agent-skills:planning-and-task-breakdown` to structure the plan (main agent, interactive). Other sub-skills are selected by the Step 3 trigger table.

## When to Use
- **Do NOT use when** no feature spec exists (use `/sdd-write-spec`).
- **Do NOT use when** executing a plan (use `/sdd-implement-plan`).

## File Ownership

| File | This skill | After planning |
|---|---|---|
| `mission.md`, `tech-stack.md` | Edits additively (Step 4.6), written in Step 6 | Nobody edits |
| `roadmap.md` | Edits structure only (split, reword, add, link to plan), written in Step 6; never ticks a checkbox | `/sdd-verify-feature` ticks |
| `requirements.md`, `validation.md` | Creates (Step 6) | `/sdd-verify-feature` owns |

No task's `Files` line may list any of these files. A constitution update is never a plan task.

## Workflow

### Step 1: Feature Spec Verification
1. If no spec is provided, check `sdd-specs/features/`.
2. Multiple files? Ask user to select.
3. Exactly one? Propose and confirm.
4. None? **STOP**. Direct user to `/sdd-write-spec`.
5. Parse the spec for: Objective (Why/Outcome), User (Who), Acceptance Criteria (Success), Technical Constraints (Constraint), Dependencies.

### Step 2: Gather Project Context
1. Read `sdd-specs/mission.md`, `tech-stack.md`, and `roadmap.md`.
2. Note missing files but do not block (Step 4.6 flags them).

### Step 3: Feature Naming & Classification
1. Match the spec against the trigger table, case-insensitively and by whole-word stem (`authentication` matches `auth`, `enqueues` matches `queue`; `platform` does not match `form`; a multi-word keyword such as `rename column` matches as a phrase). Every row whose trigger matches is selected; a keyword appears in exactly one row. The Architecture row is skipped here and evaluated in Step 4.5.

| Trigger | Keywords | Skill | Runs in | Output |
|---|---|---|---|---|
| API/Interface | `endpoint`, `GraphQL`, `interface`, `route`, `contract` | `agent-skills:api-and-interface-design` | subagent | `API & Interface Design` section + ACs |
| Security | `auth`, `login`, `payment`, `token`, `secret`, `PII` | `agent-skills:security-and-hardening` | subagent | `Security Constraints` section + ACs |
| Telemetry | `cron`, `metric`, `alert`, `queue`, `background job` | `agent-skills:observability-and-instrumentation` | subagent | `Telemetry & Observability` section + ACs |
| Migration | `refactor`, `schema`, `deprecate`, `rename column` | `agent-skills:deprecation-and-migration` | subagent | `Migration & Deprecation Plan` section + ACs |
| Frontend | `frontend`, `UI`, `page`, `screen`, `component`, `layout`, `form`, `responsive` | `agent-skills:frontend-ui-engineering` | subagent | `UI Constraints` section + ACs |
| New visual surface | Frontend matched AND the spec introduces a new screen/surface or asks for a new visual direction | `frontend-design:frontend-design` | main agent | `Design Direction` section |
| Architecture | judgement, not keywords: a choice between structurally different approaches that is costly to reverse | `agent-skills:documentation-and-adrs` | main agent | ADR (drafted in Step 4.5, written in Step 6) |

2. **Judgement fallbacks** (keywords miss things; give a one-line reason for each decision in the confirmation question so the user can override):
   - **Security:** if any row matched and Security did not, decide whether the feature handles user data, is externally reachable, or triggers costly work. If so, select Security. A change with no behaviour change and no new reachable surface (e.g. an internal rename) is not a Security trigger.
   - **API/Interface:** an HTTP verb plus path (e.g. `POST /exports`) counts as a match.
   - **Migration:** if the change renames, moves, splits or restructures existing code or data, select Migration even without a keyword.
3. **Frontend design scope:** check `tech-stack.md` and `mission.md` for an established design system. If Frontend matched but you still cannot tell whether the surface is new, include that question in the confirmation below. Changes inside an established design system do NOT invoke `frontend-design:frontend-design`.
4. **Confirm:** propose `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` together with the matched trigger rows and the one-line reason for each judgement decision (selected or declined), in one question. The user may add or drop rows; their answer is final. If no row matched, say so in the question and invite the user to add one; then go to Step 4. For a trivial spec (e.g. a constant-response endpoint), recommend dropping the advisor row and cover its ACs yourself in Step 4.4.
5. **Dispatch advisors in parallel** (one message, one Agent call per subagent row). Each prompt contains: the spec path, the `tech-stack.md` path, the skill to invoke, and this return contract — nothing else is returned:
   - `SECTION`: the body for the matching `requirements.md` section.
   - `ACS`: acceptance-criteria lines, each tagged happy path / error state / boundary, for the planner to attach to tasks.
   - `OPEN_QUESTIONS`: decisions that need the user (advisors cannot ask them).
   An advisor that returns nothing or a malformed result: re-dispatch once, then tell the user and ask how to proceed (the user's answer is final, including "skip it", in which case cover that row's ACs yourself in Step 4.4). Never skip a selected row on your own.
6. Merge the returned fragments yourself; do not paste advisor prose into the plan.
7. If New visual surface matched, now invoke `frontend-design:frontend-design` in the main agent; its output is the `Design Direction` section, and the Frontend `UI Constraints` ACs apply on top of it.
8. Relay all `OPEN_QUESTIONS` (advisors' and `frontend-design`'s) to the user now, as one consolidated question, before Step 4. Skip this if there are none.

### Step 4: Planning & Decomposition
1. Read the three templates in `templates/` (plan, requirements, validation) and `sdd-harness:references/testing-patterns.md`. Plan content MUST follow the template structure exactly.
2. Invoke `agent-skills:planning-and-task-breakdown` in the main agent. Confirm with the user in one question: task order and sizing, plus every open decision: a structural choice between approaches (present the options with a recommendation) or a plan need that conflicts with an existing `tech-stack.md` constraint (until the user decides, plan to conform to the constraint). Additive items that contradict nothing, such as a new dependency, file or directory, are not decisions; they go straight into the Step 5 diff. Choosing a design system for a project that has none is a structural decision.
   Decisions that first appear in 4.5 or 4.6 are asked as a follow-up question (options plus recommendation) before Step 5; draft the ADR only after the user answers.
3. Format directly into `plan.md`. No intermediate files.
4. **4.4 Plan rules** — apply the following to `plan.md`:
   - Each task needs `Interfaces` (function signature + strict types in the project's language; no `any`/`unknown` equivalents).
   - Task headers: `### Task X.Y: [Name]`
   - Each task needs a `TDD:` line: `TDD: required`, or `TDD: N/A — <reason>` for tasks with no testable behaviour (config-only, docs-only). Never omit it — implementers only record RED/GREEN evidence when the task says TDD is required.
   - Task Acceptance Criteria MUST cover three dimensions (multiple ACs per dimension as needed): 1. Happy path, 2. Error states/handling, 3. Boundary conditions. Attach advisor `ACS` to the tasks they constrain.
   - End phases with `### Checkpoint — Phase N` with a checkbox.
   - Inject `feature`, `specFile`, `targetBaseBranch: <current-branch>`, and `created: YYYY-MM-DD` in YAML frontmatter.
   - Use `sdd-specs/...` relative paths; output interface contracts, not code.
5. **4.5 ADR:** evaluate the Architecture row. If it matches, invoke `agent-skills:documentation-and-adrs` and draft the record for `sdd-specs/docs/decisions/` (cross-referenced from `requirements.md` Decisions). Hold it in memory until Step 6.
6. **4.6 Constitution changes:** compare the plan against `mission.md`, `tech-stack.md`, `roadmap.md` and propose edits for anything the plan decides: new dependencies, project structure, commands, and test strategy (all `tech-stack.md`), mission scope (`mission.md`), and roadmap milestone structure (`roadmap.md`).
   - Hold the diff in memory until Step 6. New files or directories the plan creates are listed as project-structure additions in the `tech-stack.md` diff. If the plan decides nothing, the diff is empty and the Step 5 summary says "no constitution changes".
   - A missing constitution file is flagged and pointed to `/sdd-constitution`, never created; edits to it (including linking the plan from `roadmap.md`) are skipped. The flag is shown in the Step 5 summary, separately from "no constitution changes".
   - Edits are additive or corrective. A contradiction with an existing constraint is an open decision for Step 4.2, not an overwrite.

### Step 5: Pre-Write Review (GATE)
1. Present summary of `plan.md`, `requirements.md`, and `validation.md`, plus the proposed constitution diff and any ADR draft.
2. Ask focused probe: "Does anything in the plan surprise you, or does any acceptance criterion feel wrong? If it looks correct, please confirm we are ready to write the files."
3. Adjust and re-confirm if concerns raised.
4. **STOP**: Wait for explicit approval before writing ANY file (plan files, constitution edits, ADR). An earlier instruction such as "write it now" does not count as approval, and a request to "skip the questions" waives nothing before this gate except rows dropped in Step 3.4.

### Step 6: Output
1. Write `plan.md`, `requirements.md`, and `validation.md` to `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` using the exact structure of the templates.
2. Apply the approved constitution edits to `sdd-specs/` on the current branch, and write the approved ADR.

### Step 7: Commit & Hand-off
1. **Commit**: stage and commit all changes in this branch, so `/sdd-implement-plan` (which branches off the current HEAD) starts from a clean tree:
   ```bash
   git add -A
   git commit -m "docs(plan): plan {feature-name}"
   ```
   If the commit fails (hook rejection, nothing staged), fix the cause and re-run it. Never print the handoff until `git status --porcelain` is empty.
2. **Handoff**: print:
   > "✓ Plan committed at `sdd-specs/plans/YYYY-MM-DD-{feature-name}/`. Next Step: Run `/sdd-implement-plan sdd-specs/plans/YYYY-MM-DD-{feature-name}/`."

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I'll batch confirmations at the end." | Batching bypasses user guidance. Stop at each gate. |
| "I'll skip the pre-write review." | Causes churn if plan is wrong. Final safety net. |
| "TDD is obvious for code tasks, I don't need the `TDD:` line." | Omitting it silently disables the RED/GREEN gate. |
| "It's quicker to run the advisor skills inline." | Advisor skill bodies crowd out the plan. Dispatch in parallel with the return contract. |
| "The spec is UI, so I'll run frontend-design too." | Inside an existing design system it invents a new look. New surfaces only. |
| "I'll add a plan task to update tech-stack.md." | Planning decided it; update it after the gate. A task is wasted work and leaves verify judging code against a stale standard. |
| "I'll tick the roadmap item since planning is done." | Planned is not delivered. Only `/sdd-verify-feature` ticks. |
| "User is in a hurry, I'll write the constitution edit now." | No file is written before Step 5 approval. |
| "The files are written, I'll just tell the user to run `/sdd-implement-plan`." | Uncommitted plan files leak into the implementation branch. Commit (Step 7.1) before any handoff. |
