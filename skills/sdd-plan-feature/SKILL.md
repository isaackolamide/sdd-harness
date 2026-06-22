---
name: sdd-plan-feature
description: Use when planning a validated feature spec or roadmap milestone within an active SDD project to generate structured implementation files.
metadata:
  type: implementation
  composesWith: [agent-skills:planning-and-task-breakdown, agent-skills:interview-me, agent-skills:security-and-hardening, agent-skills:observability-and-instrumentation, agent-skills:deprecation-and-migration]
---

# SDD Feature Planner

Plan a feature within your SDD project. This skill wraps `agent-skills:planning-and-task-breakdown` to produce structured planning output in your project's `sdd-specs/` directory — the same way `sdd-write-spec` wraps brainstorming to produce the constitution.

## Workflow

### Pre-Step 0: Seed Input Check

Before reading any file, check whether the user provided feature context when invoking the skill:

**Accepted seed formats:**
- Free-form prompt text or bullet-point brief
- A reference to a file (e.g., "plan the feature described in `docs/ideas/search.md`") — read that file
- Conversation context from a prior `agent-skills:interview-me`, brainstorming, or `sdd-write-spec` session
- A reference to a roadmap phase (e.g., "next item on the roadmap", "Phase 3")

**If seed input was provided:**
- Parse it through the 4-field lens: Who, Why, Success, Constraint
- Mark which fields are already answered — these are skipped in subsequent interview steps
- Do not re-ask things already covered by the seed

**If no seed input:**
- Check whether `sdd-specs/roadmap.md` exists
  - **Yes:** Read it, identify the next incomplete phase/milestone, present to user for confirmation
  - **No:** Ask: "What feature are you planning?" (single question) and proceed from the answer

### Step 1: Gather Project Context

Read project context **before** any user questions, so questions are informed by existing constraints.

1. Read `sdd-specs/mission.md` (if it exists) — extract objective, boundaries, constraints
2. Read `sdd-specs/tech-stack.md` (if it exists) — extract project structure, code style, testing strategy
3. Read `sdd-specs/roadmap.md` (if it exists and not already read in Pre-Step 0) — understand where this feature fits in the project timeline

Missing files do not block. Note their absence internally but proceed with whatever context is available.

Build an internal context block that informs all subsequent steps:
```
PROJECT CONTEXT:
- Mission:         [from mission.md or "not specified"]
- Tech stack:      [key technologies from tech-stack.md or "not specified"]
- Current phase:   [from roadmap.md or "not specified"]
- Boundaries:      [from mission.md or "not specified"]
```

### Step 2: Minimum Viable Fields Check

Assess whether enough information exists to plan, or whether a deep interview is needed.

**The five fields:**
1. **Who** — who benefits from this feature? (stakeholder, user persona)
2. **Why** — why build it now? (what prompted this, what problem it solves)
3. **Success** — what does "done" look like? (concrete outcome)
4. **Constraint** — what is the binding limit? (time, scope, compatibility, performance)
5. **Dependencies** — does this feature touch or depend on existing systems? (optional but always probed if context is available)

**Assessment logic:**
- Check seed input (Pre-Step 0) and project context (Step 1) against fields 1–4
- Mark each field as: PRESENT (answered by seed or context) or MISSING
- If all four core fields are PRESENT → skip Step 2b, probe Dependencies (line above) if not already clear from context, then proceed to Step 3
- If any core field is MISSING → proceed to Step 2b (Deep Interview)
- Dependencies: always probe if not already clear from context, even when the four core fields are present. Use a single direct question if project context doesn't answer it: "Does this feature depend on or modify any existing systems, services, or APIs?"

### Step 2b: Deep Interview (conditional)

Invoked only when one or more core fields are missing.

**Skill invoked:** `agent-skills:interview-me`

**Instructions for invocation:**
- Frame questions around what the seed and project context could NOT answer — never re-ask covered ground
- Use the project context block from Step 1 to make informed guesses (attach them to each question per interview-me protocol)

**Stop condition:** interview-me's native stop — can predict the user's reaction to the next three questions, and all four core fields are filled.

