---
name: sdd-plan-feature
description: Use when planning a validated feature spec file within an active SDD project to generate structured implementation files.
metadata:
  type: implementation
  composesWith: [agent-skills:planning-and-task-breakdown, agent-skills:interview-me, agent-skills:security-and-hardening, agent-skills:observability-and-instrumentation, agent-skills:deprecation-and-migration]
---

# Spec-Driven Development (SDD) Feature Planner

Plan a feature within your SDD project. This skill wraps `agent-skills:planning-and-task-breakdown` to produce structured planning output in your project's `sdd-specs/plans/` directory.

## Workflow

### Pre-Step 0: Feature Spec Verification

Before reading any project files or starting the plan, verify that a valid feature spec file (e.g., `sdd-specs/features/YYYY-MM-DD-<feature-name>-spec.md`) is provided or available:

1. **Verify Input Reference**:
   - Check if a path to a feature spec file was provided as seed input or referenced in the current context.
   - If no feature spec file is provided/referenced, check the `sdd-specs/features/` directory for existing feature spec files:
     - **Multiple files found** → Present the list to the user and ask them to select which feature spec they want to plan.
     - **Exactly one file found** → Propose planning from that file and ask for confirmation.
     - **No files found** → **STOPS**. You must inform the user that a feature spec file is required to proceed. Direct the user to run `/sdd-write-spec` first to generate a feature spec file. Do not proceed to planning.

2. **Read & Parse Feature Spec**:
   - Read the verified feature spec file.
   - Parse the feature spec sections to extract the planning details:
     - **Outcome/Why**: mapped from the `Objective` section.
     - **Who**: mapped from the `User & Stakeholder` section.
     - **Success**: mapped from `Acceptance Criteria` and `Success Metrics` sections.
     - **Constraint**: mapped from `Technical Constraints` section.
     - **Dependencies**: mapped from the `Dependencies` section.
     - **Stakeholder Flags**: mapped from the `Stakeholder Flags` section.
     - **Design Reference**: if a `figma.com` URL is present in `Design Reference`, carry it verbatim into `requirements.md` under a `## Design Reference` section. Do not paraphrase it.

---

### Step 1: Gather Project Context

Read project context to inform the planning process:

1. Read `sdd-specs/mission.md` (if it exists) — extract objective, boundaries, constraints
2. Read `sdd-specs/tech-stack.md` (if it exists) — extract project structure, code style, testing strategy
3. Read `sdd-specs/roadmap.md` (if it exists) — understand where this feature fits in the project timeline

Missing files do not block. Note their absence internally but proceed with whatever context is available.

Build an internal context block that informs all subsequent steps:
```
PROJECT CONTEXT:
- Mission:         [from mission.md or "not specified"]
- Tech stack:      [key technologies from tech-stack.md or "not specified"]
- Current phase:   [from roadmap.md or "not specified"]
- Boundaries:      [from mission.md or "not specified"]
```

---

### Step 2: Minimum Viable Fields Check

Assess whether enough information exists to plan, or whether a deep interview is needed.

**The five fields:**
1. **Who** — who benefits from this feature? (stakeholder, user persona)
2. **Why** / **Outcome** — what problem does it solve and what does it do?
3. **Success** — what does "done" look like? (concrete outcome)
4. **Constraint** — what is the binding limit? (time, scope, compatibility, performance)
5. **Dependencies** — does this feature touch or depend on existing systems?

**Assessment logic:**
- Check parsed fields from the feature spec (Pre-Step 0) and project context (Step 1).
- Mark each field as: PRESENT or MISSING.
- Since info is loaded from the feature spec file, all core fields should normally be PRESENT.
- Propose the finalized intent restatement to the user:
```
- Outcome:      <one line>
- User:         <one line>
- Why now:      <one line>
- Success:      <one line>
- Constraint:   <one line>
- Out of scope: <one line>
```
- Wait for explicit "yes" or "lgtm" confirmation before proceeding.
- If any core details are missing or need clarification: invoke `agent-skills:interview-me` to resolve them before presenting the restatement.

---

### Step 3: Feature Naming

Establish the feature name for the output directory.

- Propose the feature name based on the feature spec name (e.g. `sdd-specs/plans/YYYY-MM-DD-{feature-name}/`).
- Confirm naming and directory path with a single confirmation question.
- Create the feature directory `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` immediately after the name is confirmed.

---

### Step 3.5: Conditional Planning Classification

Identify whether this feature requires specialized planning gates by matching the feature description, intent restatement, and feature spec file against these keyword groups:

