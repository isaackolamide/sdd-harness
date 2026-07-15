---
name: sdd-constitution
description: Use when starting a new project, setting up the core specification files (constitution) for an active SDD project, or analyzing an existing codebase to initialize constitution files.
metadata:
  type: planning
  composesWith: [superpowers:brainstorming, agent-skills:interview-me]
---

# Spec-Driven Development (SDD) Constitution Generator

Create a structured specification "constitution" with three core files in your project's `sdd-specs/` directory: `mission.md`, `tech-stack.md`, and `roadmap.md`. Works for new projects and new initiatives inside an existing codebase.

**REQUIRED SUB-SKILL:** Use `superpowers:brainstorming` to explore the problem space.
**REQUIRED SUB-SKILL:** Use `agent-skills:interview-me` to clarify missing intent fields.

## Workflow

### Step 1: Existing Constitution Check

1. **Check Files**: **Before anything else**, check whether all three constitution files exist:

```
sdd-specs/mission.md
sdd-specs/tech-stack.md
sdd-specs/roadmap.md
```

2. **Evaluate State**:
   - **All three exist** → The constitution is already complete. Inform the user and instruct them to run `/sdd-write-spec` to specify new features, or `/sdd-plan-feature` if they already have a feature spec.
   - **Partial** (only some files exist) → Surface the gap: list which files exist and which are missing, then ask the user whether they intend to complete the constitution or start fresh before proceeding.
   - **None exist** → Proceed to Step 2.

---

### Step 2: Seed Input Check

1. **Check Input**: Check if the user provided any context when invoking the skill — draft ideas, requirements notes, a pasted brief, or bullet points.
2. **Process Provided Seed**: **If seed input was provided:**
   - Parse it through the 6-area lens: Objective, Boundaries, Commands, Project Structure, Code Style, Testing Strategy.
   - Mark which areas the seed answers, which remain open.
   - Carry pre-filled answers forward — skip those topics in brainstorming and interview.
3. **Process Empty Slate**: **If no seed input:** proceed with empty slate.
4. **Format Tolerance**: Accepted seed formats: free-form text, pasted requirements doc, bullet-point ideas. Treat all as partial evidence, not final spec.

---

### Step 3: Context Check

1. **Ask User**: Ask: **"Is there an existing codebase for this initiative?"**
2. **Branch**:
   - **Yes →** run the Analysis Branch (A1–A3) before brainstorming.
   - **No →** skip directly to Step 4.

---

### Analysis Branch — Existing Codebase Only

1. **Run Analysis**: Run A1–A3 before brainstorming. Carry evidence into Step 4 so brainstorming is focused confirmation rather than open-ended exploration.

#### A1: Analyse Codebase Structure

1. **Read Layout**: Read the project's file and folder layout. Identify:
   - Root-level structure (`src/`, `lib/`, `packages/`, `apps/`, etc.)
   - Package files (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, etc.) — extract frameworks, major dependencies, scripts
   - Test structure and test runner
   - Mocking structures: identify if the codebase contains test builders or factories (e.g. `*Builder.ts` or `*Factory.ts`) and check for TDD configuration files
   - Build tooling, lint config, CI config (`.github/`, `Makefile`, etc.)
2. **Map to Specs**: This populates the **Project Structure** and **Testing Strategy** sections of tech-stack.md.

#### A2: Read Existing Documentation

1. **Search Docs**: Look for and read:
   - `README.md`
   - Any `sdd-specs/docs/`, `documentation/`, or `wiki/` folders
   - Inline architecture comments in entry-point files
   - `CHANGELOG.md` or tagged releases for project history
2. **Extract**: Extract any stated objectives, constraints, or architectural decisions already documented.

#### A3: Analyse Git History

1. **Run Git Commands**:
```bash
git log --oneline -50
git shortlog -sn --no-merges | head -10
git log --format="%s" | grep -oE "^(feat|fix|refactor|chore|docs)" | sort | uniq -c | sort -rn
```
2. **Identify Trends**: Identify:
   - Feature areas with the most activity (reveals priorities)
   - Phases of development already completed
   - Recurring concerns in commit messages that reveal undocumented boundaries
3. **Map to Roadmap**: This informs roadmap.md — mark completed phases as done, show what's in progress.

---

### Step 4: Brainstorm

1. **Invoke Sub-Skill**: Unconditionally invoke `superpowers:brainstorming`.