**Output:** A confirmed intent restatement:
```
- Outcome:      <one line>
- User:         <one line>
- Why now:      <one line>
- Success:      <one line>
- Constraint:   <one line>
- Out of scope: <one line>
```

Wait for explicit "yes" confirmation before proceeding.

### Step 3: Feature Naming

Establish the feature name for the output directory.

- If inferrable from seed input or interview output, propose it:
  > "I'll name this feature `{proposed-name}` (directory: `sdd-specs/plans/YYYY-MM-DD-{proposed-name}/`). Good?"
- If not inferrable, ask:
  > "What should this feature be called? (used as `sdd-specs/plans/YYYY-MM-DD-{name}/`)"

This is a single question — not an interview. Branch strategy is **not** asked here; it belongs to implementation time and is handled by `sdd-implement-plan` or `agent-skills:git-workflow-and-versioning`.

Create the feature directory `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` immediately after the name is confirmed.

### Step 3.5: Conditional Planning Classification

Identify whether this feature requires specialized planning gates by matching the feature description, intent restatement, and seed files against these keyword groups:

| Classification | Trigger Keywords | Required Planning Action |
|----------------|------------------|--------------------------|
| **Security Sensitive** | `auth`, `password`, `login`, `sign-in`, `payment`, `credit-card`, `crypto`, `PII`, `credentials`, `upload` | Invoke `agent-skills:security-and-hardening` to write a dedicated `## Security Constraints` section in `requirements.md` and security criteria in `validation.md`. |
| **Telemetry Required** | `API`, `endpoint`, `cron`, `background`, `job`, `worker`, `event`, `analytics`, `log`, `metric`, `network` | Invoke `agent-skills:observability-and-instrumentation` to write a dedicated `## Telemetry & Observability` section in `requirements.md` detailing logging specs, metrics tracking, and error alerting rules. |
| **Migration Risk** | `refactor`, `rewrite`, `replace`, `deprecated`, `remove`, `delete`, `rename`, `schema`, `database migration` | Invoke `agent-skills:deprecation-and-migration` to write a dedicated `## Migration & Deprecation Plan` in `requirements.md` and inject corresponding tasks in `plan.md`. |

If no keywords match a group, omit the corresponding planning action and section to keep the output minimal and avoid planning bloat.

### Step 4: Run Planning-and-Task-Breakdown, Then Format plan.md

Trigger `agent-skills:planning-and-task-breakdown` with:
- Confirmed feature description (from intent restatement or seed input)
- Project context from Step 1 (mission, tech stack, roadmap phase)
- Constraints and out-of-scope from Steps 2/2b
- Any referenced files read during Pre-Step 0

**User confirmation gate:** Do not proceed until the task order, sizing, and checkpoints are confirmed by the user.

After user confirms the breakdown, format the output directly into `plan.md` using the template in the **File Templates** section below. Format output directly into plan.md with no intermediate files of any kind — write to `sdd-specs/plans/YYYY-MM-DD-{feature-name}/plan.md` directly.

**Key formatting rules:**
- Each task gets a lightweight `Interfaces` line — declare what the task produces (function name + type) and what it consumes from prior tasks. This is NOT pre-written code; it is a contract declaration so subagent implementers know what signatures to implement and what is available from earlier slices. Full signatures are required for both produced and consumed functions — prose descriptions ("produces email sending functionality") are not acceptable; if you cannot name a function signature, the task decomposition is not done yet.
- **Typing constraints**: Every interface contract MUST specify fully typed inputs and outputs. The use of `any`, `unknown`, or generic `Record<string, any>` is strictly forbidden unless there is no technical alternative. If returning or accepting a complex structure, define its key properties inline (e.g., `{id: string, name: string}`) rather than using a loose dictionary escape.
- Each phase ends with a `### Checkpoint — Phase N` block with a checkbox. `sdd-implement-plan` runs this verification before advancing to the next phase.
- No code blocks, no TDD steps, no bash commands — those are `sdd-implement-plan`'s responsibility at execution time.