| Classification | Trigger Keywords | Required Planning Action |
|----------------|------------------|--------------------------|
| **Security Sensitive** | `auth`, `password`, `login`, `sign-in`, `payment`, `credit-card`, `crypto`, `PII`, `credentials`, `upload` | Invoke `agent-skills:security-and-hardening` to write a dedicated `## Security Constraints` section in `requirements.md` and security criteria in `validation.md`. |
| **Telemetry Required** | `API`, `endpoint`, `cron`, `background`, `job`, `worker`, `event`, `analytics`, `log`, `metric`, `network` | Invoke `agent-skills:observability-and-instrumentation` to write a dedicated `## Telemetry & Observability` section in `requirements.md` detailing logging specs, metrics tracking, and error alerting rules. |
| **Migration Risk** | `refactor`, `rewrite`, `replace`, `deprecated`, `remove`, `delete`, `rename`, `schema`, `database migration` | Invoke `agent-skills:deprecation-and-migration` to write a dedicated `## Migration & Deprecation Plan` in `requirements.md` and inject corresponding tasks in `plan.md`. |
| **Clean Architecture** | `controller`, `route`, `dto`, `use-case`, `repository`, `entity`, `domain`, `adapter`, `composition root` | Reference `sdd-harness:references/clean-architecture-ddd-reference.md` in `requirements.md`'s `## References` section. If it is a non-TypeScript project (like Python), add a note instructing agents to map the architectural concepts (layers, interfaces, dependency flow) conceptually to the target language rather than syntactically. |

If no keywords match a group, omit the corresponding planning action and section to keep the output minimal and avoid planning bloat. Always include a reference to `sdd-harness:references/testing-patterns.md` under references to guide test strategy.

---

### Step 4: Run Planning-and-Task-Breakdown, Then Format plan.md

Trigger `agent-skills:planning-and-task-breakdown` with:
- Confirmed feature description (from intent restatement or feature spec)
- Project context from Step 1 (mission, tech stack, roadmap phase)
- Constraints and out-of-scope from Steps 2/2b
- The feature spec file contents

**User confirmation gate:** Do not proceed until the task order, sizing, and checkpoints are confirmed by the user.

After user confirms the breakdown, format the output directly into `plan.md` using the template in the **File Templates** section below. Format output directly into plan.md with no intermediate files of any kind — write to `sdd-specs/plans/YYYY-MM-DD-{feature-name}/plan.md` directly.

**Key formatting rules:**
- Each task gets a lightweight `Interfaces` line — declare what the task produces (function name + type) and what it consumes from prior tasks. This is NOT pre-written code; it is a contract declaration so subagent implementers know what signatures to implement and what is available from earlier slices. Full signatures are required for both produced and consumed functions — prose descriptions ("produces email sending functionality") are not acceptable; if you cannot name a function signature, the task decomposition is not done yet.
- **Typing constraints**: Every interface contract MUST specify fully typed inputs and outputs. The use of `any`, `unknown`, or generic `Record<string, any>` is strictly forbidden unless there is no technical alternative. If returning or accepting a complex structure, define its key properties inline (e.g., `{id: string, name: string}`) rather than using a loose dictionary escape.
- Each task header follows the format `### Task X.Y: [Task Name]` (with no checkbox in the header itself) to match regex parsing tools. The task contains a `- [ ] Task Completed` checklist item to track task completion, and task acceptance criteria are plain bullet points.
- Each phase ends with a `### Checkpoint — Phase N` block with a checkbox. `sdd-implement-plan` runs this verification before advancing to the next phase.
- No code blocks, no TDD steps, no bash commands — those are `sdd-implement-plan`'s responsibility at execution time.

**ADR trigger:** When decomposition surfaces a significant architectural or technology choice (framework selection, data model, auth strategy, API architecture, or any decision expensive to reverse):
- Invoke `agent-skills:documentation-and-adrs`
- **Save location:** `sdd-specs/docs/decisions/ADR-{NNN}-{title}.md` — sequential numbering; check existing files to determine next number. ADRs are project-level artifacts and are **not** saved inside the feature directory.
- **Cross-reference:** Add the ADR path to `requirements.md` under the Decisions section

Apply the ADR trigger only to choices where the rationale and rejected alternatives have future value — not to every decision.

---

### Step 5: Pre-Write Review

Before writing any file to disk, present a structured summary of what will be written and probe for gaps.

**Present summary:**
```
I'm about to write three files to sdd-specs/plans/YYYY-MM-DD-{feature-name}/:

plan.md:
  - {N} phases, {M} total tasks
  - Phase names: [list]
  - {K} checkpoint blocks

requirements.md:
  - In scope: [2-3 bullet summary]
  - Out of scope: [1-2 bullets]
  - Key decisions: [list any ADRs written, or "none"]

validation.md:
  - {J} acceptance criteria
  - Definition of done: [one-line summary]
```

**Ask a focused probe:**
> "Before I write these: is there anything in the plan that surprises you, anything missing from scope, or any acceptance criterion that feels wrong?"

**If concerns are raised:**
- Use interview-me's single-question follow-up style to clarify each concern
- Adjust plan content and restate the adjustment
- Confirm the adjustment before continuing
- Once all concerns are resolved, return to the pre-write summary and ask the focused probe question again before proceeding to Step 6

