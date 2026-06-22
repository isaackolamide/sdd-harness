---
name: sdd-verify-feature
description: Perform formal validation via test-engineer, docs audit, and quality review checklist. Appends review fixes to plan.md if needed. Ticks plan.md and roadmap.md when complete.
metadata:
  type: verification
  composesWith: [agent-skills:test-engineer, agent-skills:code-review-and-quality]
---

# SDD Feature Verification Driver

Verify that the implemented feature complies with the spec guidelines, passes rigorous tests, has up-to-date documentation, and conforms to code quality standards.

## Position in the SDD Trilogy

```
/sdd-write-spec        → sdd-specs/mission.md, tech-stack.md, roadmap.md
/sdd-plan-feature      → sdd-specs/plans/YYYY-MM-DD-{feature}/plan.md, requirements.md, validation.md
/sdd-implement-plan    → slice coding & developer self-review (4.1)
/sdd-verify-feature    → validation gate (Step 1) → docs check (Step 2) → quality checklist (Step 3) 
                         → ticks plan.md & roadmap.md (Step 4) → hands off to /sdd-integrate-feature
```

## Workflow

### Step 0: Locate Spec Directory

If the feature path or name is inferable from conversation context, confirm it with the user before proceeding. If not, list available `sdd-specs/` directories and ask the user to pick.

### Step 1: Validation Gate

1. Print `validation.md` in full. Walk through each criterion group in order.
2. Instead of verifying the criteria yourself, **dispatch the `agent-skills:test-engineer` subagent**.
3. Provide the subagent with `validation.md` and instruct it to rigorously and adversarially verify each criterion. The test engineer should actively write and execute test scripts, queries, or API requests to definitively prove the implementation works as specified.
   - Instruct the test engineer **not** to ask the user for confirmation unless the criterion is strictly visual (e.g., "UI looks correct") or requires external system access you lack.
   - Wait for the test engineer's report. If any test fails or a criterion is unmet, stop. Dispatch an implementation subagent or instruct the user to run `/sdd-implement-plan` to resolve the bugs, then verify again.
4. For each criterion the test engineer proves is met: tick it `[ ]` → `[x]` in `validation.md`.
5. Once all criteria are ticked:
   ```bash
   git add sdd-specs/plans/[feature-dir]/validation.md
   git commit -m "✓ validation complete"
   ```

**STOP.** Do not proceed to tick `plan.md` or `roadmap.md` yet. You must complete Step 2 and Step 3 first.

### Step 2: Documentation Check

Before advancing, confirm:
- ADRs written for any significant decisions made during this feature?
- README updated if user-facing behaviour changed?
- Changelog entry for user-facing changes?
- API docs / type definitions current?

If README, changelog, or API docs are missing and the change is user-facing, update them before proceeding to Step 3.

### Step 3: Code Quality Review

1. Read the `agent-skills:code-review-and-quality` skill instructions and follow its review checklist against the full feature diff.
2. If there are any Critical or Important findings, you (the controller) must append them to the bottom of `plan.md` as new tasks under a `## Review Fixes` section. 
   - **Exit and hand back**: Stop execution of this skill. Instruct the user to run `/sdd-implement-plan` to execute and verify these fixes before re-running `/sdd-verify-feature`.
   > Note: Quality findings are about code craft, not spec compliance — they do not invalidate Step 1 validation. Once the fixes are implemented, re-run only the quality review phase; do not re-open the validation gate unless a finding reveals an unmet spec requirement.

### Step 4: Administrative Ticking (Feature Completion)

The controller is responsible for updating the progress files to officially signal feature completion.

1. **Tick `plan.md`**: Re-read `plan.md` to confirm current checkbox state. Tick all acceptance criteria and review fixes checkboxes — phase checkpoint boxes were already ticked at phase boundaries and must not be re-ticked. By this point, all criteria have been verified via Step 1 and Step 3.
2. **Tick `roadmap.md`**: Open `sdd-specs/roadmap.md` and locate the feature or phase you just completed. Change its checkbox from `[ ]` to `[x]`.
3. Commit the changes:
   ```bash
   git add sdd-specs/plans/[feature-dir]/plan.md sdd-specs/roadmap.md
   git commit -m "✓ feature complete: plan and roadmap updated"
   ```

### Step 5: Hand-off

Print the following hand-off message:

> "✓ Feature verification completed.
> To merge this feature branch and perform cleanup, run:
> 
> /sdd-integrate-feature
> "

---

## Key Rules

- Never proceed past the validation gate (Step 1) if any criterion is unmet.
- Never advance past Step 3 with open Critical or Important quality review findings.
- **No Checkbox Conflation**: Ticking `validation.md` (Step 1) and ticking `plan.md`/`roadmap.md` (Step 4) are separated by critical documentation and quality checks. They must be executed in strict sequence.
- Do not perform merge or cleanup operations in this skill; delegate branch integration entirely to `/sdd-integrate-feature`.