**ADR trigger:** When decomposition surfaces a significant architectural or technology choice (framework selection, data model, auth strategy, API architecture, or any decision expensive to reverse):
- Invoke `agent-skills:documentation-and-adrs`
- **Save location:** `sdd-docs/decisions/ADR-{NNN}-{title}.md` — sequential numbering; check existing files to determine next number. ADRs are project-level artifacts and are **not** saved inside the feature directory.
- **Cross-reference:** Add the ADR path to `requirements.md` under the Decisions section

Apply the ADR trigger only to choices where the rationale and rejected alternatives have future value — not to every decision.

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

### Step 6: Output

Generate the three files:

```
sdd-specs/plans/
└── YYYY-MM-DD-{feature-name}/
    ├── plan.md          → Phase-structured task list with interface contracts and checkpoint blocks
    ├── requirements.md  → Scope, decisions, context, out-of-scope
    └── validation.md    → How to know implementation succeeded and can be merged
```

## File Templates

Read the templates located in the `templates/` directory to format the generated planning files:
- **plan.md**: [templates/plan.md](templates/plan.md) — Phase-structured implementation plan containing checkboxes for acceptance criteria and checkpoints.
- **requirements.md**: [templates/requirements.md](templates/requirements.md) — Scope, decisions, context, and conditional constraints.
- **validation.md**: [templates/validation.md](templates/validation.md) — Acceptance criteria checklist, test coverage requirements, and definition of done.

## Implementation

When you invoke `/sdd-plan-feature`:

1. Check for seed input (prompt text, file reference, conversation context, roadmap phase reference) — parse through Who/Why/Success/Constraint lens and mark what is already answered
2. If no seed: check for `sdd-specs/roadmap.md` → present next incomplete phase; if no roadmap: ask "what feature?"
3. Read `sdd-specs/mission.md`, `sdd-specs/tech-stack.md`, `sdd-specs/roadmap.md` for project context (missing files don't block)
4. Assess minimum viable fields (Who/Why/Success/Constraint) — if all present, skip to item 6 (probe Dependencies), then proceed to Step 3 (feature naming)
5. If any core field is missing: invoke `agent-skills:interview-me` — one question at a time, informed by project context; require explicit "yes" before continuing
6. Probe Dependencies if not already clear from context
7. Confirm feature name (propose if inferrable; otherwise ask a single question) — create `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` directory immediately after confirmation
7.5. Run Conditional Planning Classification (Step 3.5) — check keywords for Security, Telemetry, and Migration risk. Prepare corresponding requirements/validation/plan additions.
8. Trigger `agent-skills:planning-and-task-breakdown` — dependency graph, vertical slices, task sizing, checkpoints
9. If a significant architectural decision surfaces: invoke `agent-skills:documentation-and-adrs` → save to `sdd-docs/decisions/ADR-{NNN}-{title}.md`; cross-reference in requirements.md
10. Confirm task order and sizing with user before continuing — then format output directly into `plan.md` using the templates (no breakdown.md intermediate file)
11. Present pre-write summary of all three files — ask focused probe; resolve concerns before writing
12. Write plan.md, requirements.md, and validation.md to `sdd-specs/plans/YYYY-MM-DD-{feature-name}/`

## Key Points

- Minimum viable fields check (Who/Why/Success/Constraint + Dependencies) gates interview-me — only invoke the deep interview when fields are genuinely missing
- Single-pass planning: planning-and-task-breakdown output is formatted directly into plan.md — no intermediate files of any kind, no writing-plans pass
- Plans contain interface contracts (function name + type per task), not code — TDD execution is sdd-implement-plan's job at implementation time. If you cannot name a function signature for a task, decompose that task further: inspect existing code for caller conventions, ask the user what the consuming task expects, or stub a name and type from the task description
- Phase sections with checkpoint blocks enable phase-level verification gates during implementation
- ADRs are project-level artifacts saved to `sdd-docs/decisions/` with sequential numbering — not in the feature directory
- Pre-write review probes for gaps with a structured summary and a focused probe question before committing files to disk
- requirements.md makes out-of-scope explicit, not just in-scope
- requirements.md contains conditional sections (Security, Telemetry, Migrations) which are omitted by default unless triggered by keyword classification to avoid planning bloat
- validation.md defines "done" before implementation starts — not after
