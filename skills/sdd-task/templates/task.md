# Task: {task-name}

**Roadmap Reference:** [Phase and milestone link in sdd-specs/roadmap.md]

## Context / Background / Current Behaviour
[What exists today, or the specific gap/problem that prompted this task. Scoped to ONE actor and ONE workflow.]

## Expected Implementation / Expected Behaviour
[What should exist or happen instead. If you cannot state this in one paragraph without using "and" to join unrelated capabilities, the task is too big — split it before filling this in.]

## Out of Scope / Non-Goals
[What this task deliberately does NOT cover. If something you're tempted to list here is actually load-bearing for Expected Implementation, that's a signal this is really two tasks.]

## Acceptance Criteria

### Happy Path (at least 2)
- Given [context], When [action], Then [expected outcome]
- Given [context], When [action], Then [expected outcome]

### Error Path (at least 2)
- Given [context], When [invalid/failing action], Then [expected error handling]
- Given [context], When [invalid/failing action], Then [expected error handling]

### Boundary (at least 2)
- Given [edge-case context], When [boundary action], Then [expected boundary behaviour]
- Given [edge-case context], When [boundary action], Then [expected boundary behaviour]

## Open Questions / Assumptions
[Anything interview-me couldn't fully resolve. State it as an explicit assumption so the PRD stage inherits it instead of losing it — do not leave silently unresolved gaps.]

## Definition of Done
[The specific, concrete conditions — beyond passing the Acceptance Criteria above — that must hold true for THIS task to be considered complete. State what "done" means for this task specifically: not a generic checklist, and not an Acceptance Criteria scenario restated in different words.

Example — task "add per-IP rate limiting to /search, return 429 with Retry-After":

- GOOD: "Rate limit threshold and window are named config values, not hardcoded numbers" (a condition none of the ACs test)
- BAD: "429 with Retry-After header works correctly" (that's already an Acceptance Criteria scenario — restating it here adds nothing)
- BAD: "Tests pass, code reviewed" (generic checklist — belongs in validation.md, written later by sdd-plan-feature)

]
