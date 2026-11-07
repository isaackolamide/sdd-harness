# sdd-harness

> SDD workflow orchestrator — thin layer that composes `agent-skills` and `superpowers` into end-to-end development workflows.

## What This Is

sdd-harness is a plugin that provides the **SDD (Spec-Driven Development) workflow** — a structured path from blank slate to shipped feature, with a built-in iteration loop for post-implementation findings:

```
constitution → task → prd → spec → plan → implement → verify-feature
                                                       ↓
                                                 findings → spec → plan → implement
```

It wraps skills from two major plugins -> `superpowers` and `agent-skills`, plus `frontend-design` for UI work.

## Plugin Stack

```
sdd-harness (orchestrator)      — 10 SDD workflow skills
     ↓ delegates to
agent-skills (primitives)         — 24 engineering skills
superpowers (discipline)          — TDD, subagent-driven execution, brainstorming
claude-md-management (tooling)    — CLAUDE.md audit and improvement
frontend-design (design)          — Distinctive visual design for new UI surfaces (required)
```

## Skills

| Skill | What It Does |
|-------|-------------|
| `/using-sdd-harness` | Routing tree — which skill for which task, across all plugins |
| `/sdd-constitution` | Create or extract SDD constitution — works for new and existing projects |
| `/sdd-task` | Scope a roadmap milestone into one or more right-sized task files — size gatekeeper that splits oversized work before it reaches `/sdd-prd` |
| `/sdd-prd` | Generate Product Requirements Document (PRD) from a task file or rough idea via interactive discovery |
| `/sdd-write-spec` | Create feature spec for a new feature — links it on the roadmap milestone and, if you want one, drafts a flow diagram (Mermaid or Excalidraw) |
| `/sdd-plan-feature` | Plan a feature from a feature spec file — outputs plan.md/requirements.md/validation.md; triggers ADR for significant arch decisions |
| `/sdd-implement-plan` | Execute a feature plan — 3-way mode (subagent-driven / autonomous / checkpoint), domain-aware dispatch, TDD enforced with committed RED/GREEN evidence, phase checkpoints, developer whole-branch review |
| `/sdd-implement-parallel-plans` | Execute multiple independent feature plans concurrently using isolated git worktrees |
| `/sdd-verify-feature` | Run parallel verification gate (test engineer & code quality reviewer), check TDD evidence, update progress files, run pre-merge audits, and integrate the branch |
| `/optimise-claude-md` | Audit and improve any project's CLAUDE.md |


## Installation

> **SSH blocked?** If your network blocks SSH connections to GitHub, run this once before installing:
> ```bash
> git config --global url."https://github.com/".insteadOf "git@github.com:"
> ```
> This rewrites any `git@github.com:` URLs to HTTPS automatically.

### Platform Integration Guides

#### 1. Claude Code

```bash
# Register marketplaces
claude plugin marketplace add https://github.com/addyosmani/agent-skills.git
claude plugin marketplace add https://github.com/isaackolamide/sdd-harness.git

# Install plugins
claude plugin install superpowers@claude-plugins-official
claude plugin install agent-skills@addy-agent-skills
claude plugin install claude-md-management@claude-plugins-official
claude plugin install frontend-design@claude-plugins-official
claude plugin install sdd-harness@sdd-harness
```

> **`frontend-design` is a required prerequisite.** `/sdd-plan-feature` invokes it for features that introduce a new screen or visual direction, and `/sdd-implement-plan` passes it to UI tasks.

#### 2. Antigravity CLI / IDE

```bash
agy plugin install https://github.com/addyosmani/agent-skills.git
agy plugin install https://github.com/obra/superpowers.git
agy plugin install https://github.com/isaackolamide/sdd-harness.git
```

## How to Use

The SDD (Spec-Driven Development) workflow is structured into four main phases, executed in sequence.

```mermaid
flowchart TD
    Start(["Start Task"]) --> Constitution{"Constitution exists?"}
    Constitution -- "No" --> Init["0. Init Constitution: sdd-constitution"]
    Init --> Task["0.25. Scope Task: sdd-task"]
    Constitution -- "Yes" --> Task
    
    Task -- "One task file per capability" --> PRD["0.5. PRD: sdd-prd"]
    PRD --> Spec["1. Spec: sdd-write-spec"]
    
    Spec --> Plan["2. Plan: sdd-plan-feature"]
    Plan --> Implement["3. Implement: sdd-implement-plan"]
    Implement --> Verify["4. Verify: sdd-verify-feature"]
    Verify --> Finish(["Feature Integrated / Done"])
    
    %% Loop for issues found during verification
    Verify -. "Verification Failures / Code Quality Issues" .-> Implement
    
    %% Loop for post-integration feedback/bugs
    Finish -. "Post-Integration Findings / Bugs" .-> Spec
    Finish -. "Next Milestone / New Idea" .-> Task
```

