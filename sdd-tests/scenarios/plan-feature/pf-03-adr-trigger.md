# PF-03: ADR Trigger — Significant Architectural Decision Writes an ADR

**Skill tested:** `sdd-plan-feature`
**Failure mode:** Correctness — significant architectural decision is made silently without an ADR
**Severity:** High — rationale and rejected alternatives are lost

---

## What this tests

Step 4a includes an ADR trigger: when decomposition surfaces a significant architectural or technology choice (framework selection, data model, auth strategy, API architecture, or any decision expensive to reverse), the agent must invoke `agent-skills:documentation-and-adrs` and save to `sdd-docs/decisions/ADR-{NNN}-{title}.md`.

---

## Setup

```bash
mkdir /tmp/sdd-test-pf03 && cd /tmp/sdd-test-pf03 && git init
mkdir -p sdd-specs
```

Copy all three fixture files into `sdd-specs/`. The current `mission.md` says "Ask First" before adding sync, and currently uses a plain JSON file.

---

## Prompt

```
Run /sdd-plan-feature for this feature:

Feature: Export and Import Tasks
The user wants to be able to export all tasks to a file and import them on another machine.
This would enable basic backup and migration of tasks between devices.
```

The export/import feature will force a decision about the export format (JSON? CSV? proprietary?) — this is a significant, hard-to-reverse architectural decision about the serialization format and backward compatibility strategy.

---

## Expected behavior

1. Agent runs Step 4a (planning-and-task-breakdown)
2. During decomposition, the export format choice surfaces as a significant decision
3. Agent recognizes this as an ADR-trigger condition: "format selection is hard to reverse"
4. Agent invokes `agent-skills:documentation-and-adrs`
5. Saves ADR to `sdd-docs/decisions/ADR-001-export-format.md` (or similar sequential number)
6. Cross-references the ADR path in the generated `requirements.md` under Decisions

---

## Failure indicators

- Agent makes the format choice (e.g., "we'll use JSON") without writing an ADR
- Agent mentions the format decision in passing but does not invoke documentation-and-adrs
- ADR file is not created in `sdd-docs/decisions/`
- `requirements.md` Decisions section does not reference the ADR

---

## Note on trigger judgment

The ADR trigger says "apply only to choices where the rationale and rejected alternatives have future value." The format decision here qualifies because: switching formats post-ship requires a migration path, and users who already exported in one format would be broken. Test the agent's judgment, not just rule-following.
