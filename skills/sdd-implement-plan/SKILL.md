---
name: sdd-implement-plan
description: Use when executing an approved phase-structured feature plan within an SDD project.
metadata:
  type: implementation
  composesWith: [superpowers:subagent-driven-development]
---

# SDD Implementation Driver

Execute a feature plan produced by `/sdd-plan-feature`. This skill wraps `superpowers:subagent-driven-development` to guarantee invocation of the right primitives.

## Position in the SDD Trilogy

```
/sdd-write-spec        → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      → sdd-specs/plans/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan    → commits per slice via subagents; developer self-review (4.1)
                         → hands off to /sdd-verify-feature
```

## Workflow

### Step 0: Locate Spec Directory
Confirm the target feature path with the user (infer from context or prompt to select from `sdd-specs/`).

### Step 1: Branch Creation
Ensure execution is on an isolated feature branch. If on `main` or a shared branch, prompt for a name and run `git checkout -b <branch-name>` before editing files.

### Step 2: Read Input Files
Read all three files before touching code:
- `plan.md` (task list & checkboxes)
- `requirements.md` (scope & design constraints)
- `validation.md` (definition of done)

### Step 3: Slice Execution Loop
Loop through each unchecked task in `plan.md` in order:

3.1. **CLASSIFY**: Match the task title, scope description, and filenames against keywords to identify required instructions:
- `frontend`, `UI`, `component`, `page`, `layout`, `design`, `style` → Instruct implementation/use of `agent-skills:frontend-ui-engineering`
- `API`, `endpoint`, `schema`, `interface`, `contract`, `route` → Instruct implementation/use of `agent-skills:api-and-interface-design`. (If making a significant architectural design choice, write an ADR at the controller level using `agent-skills:documentation-and-adrs` first, then pass the ADR path).
- *Ambiguous cases*: Default to no domain skill. Match keywords only against task title, scope description, and filenames.

3.2. **ANNOUNCE**: Print:
`Starting slice N of M: [task name from plan.md]`
Show any scope constraints from `requirements.md` relevant to this slice.

Follow `superpowers:subagent-driven-development` for this slice (activate it by loading its `SKILL.md` via `view_file` with `IsSkillFile: true`). The steps below specify only what `sdd-implement-plan` adds on top — the primitive owns the general dispatch process, file handoffs, and model selection.

Per-task reviewer note: The primitive dispatches per-slice reviews using `task-reviewer-prompt.md`. It is expected and correct that the `agent-skills:code-reviewer` agent type is selected here, as it is highly specialized for this review task. Do not override this.

3.3. **SDD ADDITIONS — implementer brief**: When the primitive builds the implementer brief, also include:
- CLASSIFY result: `"This is a [frontend/API/general] slice. Invoke [domain skill names] before coding."`
- Task's `Interfaces` line from `plan.md` — what this slice must produce (function name + type) and what it may consume from prior tasks. This is the contract to honour; do not invent different names or signatures.
- Relevant constraints from `requirements.md` (only what binds this slice)
- If ADR written: ADR path as implementation context
- Instruction: commit implementation and test files only — do not touch `plan.md`

3.4. **SDD ADDITIONS — task reviewer dispatch**: When the primitive dispatches the task reviewer, also include:
- Full `requirements.md` — the spec compliance verdict requires the actual spec
- Relevant constraints from `requirements.md` for this slice

3.5. **LEDGER & COMMIT**: Once the task review passes, update the progress ledger. Tick the task header checkbox `[ ]` → `[x]` in `plan.md`. Stage and commit `plan.md` atomically with the task's code changes (one git commit per task).

3.6. **CHECKPOINT**: At the end of a `## Phase N` section:
- Run the `Verification:` command from the `### Checkpoint — Phase N` block in `plan.md`.
- If it passes: tick the checkpoint checkbox in `plan.md`, then run:
  `git add sdd-specs/plans/[feature-dir]/plan.md && git commit -m "✓ Checkpoint — Phase N"`
- If it fails: halt implementation and ask the user. Do not proceed until resolved.

---

### Step 4: Bookkeeping & Hand-off
Once all tasks and phases are complete:
1. **Whole-Branch Review**: Run the final code review and fix loops from `superpowers:subagent-driven-development`, passing the path to `requirements.md` for the `[PLAN_OR_REQUIREMENTS]` template placeholder.
2. **Tick Checkbox**: Once review passes, tick `- [ ] Feature plan code review passed` to `- [x] ...` in `plan.md`, then stage and commit `plan.md`.
3. **Finish Branch**: Run `superpowers:finishing-a-development-branch`. If running `/sdd-verify-feature` next, select Option 2 (push/PR) or Option 3 (keep as-is) to preserve the branch.
4. **Handoff**: Print:
   > "✓ Implementation and initial developer review complete. Run: /sdd-verify-feature"

---

## Key Rules

* **Branch Isolation**: Never implement code directly on `main` or a shared branch.
* **Spec First**: Always read `plan.md`, `requirements.md`, and `validation.md` before touching code.
* **Contract Adherence**: Implement signatures exactly as specified in the task's `Interfaces` line.
* **Checkpoints**: Never skip verification commands or phase checkpoints.
* **Task Ordering**: Do not commit code for a task if any preceding task in `plan.md` remains unchecked.
* **No Unreviewed Code**: Never advance past Step 4 with open Critical or Important review findings.

---

## Bulletproofing

### Red Flags (STOP and Start Over)
- You have made 3 consecutive debugging loops on a task and are about to attempt a 4th minor patch.
- You are committing code changes without also ticking the task checkbox in `plan.md` in the same commit.
- You are writing code before writing or updating tests.
- You are modifying files on `main` or another shared branch.

### Common Rationalizations

| Excuse | Reality / Action |
|--------|------------------|
| "The 4th patch will definitely fix it, it's just a small typo." | **Option B Rollback applies.** Run `git checkout -- <modified-files>` to discard changes. Break the task down in `plan.md`, commit the plan, and restart from a fresh slate. |
| "I'll commit the code changes now and update `plan.md` in a later commit." | **Atomic commit rule violated.** Both code changes and the `[x]` tick in `plan.md` must be in a single, atomic commit. |
| "I don't need to read `requirements.md` because I already know the task scope." | **Context loss risk.** Requirements contain critical design constraints. Read all 3 spec files before coding. |
