---
feature: [Feature Name or ID]
specFile: [Path to the feature spec in sdd-specs/features/ e.g. sdd-specs/features/YYYY-MM-DD-feature.md]
targetBaseBranch: [Current branch at time of planning, e.g. main or feature/parent-epic]
created: [YYYY-MM-DD]
---
# [Feature Name] Implementation Plan

**Feature Spec:** [Link to the feature spec in sdd-specs/features/ e.g. sdd-specs/features/YYYY-MM-DD-feature.md]

**Goal:** [one sentence describing what this builds]
**Architecture:** [2-3 sentences about approach]
**Tech Stack:** [key technologies]

---

## Phase 1: [Phase Name]

### Task 1.1: [Task Name]
- [ ] Task Completed
- Scope: S/M/L
- Files: `exact/path/to/file.ts` (create), `exact/path/to/existing.ts` (modify)
- Interfaces: produces `functionName(param: Type): ReturnType`; consumes `otherFn(param: Type): ReturnType` from Task 1.X
- Acceptance criteria:
  - Given [context], When [action], Then [outcome]
  - [Additional criterion]
- Verification: `npm test path/to/test.ts`
- Dependencies: none

### Task 1.2: [Task Name]
- [ ] Task Completed
- Scope: S/M/L
- Files: ...
- Interfaces: produces `anotherFn(input: InputType): OutputType`; consumes `functionName(param: Type): ReturnType` from Task 1.1
- Acceptance criteria:
  - ...
- Verification: ...
- Dependencies: Task 1.1

### Checkpoint — Phase 1
- [ ] [Integration condition — be specific, not "all tasks complete"; e.g., "all Phase 1 tests pass end-to-end", "API contract validated against consumer"]
- Verification: `[command that proves the condition — e.g., "npm test src/phase1/" or "npm run build"]`

---

## Phase 2: [Phase Name]

### Task 2.1: [Task Name]
- [ ] Task Completed
...

### Checkpoint — Phase 2
- [ ] [Integration condition for final phase — e.g., "all tests pass and build is clean, no TypeScript errors"]
- Verification: `[command]`

---

---

## Validation Fixes
<!-- Validation fixes will be appended here as checklist tasks if validation fails -->

## Code Quality Review Fixes
<!-- Code quality review issues will be appended here as checklist tasks if findings are identified -->

