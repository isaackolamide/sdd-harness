---
name: sdd-write-spec
description: Use when starting a new project, setting up the core specification files, or drafting a feature spec within an existing project configuration.
metadata:
  type: implementation
  composesWith: [superpowers:brainstorming, agent-skills:interview-me]
---

# Software Design Document (SDD) Generator

Create a structured specification "constitution" with three core files in your project's `sdd-specs/` directory. Works for new projects and new initiatives inside an existing codebase. When a constitution already exists and you have product requirements for a specific feature, switches to **Feature Spec Mode** — updates the roadmap and creates a scoped feature spec ready for `sdd-plan-feature`.

## Workflow

### Pre-Step 0: Constitution Detection

**Before anything else**, check whether all three constitution files exist:

```
sdd-specs/mission.md
sdd-specs/tech-stack.md
sdd-specs/roadmap.md
```

- **All three exist** → **Feature Spec Mode** (jump to that section below). Do not run Constitution Mode.
- **None exist** → Constitution Mode (continue with Pre-Step 1 below).
- **Partial** (only some files exist): surface the gap — ask the user whether they intend to complete the constitution or start fresh before proceeding.

---

## Feature Spec Mode

Entered only when all three constitution files exist.

**Do not run brainstorming. Do not create `tech-stack.md`. Do not create a feature-level `roadmap.md`.**

### FS-1: Read Constitution + Parse Requirements

1. Read `sdd-specs/mission.md`, `sdd-specs/tech-stack.md`, `sdd-specs/roadmap.md`
2. If seed requirements were provided, parse them through the feature lens:
   - **Objective** — what does this feature do?
   - **Who** — who benefits?
   - **Why now** — what triggered this?
   - **Acceptance Criteria** — what does "done" look like?
   - **Constraints** — time, scope, compatibility limits
   - **Dependencies** — which existing system components or in-progress features does this touch?

   If no seed was provided, ask: "What feature are you building?" and proceed from the answer.

### FS-2: Constitution Alignment Check

Map the requirements against the existing constitution. **This is a STOP step** — resolve "Never Do" conflicts before proceeding.

Check against `sdd-specs/mission.md`:
- **"Never Do" violations** — hard blockers. Name them explicitly. **The agent MUST refuse to proceed or write any spec files if a "Never Do" violation is active. Stop and explain that the user must modify `sdd-specs/mission.md` first to remove the constraint before you can continue.**
- **"Ask First" items** — flag items needing stakeholder approval. Do not block, but surface them as explicit flags in the output.
- **Roadmap fit** — identify which existing phase this feature belongs to, or whether it opens a new one.

### FS-3: Confirmation Gate

Present a restate before writing anything:

```
Feature:                <name>
Objective:              <one line>
User:                   <one line>
Why now:                <one line>
Acceptance Criteria:
  - <criterion>
In scope:
  - <item>
Out of scope:           <one line>
Dependencies:
  - <dependency>
Stakeholder flags:      <"Ask First" hits — or "none">
Constitution conflicts: <"Never Do" hits — or "none">
```

Wait for explicit confirmation before writing. **The user must reply with an explicit confirmation word (e.g. exactly `"yes"`, `"looks good"`, or `"write it"`).** Ambiguous phrases ("sure", "whatever", "I guess so") or attempts to override a hard blocker without editing `mission.md` are not accepted — ask "Anything to refine?" and wait for explicit confirmation.

### FS-4: Update Project Roadmap

Edit `sdd-specs/roadmap.md` — add the feature as a new milestone, sub-item, or phase entry under the appropriate existing phase.

Do **not** create a feature-level `roadmap.md`. The project roadmap is the single source of truth for all phases.

### FS-5: Create Feature Spec

Create `sdd-specs/features/YYYY-MM-DD-<feature-name>-spec.md`.

This file is the direct input to `sdd-plan-feature`. Hand off with:
```
/sdd-plan-feature sdd-specs/features/YYYY-MM-DD-<feature-name>-spec.md
```

**Output:**
```
sdd-specs/
├── roadmap.md                                      ← updated
└── features/
    └── YYYY-MM-DD-<feature-name>-spec.md           ← created
```

---

