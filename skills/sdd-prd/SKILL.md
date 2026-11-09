---
name: sdd-prd
description: Use when starting the discovery phase for a new feature or product idea, before creating any feature specifications, design docs, or plans.
metadata:
  type: planning
  composesWith: [agent-skills:interview-me]
---

# Product Requirements Document (PRD) Generator

Generate a comprehensive Product Requirements Document (`sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md`) from a rough idea by running a discovery interview.

**REQUIRED SUB-SKILL:** Use `agent-skills:interview-me` to run the interactive discovery interview.

## Workflow

### Step 1: Parse Seed and Formulate Hypothesis

1. **Read Seed**: Read any provided seed requirements. If the seed is a task file (`sdd-specs/tasks/*.md` from `sdd-harness:sdd-task`), treat its Context, Expected Implementation, Out of Scope, and Acceptance Criteria as background for your hypothesis — a task file raises your starting confidence, it does not shorten the interview in Step 2. Its Open Questions/Assumptions are unresolved gaps, not answers — surface them as real interview questions rather than treating the stated assumption as settled.
2. **Formulate Hypothesis**: Formulate an initial hypothesis of the underlying user intent along with a confidence score (0–100%).
   - **If confidence is < 70%**: State the score and append a brief, one-line explanation of what foundational context is missing.
   - **If no seed requirements exist**: State `Confidence: 0%` and ask: *"What product or feature idea are we building?"*

```
HYPOTHESIS: You want to build a real-time status checker for API services to reduce manual testing efforts during service outages.
CONFIDENCE: 45% (missing: target users, how alerts should be delivered, and binding performance constraints)
```

### Step 2: Interactive Discovery Interview

1. **Interactive Loop**: Unconditionally invoke `agent-skills:interview-me` to run the interview — even when a task file already answers a topic well. Ask exactly **one question at a time**, attaching your own guess/hypothesis with reasoning (drawn from the task file when one exists). Wait for the user to respond before asking the next question.
2. **Required Interview Topics**:
   - **Target Users**: Who benefits, and what are their pain points?
   - **Why Now**: What triggered this need now?
   - **Prioritization**: Which capabilities are critical for the initial version vs. nice-to-haves?
   - **Behavior & Flow**: What are the core user interactions/journeys?
   - **Constraints & Non-Goals**: What is explicitly out of scope?
   - **Technical / Non-Functional Requirements**: Scalability, performance targets, refresh frequencies, security limits.
   - **Success Metrics**: How will we know if this feature succeeded?
   - **Error & Boundary Behavior**: What should happen when an action fails, and at the edges (empty, maximum, timeout, unavailable)? Cover at least two of each.

```
Q: Who are the target users for these API status checks?
GUESS: Developers and QA engineers, because they need immediate indicators when downstream dependencies fail so they can pause their tests or deployment pipelines.
```

3. **Exit Condition**: Stop interviewing when every Required Interview Topic has an answer and your confidence in the intent is at least 90%. Then go to Step 3.
4. **Interview Loop Constraints**:
   - **Never batch questions**: Ask only one question per message.
   - **Always attach a guess**: Commits you to a hypothesis and helps the user react faster.
   - **Settle product shape by asking**: If the answers so far leave two plausible product shapes, ask which one the user wants as the next question, with your guess attached. Leave implementation design (*how*) to `sdd-write-spec`.
   - **Probe convention talk**: If the user uses vague buzzwords (e.g. "scalable", "clean", "modern"), probe with: *"If you didn't have to justify this to anyone, what would you actually want?"*

### Step 3: Intent Restatement Gate

1. **Present Summary**: Before writing the PRD, present a structured restatement of the intent and wait for an explicit confirmation:

```
Outcome:       [One sentence describing the core outcome]
User:          [Who benefits and why]
Why now:       [What triggered this need]
Success:       [Observable metric for success]
Constraint:    [Binding limit or constraint]
Out of scope:  [What we are explicitly NOT doing]

Please reply with "yes" or "looks good" to confirm, or suggest refinements.
```

2. **Wait for Confirmation**: **The Gate is Hard**: You must receive an unambiguous "yes" or "looks good" before creating files.

### Step 4: Generate PRD

1. **Create File**: Create `sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md` using the template located at `templates/prd.md`.
2. **Task Reference**: If a task file seeded this PRD, populate the `**Task Reference:**` line with its path. Otherwise write `None`.
3. **Acceptance Criteria**: Draft the Acceptance Criteria section fresh — Given/When/Then, at least two scenarios each for Happy Path, Error Path, and Boundary. If a task file seeded this PRD, use its Acceptance Criteria as your starting basis, but revise freely based on everything Steps 2–3 surfaced — don't preserve a scenario just because the task file had it, and don't feel bound to its exact wording. Every category is covered by the Step 2 interview, so do not interview again after the gate.
4. **Handoff Notes**: Fill all four slots of `Handoff Notes for Spec` from the Step 2 interview. Record each *how*-preference the user volunteered under Implementation hints, and each unanswered question under Open questions. Keep these out of Constraints and Must Have unless the user said "must" or "can't" about them. Write `None` for a slot with nothing to record.

### Step 5: Handoff to Specification

1. **Handoff Command**: Provide the exact command to transition the generated PRD into the feature spec generation phase:

```
PRD generated at sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md.
Next Step: Run `/sdd-write-spec sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md` to translate this PRD into a feature spec.
```

---

## PRD Template

Refer to the template located at [templates/prd.md](templates/prd.md) to format the generated PRD file.

---

## Common Rationalizations & Red Flags

| Excuse / Red Flag | Reality |
|---|---|
| "Skipping confirmation gate because user is in a hurry" | An unconfirmed PRD leads to rebuilding. The confirmation gate is non-negotiable. |
| Asking multiple questions at once | Overwhelms the user and leads to generic or skimmed answers. Ask exactly one question at a time. |
| Missing "Out of scope" / "Won't Have" | Silent disagreement about scope is the main cause of project bloat. Specify it explicitly. |
| Generating the Feature Spec or Plan directly | `sdd-prd` only produces a PRD. Do not skip to code or specs before the product requirements are frozen. |
| "Task file already answers this, skip that interview topic" | A task file raises your confidence in a hypothesis; it never replaces a Required Interview Topic. Ask all of them. |
