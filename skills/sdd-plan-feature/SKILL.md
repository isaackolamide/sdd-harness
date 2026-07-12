---
name: sdd-plan-feature
description: Use when planning a validated feature spec file within an active SDD project.
metadata:
  type: implementation
  composesWith: [agent-skills:planning-and-task-breakdown, agent-skills:interview-me, agent-skills:security-and-hardening, agent-skills:observability-and-instrumentation, agent-skills:deprecation-and-migration]
---

# SDD Feature Planner

## When to Use
- **Use when** a feature spec exists in `sdd-specs/features/` and you need to plan it.
- **Do NOT use when** no feature spec exists (use `/sdd-write-spec`).
- **Do NOT use when** executing a plan (use `/sdd-implement-plan`).

## Workflow

### 0. Feature Spec Verification

```dot
digraph feature_spec_discovery {
    "Check input context" [shape=box];
    "Spec referenced?" [shape=diamond];
    "Check sdd-specs/features/" [shape=box];
    "How many files found?" [shape=diamond];
    "Propose & confirm" [shape=box];
    "Ask user to select" [shape=box];
    "STOP & redirect to /sdd-write-spec" [shape=box];
    "Proceed to planning" [shape=box];

    "Check input context" -> "Spec referenced?";
    "Spec referenced?" -> "Proceed to planning" [label="yes"];
    "Spec referenced?" -> "Check sdd-specs/features/" [label="no"];
    "Check sdd-specs/features/" -> "How many files found?";
    "How many files found?" -> "Propose & confirm" [label="exactly 1"];
    "How many files found?" -> "Ask user to select" [label="> 1"];
    "How many files found?" -> "STOP & redirect to /sdd-write-spec" [label="0"];
    "Propose & confirm" -> "Proceed to planning";
    "Ask user to select" -> "Proceed to planning";
}
```

1. If no spec is provided, check `sdd-specs/features/`.
2. Multiple files? Ask user to select.
3. Exactly one? Propose and confirm.
4. None? **STOP**. Direct user to `/sdd-write-spec`.
5. Parse the spec for: Objective (Why/Outcome), User (Who), Acceptance Criteria (Success), Technical Constraints (Constraint), Dependencies. 
6. Carry any `figma.com` UI Design References verbatim into `requirements.md`.

### 1. Gather Project Context
Read `sdd-specs/mission.md`, `tech-stack.md`, and `roadmap.md`. Note missing files but do not block.

### 2. Minimum Viable Fields Check
Assess 5 core fields: Who, Why/Outcome, Success, Constraint, Dependencies.
- Propose finalized intent restatement to user.
- **Wait for explicit confirmation.**
- If fields are missing: **REQUIRED SUB-SKILL:** Use `agent-skills:interview-me`.

### 3. Feature Naming & Classification
1. Propose `sdd-specs/plans/YYYY-MM-DD-{feature-name}/` and ask single confirmation question.
2. Check spec against conditional triggers:

```dot
digraph conditional_classification {
    "Check Keywords" [shape=box];
    "Security?" [shape=diamond];
    "Telemetry?" [shape=diamond];
    "Migration?" [shape=diamond];
    "Architecture?" [shape=diamond];
    "Inject Security Sections" [shape=box];
    "Inject Telemetry Sections" [shape=box];
    "Inject Migration Sections" [shape=box];
    "Inject Arch References" [shape=box];
    "Proceed to Planning" [shape=box];

    "Check Keywords" -> "Security?";
    "Security?" -> "Inject Security Sections" [label="yes"];
    "Security?" -> "Telemetry?" [label="no"];
    "Inject Security Sections" -> "Telemetry?";
    "Telemetry?" -> "Inject Telemetry Sections" [label="yes"];
    "Telemetry?" -> "Migration?" [label="no"];
    "Inject Telemetry Sections" -> "Migration?";
    "Migration?" -> "Inject Migration Sections" [label="yes"];
    "Migration?" -> "Architecture?" [label="no"];
    "Inject Migration Sections" -> "Architecture?";
    "Architecture?" -> "Inject Arch References" [label="yes"];
    "Architecture?" -> "Proceed to Planning" [label="no"];
    "Inject Arch References" -> "Proceed to Planning";
}
```

   - **Security** (`auth`, `login`, `payment`): **REQUIRED SUB-SKILL:** `agent-skills:security-and-hardening` (inject Security Constraints).
   - **Telemetry** (`API`, `cron`, `metric`): **REQUIRED SUB-SKILL:** `agent-skills:observability-and-instrumentation` (inject Telemetry sections).
   - **Migration** (`refactor`, `schema`): **REQUIRED SUB-SKILL:** `agent-skills:deprecation-and-migration` (inject Migration Plan).
   - **Architecture** (`controller`, `dto`): Add `clean-architecture-ddd-reference.md` to references.
   - Always include `testing-patterns.md` in references.

### 4. Planning & Decomposition
**REQUIRED SUB-SKILL:** Use `agent-skills:planning-and-task-breakdown`.
- **Confirm order and sizing** with user before formatting.
- **Format directly into `plan.md`** (use `templates/plan.md`). No intermediate files.
- **Constraints**: 
  - Each task needs `Interfaces` (function signature + strict types). NO `any`/`unknown`.
  - Task headers: `### Task X.Y: [Name]`
  - End phases with `### Checkpoint — Phase N` with a checkbox.
  - Inject `targetBaseBranch: <current-branch>` in YAML frontmatter.
- **ADR Trigger**: For significant architectural choices, **REQUIRED SUB-SKILL:** `agent-skills:documentation-and-adrs` → save to `sdd-specs/docs/decisions/` and cross-reference.

### 5. Pre-Write Review (GATE)
Present summary of `plan.md`, `requirements.md`, and `validation.md`.
**Ask focused probe:** "Anything in the plan surprise you, missing from scope, or acceptance criterion feels wrong?"
- Adjust and re-confirm if concerns raised.
- **STOP**: Wait for explicit "yes" before writing files.

### 6. Output
Write `plan.md`, `requirements.md`, and `validation.md` to `sdd-specs/plans/YYYY-MM-DD-{feature-name}/`. (Refer to `templates/`).

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "I'll batch confirmations at the end." | Batching bypasses user guidance. Stop at each gate. |
| "I don't need to ask for feature name." | Dictates future tooling. Confirm the name. |
| "I'll assume missing fields." | Guessing builds the wrong feature. Use interview-me. |
| "I'll skip the pre-write review." | Causes churn if plan is wrong. Final safety net. |

## Red Flags - STOP
- Combining Steps 2, 3, and 4 into a single prompt.
- Proceeding past Step 5 without explicit affirmative response.
- Skipping `**REQUIRED SUB-SKILL**` invocations.
- Using absolute file paths (use `sdd-specs/...` paths).
- Outputting code instead of strict interface contracts.