**To proceed to Step 6:** present the summary, ask the focused probe question, then wait for explicit confirmation. **The user must reply with a lowercase confirmation keyword (e.g. exactly `"yes"`, `"looks good"`, or `"write it"`).** General or ambiguous confirmation phrases ("sure", "whatever", "okay", or "just do it") must not be accepted — hold the gate and re-ask the probe question until explicit confirmation is given. Do not skip the probe question even if the user has expressed urgency.

---

### Step 6: Output

Generate the three files:

```
sdd-specs/plans/
└── YYYY-MM-DD-{feature-name}/
    ├── plan.md          → Phase-structured task list with interface contracts and checkpoint blocks
    ├── requirements.md  → Scope, decisions, context, out-of-scope
    └── validation.md    → How to know implementation succeeded and can be merged
```

---

## File Templates

Read the templates located in the `templates/` directory to format the generated planning files:
- **plan.md**: [templates/plan.md](templates/plan.md) — Phase-structured implementation plan containing checkboxes for tasks, checkpoints, and plan code review.
- **requirements.md**: [templates/requirements.md](templates/requirements.md) — Scope, decisions, context, and conditional constraints.
- **validation.md**: [templates/validation.md](templates/validation.md) — Acceptance criteria checklist, test coverage requirements, and definition of done.

## Implementation

When you invoke `/sdd-plan-feature`:

1. Run Pre-Step 0: Feature Spec Verification. Ensure a feature spec file exists and is selected/provided. If not, STOP and direct the user to `/sdd-write-spec`.
2. Read the selected feature spec file and parse its fields (Who, Why, Success, Constraint, Dependencies, Stakeholder Flags).
3. Read `sdd-specs/mission.md`, `sdd-specs/tech-stack.md`, and `sdd-specs/roadmap.md` for project context (missing files don't block, but their absence should be noted).
4. Assess minimum viable fields (Who/Why/Success/Constraint).
5. Propose the finalized intent restatement (derived from the feature spec) and require explicit "yes" confirmation before continuing. If any core details are missing, invoke `agent-skills:interview-me`.
6. Confirm feature name (propose if inferrable; otherwise ask a single question) — create `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` directory immediately after confirmation.
7. Run Conditional Planning Classification (Step 3.5) — check keywords for Security, Telemetry, Migration risk, and Clean Architecture. Prepare corresponding requirements/validation/plan additions. Always include the testing patterns reference.
8. Trigger `agent-skills:planning-and-task-breakdown` — dependency graph, vertical slices, task sizing, checkpoints.
9. If a significant architectural decision surfaces: invoke `agent-skills:documentation-and-adrs` → save to `sdd-specs/docs/decisions/ADR-{NNN}-{title}.md`; cross-reference in requirements.md.
10. Confirm task order and sizing with user before continuing — then format output directly into `plan.md` using the templates.
11. Present pre-write summary of all three files — ask focused probe; resolve concerns before writing.
12. Write plan.md, requirements.md, and validation.md to `sdd-specs/plans/YYYY-MM-DD-{feature-name}/`.

## Key Points

- Always plan from a feature spec file: A valid feature spec file (e.g. `sdd-specs/features/YYYY-MM-DD-<name>-spec.md`) is a hard prerequisite for running `/sdd-plan-feature`. Fallback to the roadmap or planning from a blank state is no longer allowed.
- Minimum viable fields check (Who/Why/Success/Constraint + Dependencies) gates the deep interview questions — only invoke the interactive interview when fields are genuinely missing, but always present the intent restatement for confirmation.
- Single-pass planning: planning-and-task-breakdown output is formatted directly into plan.md — no intermediate files of any kind, no writing-plans pass.
- Plans contain interface contracts (function name + type per task), not code — TDD execution is sdd-implement-plan's job at implementation time. If you cannot name a function signature for a task, decompose that task further: inspect existing code for caller conventions, ask the user what the consuming task expects, or stub a name and type from the task description.
- Phase sections with checkpoint blocks and task headers with checkboxes enable progress tracking during implementation.
- ADRs are project-level artifacts saved to `sdd-specs/docs/decisions/` with sequential numbering — not in the feature directory.
- Pre-write review probes for gaps with a structured summary and a focused probe question before committing files to disk.
- requirements.md makes out-of-scope explicit, not just in-scope.
- requirements.md contains conditional sections (Security, Telemetry, Migrations) which are omitted by default unless triggered by keyword classification to avoid planning bloat.
- validation.md defines "done" before implementation starts — not after.
- Never include absolute file paths (e.g. `file:///Users/username/...`) in generated output files. Refer to other specification files using paths starting with `sdd-specs/` as the root (e.g., `sdd-specs/plans/YYYY-MM-DD-{feature-name}/plan.md`), rather than relative paths.
