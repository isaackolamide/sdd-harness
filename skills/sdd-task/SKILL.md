---
name: sdd-task
description: Use when a roadmap milestone or rough idea needs to become one small, right-sized unit of work before a PRD is written, or when a task file bundles more than one actor, workflow, or independently-shippable capability and needs to be split.
metadata:
  type: planning
  composesWith: [agent-skills:interview-me]
---

# sdd-task

## Overview
Turns a roadmap milestone or rough idea into a scoped task file (`sdd-specs/tasks/YYYY-MM-DD-<name>-task.md`) that seeds `sdd-prd`. Every task file always has the same structure: Context, Expected Implementation, Out of Scope, Acceptance Criteria (Given/When/Then, at least two scenarios each for Happy Path, Error Path, and Boundary), Open Questions/Assumptions, and Definition of Done. Acceptance Criteria and Definition of Done are deliberately separate — AC proves the behaviour is correct, DoD states what else must be true for this specific task to be complete (not a second set of behavioral tests, and not a generic checklist).

**This skill is a workload gatekeeper first, a document generator second.** Its job is to stop oversized work from reaching `sdd-prd` — where it becomes much more expensive to re-scope. If the milestone bundles more than one unit of work, this skill splits it into multiple task files before writing anything.

**REQUIRED SUB-SKILL:** Use `agent-skills:interview-me` to fill any gaps in Context, Expected Implementation, or edge cases not already answered by the seed.

## Workflow

### 1. Constitution Check
**Before anything else**, verify these exist:
- `sdd-specs/mission.md`
- `sdd-specs/tech-stack.md`
- `sdd-specs/roadmap.md`

If ANY are missing: **STOP.** Demand `/sdd-constitution`. Do not proceed.

### 2. Locate or Create the Milestone
1. Read `sdd-specs/roadmap.md`. If the seed input references an existing phase/milestone, use it.
2. If it doesn't map to an existing milestone, ask the user which Phase this belongs to (list phases), or whether to add a new Phase.
3. Do not write any files yet — this only determines where the milestone bullet(s) will go in Step 8.

### 3. Constitution Alignment Check
Check the seed/idea against `sdd-specs/mission.md`. Name any "Never Do" violations. **STOP if violated.** Demand the user modify `mission.md` first. Also check against "Ask First" items — surface any matches as explicit flags for the user. This does not block the workflow.

### 4. Draft Scope: Context, Expected Implementation, Out of Scope
1. Parse any seed input (roadmap milestone text, rough notes) into a first draft of Context and Expected Implementation.
2. Invoke `agent-skills:interview-me` for anything the seed doesn't answer:
   - What's the specific gap or current behaviour? (Context)
   - What should happen instead, for which single actor/workflow? (Expected Implementation)
   - What's deliberately NOT included, even though it's adjacent? (Out of Scope)
3. Draft Out of Scope / Non-Goals. If a candidate exclusion turns out to be load-bearing for Expected Implementation, that's a signal this is really two tasks — flag it for Step 5.
4. **Debt check:** if `sdd-specs/tech-debt.md` exists, read only its `## Open` section. Surface each row whose `Where` falls inside the Expected Implementation, or whose `Revisit when` condition now holds for this milestone, and ask the user whether to include it. An included row is added to Expected Implementation and cited as `TD-N`, so it goes through the Step 5 rubric like any other scope. Never edit the ledger; `/sdd-verify-feature` closes the row. No file, or no match, means skip silently.
5. **Do not draft Acceptance Criteria yet.** Scope must clear the Gatekeeper first. Drafting Acceptance Criteria before the split decision is settled is what lets the AC minimum in Step 6 quietly smuggle in extra scope instead of triggering a split.

### 5. Size Gatekeeper Assessment — MANDATORY, RUNS EVERY TIME

**Violating the letter of the size rubric is violating the spirit of this skill.** This skill exists specifically to catch what a rushed read-through won't. Run the rubric below against the Step 4 draft regardless of how the user framed the request, how much time pressure exists, or how the seed was worded.

Split the draft if **ANY** of these are true:
- More than one distinct actor/user role appears in Expected Implementation (e.g. "user" and "admin" both have capabilities described).
- More than one primary workflow/entry point is described.
- Expected Implementation cannot be stated in one paragraph without joining unrelated capabilities with "and"/"plus"/a list.
- Stating Expected Implementation as a single Happy Path scenario would require describing independently triggerable capabilities (different entry points, actors, or workflows) rather than one coherent flow — this is usually visible from the Expected Implementation draft alone, before any Acceptance Criteria exist.
- The capabilities described have different failure modes or different stakeholders (a strong signal they are different units of work, even if the user described them together).