> [!TIP]
> Unsure which skill to run for a specific task? Run `/using-sdd-harness` at the start of your session to view the authoritative routing tree across all plugins in the stack.

### Choose Your Entry Point

Pick the starting command that matches your current project state:

#### 1. Starting Fresh (New Project or Greenfield Initiative)
You do not have a project constitution yet. You need to bootstrap the core scope, guidelines, roadmap, or crystallize a rough idea.
```text

/sdd-constitution      # Interactive interview → generates mission.md, tech-stack.md, roadmap.md
/sdd-task              # Scope a milestone → sdd-specs/tasks/YYYY-MM-DD-{task}-task.md (splits oversized work)
/sdd-prd               # Discovery interview (seeded by task file) → sdd-specs/prds/YYYY-MM-DD-{feature}-prd.md
/sdd-write-spec        # Propose new feature spec (reads PRD) → features/YYYY-MM-DD-{feature}-spec.md
/sdd-plan-feature      # Choose feature/milestone → plan.md, requirements.md, validation.md
/sdd-implement-plan    # TDD slice-by-slice implementation loop
/sdd-implement-parallel-plans # Implement multiple independent plans concurrently
/sdd-verify-feature    # Formal validation, quality audits, ticks roadmap, merges branch
```
*Note: For an existing codebase, `/sdd-constitution` will automatically read your folder structure and commit history to pre-fill context before asking any questions.*

#### 2. Constitution Exists (Adding a New Feature)
The project constitution already exists. You are starting a new feature from the roadmap.
```text
/sdd-task              # Scope the roadmap milestone → one or more task files
/sdd-prd               # Discovery interview per task file → generates PRD
/sdd-write-spec        # Creates feature spec (consumes PRD) → sdd-specs/features/YYYY-MM-DD-{feature}-spec.md
/sdd-plan-feature      # Reads feature spec → plan.md, requirements.md, validation.md
/sdd-implement-plan    # Runs implementation slices & developer review
/sdd-implement-parallel-plans # Implements multiple independent feature plans concurrently
/sdd-verify-feature    # Formally validates criteria & integrates branch
```
*Note: If `/sdd-task` splits a milestone into several task files, run `/sdd-prd` on them one at a time.*

#### 3. Post-Implementation Findings (Bugs & Feedback)
Manual testing or review revealed issues or adjustments after running `/sdd-implement-plan`. Feed findings back into the spec/plan loop to handle them with discipline (no task file or PRD needed):
```text
/sdd-write-spec        # Generate spec from findings seed (inline or --file path/to/notes.md)
/sdd-plan-feature      # Plan the fixes → plan.md, requirements.md, validation.md
/sdd-implement-plan    # Implement fixes with TDD
/sdd-verify-feature    # Validate fixes and complete integration
```

---

### Command Deep Dive & Outputs

#### Phase 1: Discovery & Specification (`/sdd-constitution`, `/sdd-task`, `/sdd-prd`, `/sdd-write-spec`)
Sets product requirements, project-wide boundaries, and creates feature specifications.
* **`/sdd-constitution` (No existing specs):**
  * `sdd-specs/mission.md` — Core objective, user persona, and "never do" list boundaries.
  * `sdd-specs/tech-stack.md` — Directory structure, code style rules (with code snippet), and test runner configurations.
  * `sdd-specs/roadmap.md` — Project milestones and release phases.
* **`/sdd-task` (Roadmap milestone or rough idea):**
  * Runs a size check first. If the milestone bundles more than one actor, workflow, or independently shippable capability, it splits it into one task file per capability before writing anything.
  * `sdd-specs/tasks/YYYY-MM-DD-{name}-task.md` — Context, Expected Implementation, Out of Scope, Acceptance Criteria (Given/When/Then, at least two scenarios each for Happy Path, Error Path, and Boundary), Open Questions/Assumptions, and a task-specific Definition of Done.
  * `sdd-specs/roadmap.md` — One milestone bullet per task file, linking to it.
