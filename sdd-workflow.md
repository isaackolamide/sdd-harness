# SDD Workflow Orchestration Steps

This document outlines the 8 core steps of the Spec-Driven Development (SDD) workflow orchestrated by `sdd-harness`.

---

## 1. sdd-constitution (Project Foundation)

**Goal:** Establish the core project identity, technical rules, and master plan. This runs once per repository before specifying any features.

**Process:**
* **Codebase Analysis:** Scans the project layout, dependencies, docs, and git logs (if an existing codebase) to auto-fill layout, scripts, and state.
* **Brainstorm & Interview:** Resolves open questions about target objectives, testing setups (such as mock conventions), and boundaries.
* **Location Gate:** Asks the user where the specification files should live (e.g., `project-root/sdd-specs/`).

**Artifact Outputs:**
* [mission.md](sdd-specs/mission.md): High-level goals, stakeholder profiles, and boundary limits (including "Never Do" restrictions).
* [tech-stack.md](sdd-specs/tech-stack.md): Structural layouts, styling guides, and test runner configurations.
* [roadmap.md](sdd-specs/roadmap.md): The project's timeline divided into phases and milestones.

---

## 2. sdd-task (Task Scoping & Size Gatekeeper)

**Goal:** Turn a roadmap milestone or rough idea into one or more right-sized task files before a PRD is written, catching oversized work before it becomes an expensive-to-resplit PRD or plan.

**Process:**
* **Constitution & Milestone Check:** Verifies the constitution exists and locates (or creates) the roadmap milestone this task belongs to.
* **Light Interview:** Uses `agent-skills:interview-me` to fill any gaps in Context, Expected Implementation, or edge cases not already answered by the seed.
* **Size Gatekeeper Assessment:** Runs a mandatory rubric (multiple actors, multiple workflows, un-splittable "and" in the summary, etc.) against the draft. If any trigger fires, splits the work into multiple descriptively-named task files — regardless of user framing, deadlines, or explicit "don't split it" instructions — instead of asking permission.
* **Confirmation Gate:** Presents the task(s), and any split rationale, requiring explicit approval before writing files.

**Artifact Outputs:**
* [Task file(s)](sdd-specs/tasks/YYYY-MM-DD-<task-name>-task.md): Context, Expected Implementation, Out of Scope, Acceptance Criteria (Given/When/Then, at least two scenarios each for Happy Path, Error Path, and Boundary), Open Questions/Assumptions, and a minimal Definition of Done.
* Updates [roadmap.md](sdd-specs/roadmap.md) with one milestone bullet per task file.

---

## 3. sdd-prd (Product Requirements Document)

**Goal:** Refine a rough idea (or a task file produced by `sdd-task`) into a frozen product specification before writing code or technical details.

**Process:**
* **Interview:** The agent asks exactly one question at a time (proposing hypotheses/guesses with each) to define target users, MoSCoW priorities, user journeys, success metrics, and constraints. Runs in full even when a task file seeds the PRD — the task file only raises confidence in a hypothesis, it never shortens the interview.
* **Propose Approaches:** Proposes 2-3 product/architectural approaches with trade-offs and a recommendation.
* **Intent Restatement Gate:** The user must explicitly approve (yes or looks good) a high-level summary of the scope.

**Artifact Output:**
* [PRD](sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md)

---

## 4. sdd-write-spec (Feature Specification)

**Goal:** Translate the PRD into a technical feature specification aligned with the project's core constitution.

**Process:**
* **Constitution Check:** Verifies that the project's [mission.md](sdd-specs/mission.md), [tech-stack.md](sdd-specs/tech-stack.md), and [roadmap.md](sdd-specs/roadmap.md) exist.
* **Alignment & Gates:** Checks the feature against "Never Do" constraints in the mission. If it violates a constraint, the agent refuses to proceed until the mission document is updated.
* **Intent:** With a PRD seed, runs a gap check (asks only about TBDs, undecided Should/Could items and contradictions) instead of repeating the PRD interview. Without a PRD, runs `agent-skills:interview-me`.
* **Design Brainstorming:** Runs `superpowers:brainstorming` in the main agent so the user can answer its questions directly. Every size (including a small change or a spike) ends in the spec file, never in code. The Visual Companion is offered whenever the feature has a screen, layout, flow, lifecycle, or component relationships worth seeing.
* **Review:** Self-review, a reviewer subagent, then a user review gate on the written spec.
* **Confirmation Gate:** Presents a final restate of the distilled intent, constitution flags, and the readiness to write the approved design, requiring explicit user approval before writing.
* **Roadmap Integration:** If the PRD traces back to a task file, appends the spec link to that task's existing milestone bullet in [roadmap.md](sdd-specs/roadmap.md); otherwise adds a new milestone bullet.

**Artifact Output:**
* [Feature Spec](sdd-specs/features/YYYY-MM-DD-<feature-name>-spec.md)

---

