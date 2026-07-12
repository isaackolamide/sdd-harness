---
name: sdd-prd
description: Use when starting the discovery phase for a new feature or product idea, before creating any feature specifications, design docs, or plans.
metadata:
  type: implementation
  composesWith: [superpowers:brainstorming, agent-skills:interview-me, agent-skills:api-and-interface-design]
---

# Product Requirements Document (PRD) Generator

Generate a comprehensive Product Requirements Document (`sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md`) from a rough idea by running a discovery interview.

---

## Workflow

### Step 1: Parse Seed and Formulate Hypothesis

Read any provided seed requirements. Formulate an initial hypothesis of the underlying user intent along with a confidence score (0–100%).

* **If confidence is < 70%**: State the score and append a brief, one-line explanation of what foundational context is missing.
* **If no seed requirements exist**: State `Confidence: 0%` and ask: *"What product or feature idea are we building?"*

```
HYPOTHESIS: You want to build a real-time status checker for API services to reduce manual testing efforts during service outages.
CONFIDENCE: 45% (missing: target users, how alerts should be delivered, and binding performance constraints)
```

### Step 2: Interactive Discovery Interview

Ask exactly **one question at a time**, attaching your own guess/hypothesis with reasoning. Wait for the user to respond before asking the next question.

**Required Interview Topics:**
1. **Target Users**: Who benefits, and what are their pain points?
2. **Prioritization**: Which capabilities are critical for the initial version vs. nice-to-haves?
3. **Behavior & Flow**: What are the core user interactions/journeys?
4. **Constraints & Non-Goals**: What is explicitly out of scope?
5. **Technical / Non-Functional Requirements**: Scalability, performance targets, refresh frequencies, security limits.
6. **Success Metrics**: How will we know if this feature succeeded?

```
Q: Who are the target users for these API status checks?
GUESS: Developers and QA engineers, because they need immediate indicators when downstream dependencies fail so they can pause their tests or deployment pipelines.
```

**Interview Loop Constraints:**
- **Never batch questions**: Ask only one question per message.
- **Always attach a guess**: Commits you to a hypothesis and helps the user react faster.
- **Probe convention talk**: If the user uses vague buzzwords (e.g. "scalable", "clean", "modern"), probe with: *"If you didn't have to justify this to anyone, what would you actually want?"*

### Step 3: Propose Approaches & Trade-offs

Once you understand the features, propose **2-3 product approaches** or architectures with explicit trade-offs and your recommended path.

*Example:*
- **Approach A (Polled UI)**: Client-side polling of status endpoints. Simple, lightweight, but adds server overhead.
- **Approach B (Push/WebSocket UI)**: Real-time socket updates. Extremely responsive, low latency, but increases infrastructure complexity.
- **Recommendation**: Approach A for the MVP because status changes occur infrequently and polling is cheaper to build.

### Step 4: Intent Restatement Gate

Before writing the PRD, present a structured restatement of the intent and wait for an explicit confirmation:

```
Outcome:       [One sentence describing the core outcome]
User:          [Who benefits and why]
Why now:       [What triggered this need]
Success:       [Observable metric for success]
Constraint:    [Binding limit or constraint]
Out of scope:  [What we are explicitly NOT doing]

Please reply with "yes" or "looks good" to confirm, or suggest refinements.
```

**The Gate is Hard**: You must receive an unambiguous "yes" or "looks good" before creating files.

### Step 5: Generate PRD

Create `sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md` using the template below.

**Figma URL (conditional):** If a `figma.com` URL was present in the seed input, record it verbatim under `## UI Design Reference` in the generated PRD. Do not paraphrase or describe the design — the URL is the reference.

### Step 6: Handoff to Specification

Provide the exact command to transition the generated PRD into the feature spec generation phase:

```
PRD generated at sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md.
Next Step: Run `/sdd-write-spec sdd-specs/prds/YYYY-MM-DD-<feature-name>-prd.md` to translate this PRD into a feature spec.
```

---

## PRD Template

```markdown
# Product Requirement Document: {feature-name}

## Objective & Goal
* **Problem**: What pain point does this solve?
* **Objective**: What is being built and why now?

## User Personas
* Who are the primary users and what is their motivation?

## Core User Journeys
1. **[Journey Name]**:
   - Given [context], When [action], Then [outcome]

## Prioritized Requirements (MoSCoW)
* **Must Have** (Required for MVP):
  - [Requirement]
* **Should Have** (High value, can defer if tight timeline):
  - [Requirement]
* **Could Have** (Nice-to-have, low priority):
  - [Requirement]
* **Won't Have** (Out of scope for this release):
  - [Requirement]

## Technical & Non-Functional Constraints
* Performance / Reliability expectations (e.g. latency, updates frequency).
* Security, privacy, or compatibility constraints.

## Out of Scope (Non-Goals)
* [Explicit item or system boundary not touched]

## Risks & Dependencies
* **Dependencies**: Third-party services, APIs, databases.
* **Risks**: Potential integration, scale, or adoption issues.

## Success Metrics
* How we measure the feature's business or user value.

## UI Design Reference
<!-- figma.com URL — or omit section if none -->
```

---

## Common Rationalizations & Red Flags

| Excuse / Red Flag | Reality |
|---|---|
| "Skipping confirmation gate because user is in a hurry" | An unconfirmed PRD leads to rebuilding. The confirmation gate is non-negotiable. |
| Asking multiple questions at once | Overwhelms the user and leads to generic or skimmed answers. Ask exactly one question at a time. |
| Missing "Out of scope" / "Won't Have" | Silent disagreement about scope is the main cause of project bloat. Specify it explicitly. |
| Generating the Feature Spec or Plan directly | `sdd-prd` only produces a PRD. Do not skip to code or specs before the product requirements are frozen. |