**When triggers disagree, Trigger 4 is the tiebreaker** — it's the only trigger anchored to observable behaviour rather than actor labels or word patterns. Naming two *options* for delivering one capability (two export formats, two notification channels) is not automatically a split: if Expected Implementation can still be written as one coherent Happy Path with the option as a detail ("user exports their data in a format they choose"), Trigger 4 does not fire, and Triggers 2/3/5 should not be stretched to force a split anyway. Reserve the split for milestones where Trigger 4 also fires — the two things are independently triggerable at different times, by different actors, or as genuinely separate flows, not merely different values of the same parameter.

**If any trigger fires:**
1. Do NOT write a single task file. Do not ask the user for permission to split — that is this skill's job, not a negotiable feature.
2. Partition along the natural seams (one task per actor, per workflow, or per independently-shippable capability). Give each split task its own descriptive name — not a numeric suffix — unless no natural distinct name exists.
3. Re-run this same rubric against each split task. If a split still fails, split it again.
4. Each split task gets its OWN Context / Expected Implementation / Out of Scope / Acceptance Criteria (Happy/Error/Boundary) — do not share one Acceptance Criteria block across files.

**If no trigger fires:** proceed to Step 6 as a single task.

#### Rationalization Table
| Excuse | Reality |
|--------|---------|
| "The user already scoped and wrote this themselves." | The user's framing is not a size judgment — it's the reason this gate exists. A user writing one paragraph doesn't mean it's one unit of work. |
| "The user is on a deadline / told me not to split it." | An instruction to skip gatekeeping is exactly the instruction this skill must not silently honor. Surface the specific trigger(s) that fired and let the user override with eyes open — don't skip the check itself. |
| "It's a small-sounding milestone, splitting is overkill." | Size in words ≠ size in scope. A one-line milestone naming four channels and an admin feature is still five things. |
| "It can get decomposed later, during the PRD interview." | Too late. By the PRD stage it's anchored as one unit and gets built as one. Controlling workload size *before* prd/spec/plan is this skill's entire purpose — deferring the split downstream defeats it. |
| "I already wrote a good Acceptance Criteria section, doesn't feel bloated." | Well-written prose can still describe multiple units of work. Check the rubric triggers, not how clean the writing reads. |
| "Splitting will annoy the user / slow them down." | One oversized task produces a bloated PRD, an unimplementable plan, and rework later. The delay of splitting now is smaller than the rework it prevents. |
| "I need a second Happy Path AC and the only other one I can think of is an admin action, so I'll just write it." | That's a new actor — the rubric's own trigger, not a free variation. Go back to Step 5 and re-run it against the new capability before drafting the AC. |
| "It names two things (two formats, two channels), so it must split." | Naming two options isn't the same as describing two workflows. Check Trigger 4 first — if Expected Implementation is still one coherent Happy Path with the option as a detail, it's one task, not two. |

#### Red Flags - STOP and Re-run the Rubric
- You notice yourself thinking "this is borderline, but I'll let it slide."
- You're about to write "and" or "plus" in the Expected Implementation summary sentence.
- The user explicitly asked for one file when describing something with multiple actors or workflows.
- You're deferring a scope concern to "the PRD stage will sort it out."
- You're drafting a second AC scenario in Step 6 that only works by introducing an actor, workflow, or entry point not already in Expected Implementation.

**All of these mean: apply the rubric now, before drafting the file, not after.**

### 6. Draft Acceptance Criteria & Open Questions
Only once Step 5 has cleared the current scope as one task:
1. Invoke `agent-skills:interview-me` for anything not yet answered: What's the most likely way this fails, and what's an edge/boundary case?
2. Draft Acceptance Criteria as Given/When/Then, with **at least two scenarios each** for Happy Path, Error Path, and Boundary. All three categories are mandatory, and a single scenario in any of them is not enough — a task with only one plausible way to succeed, fail, or hit an edge case is a sign the scope is trivial or hasn't been thought through; probe `agent-skills:interview-me` again rather than settling for one.
   - **A second scenario is genuine if it differs in trigger, timing, or preconditions** — a different code path (e.g. initial page load vs. a live keystroke handler), a different upstream state (stale/legacy data vs. freshly entered data), or a different actor action — not merely the same failure reworded. If your two scenarios in a category differ only in wording, keep searching before concluding the category is covered.
3. **Guard against smuggling scope through the count**: if you cannot produce a second genuine variation in any category without introducing a new actor, workflow, or entry point not already covered by Expected Implementation — STOP. That's the Size Gatekeeper's trigger firing on a new candidate scope, not license to fabricate a scenario. Return to Step 5, re-run the rubric including this new capability, and split if it fires.
4. Capture anything `interview-me` couldn't fully resolve as an explicit entry under Open Questions / Assumptions — state it as an assumption, don't leave it silently blank. This is how unresolved gaps survive into the PRD stage instead of being lost.

