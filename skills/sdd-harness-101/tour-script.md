# Tour script

**Running example:** a todo app. The user wants to let people *bookmark* a todo so it pins to the top.

Snippets are illustrative, not real output. Keep them to the lines shown.

## Path table (set at stop 2)

| Path | Stop order |
| --- | --- |
| New project | 3, 4, 5, 6, 7, 8, 9, 10 |
| Existing codebase | 3, 4, 5, 6, 7, 8, 9, 10 (at stop 4, mention that the constitution scans the repo first) |
| Bugs after shipping | 8, 3, 5, 6, 7, 9, 10 (skip 4; the project already has a constitution) |

---

## Stop 1: What is spec-driven development, and why?

**Body:** Spec-driven development (SDD) means writing down *what* to build and approving it before any code exists. Each step writes a Markdown file, and the next step reads it.

Why it helps:

- Mistakes get caught in a short spec, not in a big diff.
- Every change traces back to a written requirement.
- Context survives across sessions, because the files hold it, not the chat.
- You review short documents instead of reverse-engineering code.
- The AI drifts less when it builds from approved text.

**Not for:** a typo or a one-line fix. If you could explain and finish the change in a minute, just do it.

```text
Prompt only:  "add bookmarks" → guess → wrong behavior → rework
SDD:          spec: star pins todo to top, persists on reload
              → approved once → built once
```

## Stop 2: Pick your path

**Body:** One sentence: the tour has three common starting points, and your pick decides which stops come next. Ask the path question.

Options: **New project** / **Existing codebase** / **Bugs after shipping**.

```text
New project         → full pipeline from the constitution
Existing codebase   → same, but the constitution scans your repo first
Bugs after shipping → start with the feedback loop
```

## Stop 3: The big picture

Flow: `constitution → task → prd → spec → plan → implement → verify`

**Body:** Each step writes a file into `sdd-specs/`. You approve each one before the next step starts, so nothing is built on an unchecked assumption.

```text
idea: "let me bookmark todos"
  → task  (small enough?)   → prd (who/why)   → spec (what exactly)
  → plan  (how, in phases)  → code (TDD)      → verify + merge
```

## Stop 4: Constitution (once per project)

Command: `/sdd-constitution`.

**Body:** A short interview, or a scan of an existing repo, that writes the project's ground rules. Its **Never Do** rules are a gate: a later spec that breaks one is refused until the mission is updated.

```text
sdd-specs/mission.md     Never Do: store user data outside the DB
sdd-specs/tech-stack.md  React + Vitest, tests colocated
sdd-specs/roadmap.md     [ ] Bookmark todos
```

## Stop 5: Narrow the idea

Commands: `/sdd-task` → `/sdd-prd` → `/sdd-write-spec`.

**Body:** Each command narrows "bookmark todos". `/sdd-task` is a **size gatekeeper**: if the work bundles several workflows, it splits it into separate task files, even if you asked it not to, because oversized work is expensive to split later. The PRD says who it is for and what matters most. The spec says exactly what gets built, and nothing is written without your yes.

```text
Task:  "Bookmark a todo"  (split off: "bookmark sync across devices")
Spec:  Given a todo list, when I tap the star,
       then the todo moves to the top and stays after reload.
```

## Stop 6: Plan

Command: `/sdd-plan-feature`.

**Body:** Turns the spec into phases with typed interface contracts and checkpoints. You review the plan before anything is saved.

```text
plan.md
  Phase 1: data   toggleBookmark(id: string): Promise<Todo>
  Phase 2: UI     <StarButton todo={Todo} />
  Checkpoint: bookmarked todos persist after reload
```

## Stop 7: Build and verify

Commands: `/sdd-implement-plan` → `/sdd-verify-feature`.

**Body:** Implement works slice by slice on a new branch, tests first. Verify runs a test review and a code review in parallel, then merges.

```text
slice 1: failing test → toggleBookmark → green → commit
slice 2: failing test → StarButton     → green → commit
verify:  tests ✓  code review ✓  → merge
```

## Stop 8: The feedback loop

Command: `/sdd-write-spec`, with your findings as input.

**Body:** QA finds that bookmarks vanish after logout. Don't patch it by hand. Give the notes to `/sdd-write-spec`, then run plan, implement, and verify again, so the fix is as traceable as the original feature.

```text
QA: "bookmarks vanish after logout"
  → /sdd-write-spec (notes as input)
  → /sdd-plan-feature → /sdd-implement-plan → /sdd-verify-feature
```

## Stop 9: Quick FAQ

**Body:** Three answers.

- **Do I need every step?** No. Skip `/sdd-prd` when the idea is clear, and skip the whole flow for tiny fixes.
- **What if I disagree with a spec or plan?** Say so at the review gate and it is revised before anything is saved.
- **Where do the files live?** In `sdd-specs/` in your project: `tasks/`, `prds/`, `features/`, `plans/`.

```text
sdd-specs/
  mission.md  tech-stack.md  roadmap.md
  tasks/  prds/  features/  plans/
```

**Pause options:** **Take the quick quiz** / **Go to the cheat sheet**.

### Quiz (only if chosen)

One `AskUserQuestion` call with three questions, then reveal the answers in one message:

1. QA found a bug after release. What do you run? → `/sdd-write-spec` with the notes.
2. Your task bundles three workflows. What happens? → `/sdd-task` splits it into separate task files.
3. A spec breaks a Never Do rule. What happens? → It is refused until the mission is updated.

Offer three lettered options per question, each with two plausible wrong ones. Put the correct answer in a different position for each question (for example B, C, A).

## Stop 10: Cheat sheet

| I want to… | Run |
| --- | --- |
| Set up a project | `/sdd-constitution` |
| Size a piece of work | `/sdd-task` |
| Clarify a fuzzy idea | `/sdd-prd` |
| Write the spec (or feed it QA findings) | `/sdd-write-spec` |
| Plan it | `/sdd-plan-feature` |
| Build it | `/sdd-implement-plan` |
| Verify and merge | `/sdd-verify-feature` |
| Not sure what to run | `/using-sdd-harness` |

## First-steps checklist (shown at the close)

1. Run the next command on a real project, using one small roadmap item.
2. Read each file it writes before approving it.
3. Stop after the spec the first time and review what you have.