## 5. sdd-plan-feature (Technical Implementation Plan)

**Goal:** Break down the feature spec into concrete, typed tasks and validation criteria.

**Process:**
* **Context & Classification:** Analyzes keywords to apply specialized gates (e.g., Security, Telemetry, Migrations) triggering corresponding sub-skills (`agent-skills:security-and-hardening`, etc.) and references architectural/testing patterns.
* **Decomposition:** Uses `agent-skills:planning-and-task-breakdown` to break implementation into chronological phases and tasks. Each task defines strict Interface Contracts (fully typed inputs and outputs) rather than prose descriptions. Injects `targetBaseBranch` into the plan's frontmatter.
* **Pre-Write Review Gate:** Presents a summary of the plan, requirements, and validation checklist, prompting the user for feedback before writing files.

**Artifact Outputs** (stored in a dedicated directory: `sdd-specs/plans/YYYY-MM-DD-{feature-name}/`):
* [plan.md](sdd-specs/plans/YYYY-MM-DD-{feature-name}/plan.md): Task list with checkpoints at the end of each phase.
* [requirements.md](sdd-specs/plans/YYYY-MM-DD-{feature-name}/requirements.md): Scope limits, architectural decisions, and constraints.
* [validation.md](sdd-specs/plans/YYYY-MM-DD-{feature-name}/validation.md): Measurable definition of "done."

---

## 6. sdd-implement-plan (Slice Execution Loop)

**Goal:** Implement the feature slice-by-slice on an isolated branch using Test-Driven Development (TDD).

**Process:**
* **Branch Creation:** Always prompts for or infers a branch name and runs `git checkout -b <branch-name>` before editing any files, even if already on a feature branch.
* **Read Inputs:** Reads the three plan documents (`plan.md`, `requirements.md`, and `validation.md`) in full before starting implementation.
* **Slice Execution Loop:** Iterates through unchecked tasks sequentially. For each task:
  * **Classify:** Identifies task type (e.g., UI tasks get `frontend-ui-engineering`; API tasks get `api-and-interface-design` and potential ADRs).
  * **Dispatch:** Spawns an implementation subagent to complete the task.
  * **Review:** Spawns a code-reviewer subagent to verify compliance with task constraints.
  * **Atomic Commit:** Commits the implementation/test changes and ticks the task checkbox in `plan.md` in a single atomic git commit.
* **Phase Checkpoints:** Runs the verification command at the end of each plan phase, ticking and committing the checkpoint boundary upon success.
* **Bookkeeping & Hand-off:** Performs a final whole-branch code review loop, commits the ticked review checkbox in `plan.md`, runs `superpowers:finishing-a-development-branch`, and hands off to `/sdd-verify-feature`.

---

## 7. sdd-verify-feature (Validation, Quality Gate, & Merge)

**Goal:** Formally audit, test, and integrate the completed feature.

**Process:**
* **Parallel Verification Gate:** Dispatches a validation subagent (persona: `test-engineer`) and a code quality subagent (persona: `code-reviewer`) concurrently using `superpowers:dispatching-parallel-agents` to minimize execution time.
* **Audit & Collect Findings:**
  * **Validation:** Controller reviews raw stdout logs from the `test-engineer` to verify functional tests passed. Appends any failures to `plan.md` under `## Additional Fixes`.
  * **Code Quality:** Appends any Required or Critical code quality findings to `plan.md` under `## Additional Fixes`.
  * **Gate Exit:** If any issues exist, exits immediately to let the user resolve them via `/sdd-implement-plan`. Otherwise, ticks and commits `validation.md`.
* **Administrative Ticking:** Verifies all checkboxes in `plan.md` are checked, marks the feature complete in the master `roadmap.md`, and commits.
* **Programmatic Verification:** Checks that all checklist items in `plan.md` and `validation.md` are marked complete `[x]`, verifies that the Git working tree has no uncommitted source changes, and runs the main build, lint, and test scripts to prevent merging broken code.
* **Branch Integration:** Determines the target base branch and merges the feature branch using `superpowers:finishing-a-development-branch`.

---

## 8. sdd-implement-parallel-plans (Parallel SDD Implementation)

**Goal:** Execute multiple independent feature plans concurrently using isolated Git worktrees.

**Process:**
* **Isolated Worktrees:** Creates a separate Git worktree for each independent plan inside an ignored `.worktrees/` directory to prevent `git index.lock` conflicts and test suite pollution.
* **Parallel Dispatch:** Spawns a parallel subagent per worktree using `superpowers:dispatching-parallel-agents`, instructing each to execute its respective plan using the `sdd-implement-plan` skill.
* **Review & Cleanup:** Once all subagents complete successfully, reviews their implementation summaries and removes the temporary worktrees.
* **Verification Handoff:** Instructs the user to run verification sequentially on each branch (checking out the branch, running `/sdd-verify-feature`, and rebasing as needed for subsequent branches).