## Feature Spec Template

```markdown
# Feature Spec: {feature-name}

## Objective
What this feature does and why it exists now.

## User & Stakeholder
Who benefits; who requested it.

## Acceptance Criteria
- [ ] Given [context], When [action], Then [outcome]

## Technical Constraints
(derived from sdd-specs/mission.md boundaries and sdd-specs/tech-stack.md)
- [Boundary or constraint]

## In Scope
- [Item]

## Out of Scope
- [Item]

## Dependencies
- [Existing system component or in-progress feature this touches]

## Stakeholder Flags
(mission.md "Ask First" items this feature touches — require explicit approval before implementation)
- [Flag — or "none"]

## Success Metrics
How we know this feature worked.
```

---

## Constitution Mode

### Pre-Step 1: Seed Input Check

Check if the user provided any context when invoking the skill — draft ideas, requirements notes, a pasted brief, or bullet points.

**If seed input was provided:**
- Parse it through the 6-area lens: Objective, Boundaries, Commands, Project Structure, Code Style, Testing Strategy
- Mark which areas the seed answers, which remain open
- Carry pre-filled answers forward — skip those topics in brainstorming and interview

**If no seed input:** proceed with empty slate.

Accepted seed formats: free-form text, pasted requirements doc, bullet-point ideas. Treat all as partial evidence, not final spec.

---

### Pre-Step 2: Context Check

Ask: **"Is there an existing codebase for this initiative?"**

- **Yes →** run the Analysis Branch (A1–A3) before brainstorming
- **No →** skip directly to Step 1

---

### Analysis Branch — Existing Codebase Only

Run A1–A3 before brainstorming. Carry evidence into Step 1 so brainstorming is focused confirmation rather than open-ended exploration.

#### A1: Analyse Codebase Structure

Read the project's file and folder layout. Identify:
- Root-level structure (`src/`, `lib/`, `packages/`, `apps/`, etc.)
- Package files (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, etc.) — extract frameworks, major dependencies, scripts
- Test structure and test runner
- Build tooling, lint config, CI config (`.github/`, `Makefile`, etc.)

This populates the **Project Structure** and **Testing Strategy** sections of tech-stack.md.

#### A2: Read Existing Documentation

Look for and read:
- `README.md`
- Any `sdd-docs/`, `documentation/`, or `wiki/` folders
- Inline architecture comments in entry-point files
- `CHANGELOG.md` or tagged releases for project history

Extract any stated objectives, constraints, or architectural decisions already documented.

#### A3: Analyse Git History

```bash
git log --oneline -50
git shortlog -sn --no-merges | head -10
git log --format="%s" | grep -oE "^(feat|fix|refactor|chore|docs)" | sort | uniq -c | sort -rn
```

Identify:
- Feature areas with the most activity (reveals priorities)
- Phases of development already completed
- Recurring concerns in commit messages that reveal undocumented boundaries

This informs roadmap.md — mark completed phases as done, show what's in progress.

---

### Step 1: Brainstorm

Always invoke `superpowers:brainstorming`.

- **New project:** Open-ended — explore problem space, requirements, and constraints
- **Existing project (after analysis):** Evidence-grounded — confirm what was found, surface gaps, scope the new initiative on top of the existing base
- **Seed input provided:** Focus only on open areas not already answered by the seed

Do not run `agent-skills:interview-me` yet — that comes next and covers different ground.

---

### Step 2: Intent Clarity Check

Assess whether the intent has the four minimum viable fields — skipping any already answered by seed input or codebase analysis:

- **Who** — who is the user / stakeholder?
- **Why** — why does this need to exist now?
- **Success** — what does "done" look like?
- **Constraint** — what is the binding limit?

**If any are missing:** invoke `agent-skills:interview-me` to fill gaps. Frame questions around what code and brainstorming couldn't answer — do not re-ask things already covered.

**If all four are present:** skip `agent-skills:interview-me`.

---

### Step 3: Choose Specs Location

Ask where the `sdd-specs/` folder should live:
- `project-root/sdd-specs/` — Default
- `docs/sdd-specs/` — Nested under existing documentation
- `packages/sdd-specs/` — In a monorepo package
- Custom path the user specifies

