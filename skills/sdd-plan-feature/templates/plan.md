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
- TDD: required | N/A — [reason, e.g. config-only, docs-only]
- Files: `exact/path/to/file.ts` (create), `exact/path/to/existing.ts` (modify)
- Interfaces: produces `functionName(param: Type): ReturnType`; consumes `otherFn(param: Type): ReturnType` from Task 1.X
- Acceptance criteria (only the ACs this task owns, at the lowest layer that can observe them):
  - [Happy path, AC-H1]: Given [context], When [action], Then [outcome]
  - [Error state, AC-E1]: Given [invalid/failure context], When [action], Then [handled outcome]
  - [Boundary, AC-B1]: Given [edge case limit], When [action], Then [outcome]
- Verification: `npm test path/to/test.ts`
- Dependencies: none

### Task 1.2: [Task Name]
- [ ] Task Completed
- Scope: S/M/L
- TDD: required
- Files: ...
- Interfaces: produces `anotherFn(input: InputType): OutputType`; consumes `functionName(param: Type): ReturnType` from Task 1.1
- Acceptance criteria (higher layer: only what Task 1.1's tests cannot observe):
  - [Wiring, AC-H2]: Given [real dependencies and the happy-path context], When [entry point is called], Then [the happy-path outcome]
  - [Error state, AC-E2]: Given [a failure only the real dependency produces], When [action], Then [handled outcome]
- Verification: ...
- Dependencies: Task 1.1

### Task 1.3: [Docs or config task]
- [ ] Task Completed
- Scope: S
- TDD: N/A — [reason]
- Files: ...
- Done when: [command output, file present, or review item]
- Dependencies: ...

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

## Additional Fixes
<!-- /sdd-verify-feature appends fix phases here (validation, code quality, security), if findings are identified -->