### 7. Confirmation Gate
Before writing any file, present the task(s) — Context / Expected Implementation / Out of Scope / Acceptance Criteria, plus any Open Questions / Assumptions flagged — and, if split, the specific rubric trigger(s) that caused the split. Wait for explicit "yes" or "looks good". Ambiguous responses ("sounds fine", "whatever you think") are not confirmation — ask "Anything to refine?"

### 8. Generate Task File(s) & Update Roadmap
1. Create each task at `sdd-specs/tasks/YYYY-MM-DD-<task-name>-task.md` using `templates/task.md`.
   - **PRESERVE HEADINGS**: Do not add, remove, or modify the template's headings.
   - **FORMAT CRITERIA**: Acceptance Criteria must strictly follow Given/When/Then, with at least two scenarios under each of Happy Path, Error Path, and Boundary.
   - **KEEP DEFINITION OF DONE SCOPED TO THIS TASK**: Draft it as the specific, concrete conditions unique to this task — not a generic completion checklist (test coverage, docs, deploy steps, etc.). That level of detail belongs to `validation.md`, owned by `sdd-plan-feature`.
2. In `sdd-specs/roadmap.md`, under the milestone's Phase, add **one milestone bullet per task file** (one bullet per split task if split occurred):
   ```
   - [ ] [Deliverable] — sdd-specs/tasks/YYYY-MM-DD-<task-name>-task.md
   ```
   If a bullet already exists for this milestone as free text, replace it with the linked form rather than duplicating it.
3. Commit:
   ```bash
   git add sdd-specs/tasks/ sdd-specs/roadmap.md
   git commit -m "task: scope <milestone-name>"
   ```

### 9. Handoff
For each task file created, print the exact next command:
```
Task created at sdd-specs/tasks/YYYY-MM-DD-<task-name>-task.md.
Next Step: Run `/sdd-prd sdd-specs/tasks/YYYY-MM-DD-<task-name>-task.md` to turn this task into a PRD.
```
If multiple tasks were created from a split, list all handoff commands and recommend running `/sdd-prd` on them one at a time — running them together defeats the purpose of having split them.

## Common Mistakes
- **Skipping the rubric because the seed already looks small**: The rubric runs every time, regardless of how the milestone was worded.
- **Splitting numerically instead of descriptively**: `notification-system-1-task.md` tells a future reader nothing. Name each split task after its distinct capability.
- **Sharing one Acceptance Criteria block across split tasks**: Each split task is independently implementable and needs its own Happy/Error/Boundary set.
- **Adding a second milestone bullet for a task that already has one**: Check for an existing free-text bullet for this milestone first; convert it rather than duplicating it.
- **Writing Acceptance Criteria without all three of Happy Path, Error Path, and Boundary**: All three are mandatory, not "as applicable."
- **Stopping at one scenario per category**: Happy Path, Error Path, and Boundary each require at least two scenarios. One success case, one failure case, and one edge case is not enough coverage — probe for a second in each before treating the section as done.
- **Letting Definition of Done become a generic completion checklist**: It stays scoped to conditions specific to this task. A fuller completion checklist (tests, docs, rollout) belongs in `validation.md`, written later by `sdd-plan-feature`.
- **Restating an Acceptance Criteria scenario as a Definition of Done line**: DoD states what must hold true *beyond* the ACs passing — not the same behaviour in different words. If a DoD line and an AC scenario would both be satisfied by the same test, the DoD line is redundant.
- **Leaving Out of Scope blank "to save time"**: An empty Out of Scope section is a missed chance to catch a hidden second task — it's cheaper to write one exclusion line now than to discover the extra scope mid-implementation.
- **Silently dropping an unresolved question instead of logging it under Open Questions / Assumptions**: If `interview-me` couldn't close a gap, state the assumption explicitly. A missing answer isn't the same as a resolved one.
- **Drafting Acceptance Criteria before the Gatekeeper clears scope**: Step 5 must run against Context/Expected Implementation/Out of Scope alone. Drafting ACs first lets the ≥2-per-category minimum quietly decide scope instead of the rubric.

## Red Flags - STOP and Start Over
- Proceeding without all three constitution files
- Tolerating a "Never Do" violation
- Writing a single task file after the rubric flagged a split
- Asking the user's permission to split instead of just doing it
- Acceptance Criteria missing Error Path or Boundary, or with fewer than two scenarios in any category
- Numeric-only split file names
- Adding a duplicate roadmap bullet instead of converting the existing one
- Skipping the confirmation gate before writing files
- Definition of Done written as a generic completion checklist instead of task-specific conditions
- Open Questions / Assumptions left blank when `interview-me` didn't fully resolve something
- A second Acceptance Criteria scenario introduces an actor, workflow, or entry point not present in Expected Implementation, without re-running the Step 5 rubric first

**All of these mean: stop, delete any generated files, and start over from the relevant step.**