* **`/sdd-prd` (Task file or rough product/feature idea):**
  * `sdd-specs/prds/YYYY-MM-DD-{name}-prd.md` — Comprehensive Product Requirements Document (PRD) detailing user journeys, Acceptance Criteria, MoSCoW priorities, and constraints. When seeded by a task file, it records the path under `Task Reference` and still runs the full discovery interview.
* **`/sdd-write-spec` (PRD or idea exists):**
  * `sdd-specs/features/YYYY-MM-DD-{name}-spec.md` — Scoped feature specification (can translate a PRD into a technical spec).
  * `sdd-specs/diagrams/YYYY-MM-DD-{name}-flow.md` — Optional flow diagram. You are asked whether you want one, then pick the detail level (High-level / Standard / Detailed) and the format (Mermaid, or Excalidraw with a companion `.excalidraw` file).
  * `sdd-specs/roadmap.md` — Appends the spec link to the existing task milestone bullet, or adds a new bullet when there is no upstream task file (e.g. bug-fix path).

#### Phase 2: `/sdd-plan-feature`
Breaks the feature spec into structured, implementable tasks.
* **Outputs:**
  * `sdd-specs/plans/YYYY-MM-DD-{name}/plan.md` — Task breakdown with strict interface contracts, a `TDD: required` or `TDD: N/A — <reason>` line per task, and phase checkpoints.
  * `sdd-specs/plans/YYYY-MM-DD-{name}/requirements.md` — Project scope, out-of-scope items, and design constraints (e.g. security, telemetry, migration risk, UI constraints, design direction).
  * `sdd-specs/plans/YYYY-MM-DD-{name}/validation.md` — Acceptance criteria checklist and definition of done.
  * `sdd-specs/docs/decisions/ADR-{NNN}.md` — Generated automatically if significant architectural choices surface.
  * Updates `mission.md`, `tech-stack.md` and `roadmap.md` (structure only) when the plan decides new dependencies, structure or scope. Nothing is written until you approve the pre-write review.
* **Sub-skills:** security, telemetry, migration, API/interface and UI advisors run in parallel subagents when the spec triggers them; `frontend-design` runs only for new visual surfaces.

#### Phase 3: `/sdd-implement-plan`
Executes the plan slice by slice using Test-Driven Development (TDD) on an isolated feature branch.
* **Execution Modes (selected on start):**
  * **Subagent-driven** (Recommended for $\ge$ 4 slices): Spawns an isolated subagent per task; maintains context cleanliness.
  * **Autonomous**: Executes the entire plan in a single run without pausing.
  * **Checkpoint**: Pauses for user confirmation after completing each slice.
* **Branch isolation:** A new feature branch is always created at the start of execution — regardless of the current branch state.
* **TDD evidence:** For every `TDD: required` task, the reviewer rejects the slice unless the implementer's report shows a failing test (RED) before the passing one (GREEN).
* **Outputs:**
  * Commits corresponding to each task slice.
  * `sdd-specs/plans/YYYY-MM-DD-{name}/tdd-evidence.md` — The committed RED/GREEN record for each task (or its N/A reason), added in the same bookkeeping commit that ticks the task.
  * Phase checkpoints verified, ticked, and committed at phase boundaries.
  * Whole-branch code review results.

#### Phase 4: `/sdd-verify-feature`
Validates code compliance and merges the feature branch.
* **Workflow:**
  * Runs a **Parallel Verification Gate**: dispatches the `test-engineer` subagent (given `validation.md`, `requirements.md`, and `tdd-evidence.md`) to verify validation criteria and a `code-quality-reviewer` subagent to audit code quality simultaneously.
  * Audits raw execution logs and quality reports. Any issues found are added to `plan.md` under `## Additional Fixes` to be resolved via `/sdd-implement-plan`.
  * Ticks off progress in `plan.md` and `roadmap.md` upon completion.
  * Runs a pre-merge programmatic verification gate (checks every plan task has a `tdd-evidence.md` entry, checks git cleanliness, runs main build, lint, and test scripts).
  * Integrates the branch and cleans up using `superpowers:finishing-a-development-branch`.

## What's NOT in This Plugin

Skills that used to be copied here now live in `agent-skills` directly:

- interview-me, idea-refine
- incremental-implementation, api-and-interface-design
- code-review-and-quality, security-and-hardening
- ci-cd-and-automation, observability-and-instrumentation
- documentation-and-adrs, deprecation-and-migration

Install `agent-skills@addy-agent-skills` to get all of these.
