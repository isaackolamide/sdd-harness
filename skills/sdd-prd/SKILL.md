---
name: sdd-prd
description: Use when starting the discovery phase for a new feature or product idea, before creating any feature specifications, design docs, or plans.
metadata:
  type: planning
  composesWith: [superpowers:brainstorming, agent-skills:interview-me]
---

# Product Requirements Document (PRD) Generator

Generate a comprehensive Product Requirements Document (`sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md`) from a rough idea by running a discovery interview.

**REQUIRED SUB-SKILL:** Use `agent-skills:interview-me` to run the interactive discovery interview.
**REQUIRED SUB-SKILL:** Use `superpowers:brainstorming` to propose product approaches.

## Workflow

### Step 1: Parse Seed and Formulate Hypothesis

1. **Read Seed**: Read any provided seed requirements.
2. **Formulate Hypothesis**: Formulate an initial hypothesis of the underlying user intent along with a confidence score (0–100%).
   - **If confidence is < 70%**: State the score and append a brief, one-line explanation of what foundational context is missing.
   - **If no seed requirements exist**: State `Confidence: 0%` and ask: *"What product or feature idea are we building?"*

```
HYPOTHESIS: You want to build a real-time status checker for API services to reduce manual testing efforts during service outages.
CONFIDENCE: 45% (missing: target users, how alerts should be delivered, and binding performance constraints)
```

### Step 2: Interactive Discovery Interview

1. **Interactive Loop**: Unconditionally invoke `agent-skills:interview-me` to run the interview. Ask exactly **one question at a time**, attaching your own guess/hypothesis with reasoning. Wait for the user to respond before asking the next question.
2. **Required Interview Topics**:
   - **Target Users**: Who benefits, and what are their pain points?
   - **Prioritization**: Which capabilities are critical for the initial version vs. nice-to-haves?
   - **Behavior & Flow**: What are the core user interactions/journeys?
   - **Constraints & Non-Goals**: What is explicitly out of scope?
   - **Technical / Non-Functional Requirements**: Scalability, performance targets, refresh frequencies, security limits.
   - **Success Metrics**: How will we know if this feature succeeded?

```
Q: Who are the target users for these API status checks?
GUESS: Developers and QA engineers, because they need immediate indicators when downstream dependencies fail so they can pause their tests or deployment pipelines.
```

3. **Interview Loop Constraints**:
   - **Never batch questions**: Ask only one question per message.
   - **Always attach a guess**: Commits you to a hypothesis and helps the user react faster.
   - **Probe convention talk**: If the user uses vague buzzwords (e.g. "scalable", "clean", "modern"), probe with: *"If you didn't have to justify this to anyone, what would you actually want?"*

### Step 3: Propose Approaches & Trade-offs

1. **Propose Approaches**: Once you understand the features, invoke `superpowers:brainstorming` to propose **2-3 product approaches** or architectures with explicit trade-offs and your recommended path.

*Example:*
- **Approach A (Polled UI)**: Client-side polling of status endpoints. Simple, lightweight, but adds server overhead.
- **Approach B (Push/WebSocket UI)**: Real-time socket updates. Extremely responsive, low latency, but increases infrastructure complexity.
- **Recommendation**: Approach A for the MVP because status changes occur infrequently and polling is cheaper to build.

### Step 4: Intent Restatement Gate

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

### Step 5: Generate PRD

1. **Create File**: Create `sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md` using the template located at `templates/prd.md`.
2. **Figma URL (conditional)**: If a `figma.com` URL was present in the seed input, record it verbatim under `## UI Design Reference` in the generated PRD. Do not paraphrase or describe the design — the URL is the reference.

### Step 6: Handoff to Specification

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