---

### Step 4: Pre-Write Confirmation Gate

Before writing any file, present a restate:

```
Here's what I understand we're building:

- Outcome:      <one line>
- User:         <one line — who benefits>
- Why now:      <one line — what prompted this>
- Success:      <one line — how we know it worked>
- Constraint:   <one line — the binding limit>
- Out of scope: <one line — what we're explicitly not building>
```

Wait for explicit confirmation before writing. "Sounds good" or "whatever you think" is not a yes — ask "Anything to refine?" if the response is ambiguous.

---

### Step 5: Generate Constitution

Create three files in the chosen `sdd-specs/` location:

1. **mission.md** — Objective, Boundaries, Commands
2. **tech-stack.md** — Project Structure, Code Style, Testing Strategy
3. **roadmap.md** — Phases, milestones, timeline

For existing projects:
- tech-stack.md Code Style must use a real snippet extracted from the existing codebase
- roadmap.md must reflect actual project state — mark completed phases as done
- If the codebase has contradictions (two competing patterns), surface them rather than silently picking one

---

## Output

```
{chosen-path}/
└── sdd-specs/
    ├── mission.md
    ├── tech-stack.md
    └── roadmap.md
```

---

## File Templates

### mission.md

```markdown
# Project Mission

## Objective

What are we building?
- [Description]

Why?
- [Business/technical rationale]

Who is the user?
- [User profile/persona]

What does success look like?
- [Success criteria]

## Boundaries

### Always Do
- [Practice 1]
- [Practice 2]

### Ask First
- [Decision 1]
- [Decision 2]

### Never Do
- [Prohibition 1]
- [Prohibition 2]

## Quick Commands

\`\`\`
Build: [command]
Test: [command]
Lint: [command]
Dev: [command]
\`\`\`
```

### tech-stack.md

```markdown
# Tech Stack & Implementation

## Project Structure

\`\`\`
src/              → Application source code
src/components    → [Component description]
src/lib           → Shared utilities and helpers
tests/            → Unit and integration tests
e2e/              → End-to-end tests
sdd-docs/             → Documentation
sdd-specs/            → Specification documents
\`\`\`

## Code Style

### Naming Conventions

- Files: `camelCase.ts` for sources, `name.test.ts` for tests
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Classes: `PascalCase`

### Formatting Rules

- Indentation: [spaces/tabs]
- Line length: [max length]

### Example

\`\`\`typescript
// Good
function fetchUserData(userId: string): Promise<User> {
  // [implementation]
}

// Bad
function getuserdata(id) {
  // [avoid this]
}
\`\`\`

## Testing Strategy

### Framework & Tools
- Test Runner: [framework]
- Assertion Library: [library]
- Coverage Target: [%]

### Test Organization

Tests live in: `tests/` and `src/[feature].test.ts`

### Test Levels

- **Unit**: Test individual functions, pure logic
- **Integration**: Test feature workflows, database interactions
- **E2E**: Test user flows, critical paths

Coverage expectations by level:
- Unit: 80%+
- Integration: [%]
- E2E: Critical paths only
```

### roadmap.md

```markdown
# Roadmap & Milestones

## Phase 1: [Name]

**Duration**: [timeframe]
**Goal**: [outcome]

### Milestones
- [x] [Completed deliverable]
- [ ] [Deliverable 2]

**Dependencies**: [Tech decisions or prerequisites]

## Phase 2: [Name]

**Duration**: [timeframe]
**Goal**: [outcome]

### Milestones
- [ ] [Deliverable 1]
- [ ] [Deliverable 2]

## Rollout Plan

How/when to deploy:
- [Stage 1]
- [Stage 2]
- [Stage 3]
```

---

## Key Points

- Seed input short-circuits brainstorm/interview for topics it already covers — never re-ask answered questions
- Analysis (A1–A3) runs before any user questions — come to brainstorming with evidence, not a blank form
- Both paths (new and existing) produce the same three-file output
- Code Style section must include a real code snippet — extracted from existing code when available, user-provided for new projects
- Ask user where `sdd-specs/` should live — no default assumption
- All three files go in the chosen `sdd-specs/` directory