> [!IMPORTANT]
> When executing the brainstorming step, do NOT save a design doc to `docs/superpowers/specs/` or create that folder, and do NOT invoke `writing-plans`. The brainstorming here is purely conversational to align on requirements and context. The actual constitution files are written in Step 8 to the chosen `sdd-specs/` location.

2. **Branching Context**:
   - **New project:** Open-ended — explore problem space, requirements, boundaries (including TDD and mock boundary practices), and constraints
   - **Existing project (after analysis):** Evidence-grounded — confirm what was found, surface gaps, align on testing/mocking expectations (e.g. which layers use Mock Builders), scope the new initiative on top of the existing base
   - **Seed input provided:** Focus only on open areas not already answered by the seed

3. **Defer Interview**: Do not invoke `agent-skills:interview-me` yet — that comes next and covers different ground.

---

### Step 5: Intent Clarity Check

1. **Assess Completeness**: Assess whether the intent has the four minimum viable fields — skipping any already answered by seed input or codebase analysis:
   - **Who** — who is the user / stakeholder?
   - **Why** — why does this need to exist now?
   - **Success** — what does "done" look like?
   - **Constraint** — what is the binding limit?

2. **Handle Gaps**: **If any are missing:** invoke `agent-skills:interview-me` to fill gaps. Frame questions around what code and brainstorming couldn't answer — do not re-ask things already covered.

3. **Handle Complete Intent**: **If all four are present:** skip `agent-skills:interview-me`.

---

### Step 6: Choose Specs Location

1. **Ask User**: Ask where the `sdd-specs/` folder should live:
   - `project-root/sdd-specs/` — Default
   - `docs/sdd-specs/` — Nested under existing documentation
   - `packages/sdd-specs/` — In a monorepo package
   - Custom path the user specifies

---

### Step 7: Pre-Write Confirmation Gate

1. **Present Summary**: Before writing any file, present a restate:

```
Here's what I understand we're building:

- Outcome:      <one line>
- User:         <one line — who benefits>
- Why now:      <one line — what prompted this>
- Success:      <one line — how we know it worked>
- Constraint:   <one line — the binding limit>
- Out of scope: <one line — what we're explicitly not building>
```

2. **Wait for Confirmation**: Wait for explicit confirmation before writing. "Sounds good" or "whatever you think" is not a yes — ask "Anything to refine?" if the response is ambiguous.

---

### Step 8: Generate Constitution

1. **Create Files**: Create three files in the chosen `sdd-specs/` location:
   - **mission.md** — Objective, Boundaries, Commands
   - **tech-stack.md** — Project Structure, Code Style, Testing Strategy
   - **roadmap.md** — Phases, milestones, timeline

2. **Handle Existing Codebases**: For existing projects:
   - tech-stack.md Code Style must use a real snippet extracted from the existing codebase
   - tech-stack.md Testing Strategy must reflect the detected test runner and include a representative mock builder example snippet if builders were found in the codebase
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

Read the templates located in the `templates/` directory to format the core constitution files:
- **mission.md**: [templates/mission.md](templates/mission.md) — Target objective, business rationales, user persona, success criteria, and commands.
- **tech-stack.md**: [templates/tech-stack.md](templates/tech-stack.md) — Core application directory mapping, code style guidelines, and test harness runner conventions.
- **roadmap.md**: [templates/roadmap.md](templates/roadmap.md) — Scoped project milestones, phases, and release rollout steps.

## Key Points

- Seed input short-circuits brainstorm/interview for topics it already covers — never re-ask answered questions
- Analysis (A1–A3) runs before any user questions — come to brainstorming with evidence, not a blank form
- Both paths (new and existing) produce the same three-file output
- Code Style section must include a real code snippet — extracted from existing code when available, user-provided for new projects
- Ask user where `sdd-specs/` should live — no default assumption
- All three files go in the chosen `sdd-specs/` directory
- **No superpowers/specs directory**: Do NOT create or use `docs/superpowers/specs/`. The brainstorming step is purely for requirement exploration, and all constitution files are saved to the chosen `sdd-specs/` location.
- Never include absolute file paths (e.g. `file:///Users/username/...`) in generated output files. Refer to other specification files using paths starting with `sdd-specs/` as the root (e.g., `sdd-specs/mission.md`), rather than relative paths.
