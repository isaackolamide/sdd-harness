# Validation: {feature-name}

## Acceptance Criteria

For behavioral criteria, prefer Given/When/Then:
- [ ] Given [context], When [action], Then [outcome]

For non-functional or structural criteria, a plain statement is fine:
- [ ] Criterion

## Binding Constraints Checklist

Verify critical constraints from requirements.md are met:
- [ ] Constraint 1

## Test Coverage
- [ ] Unit tests pass for new logic
- [ ] Integration tests pass
- [ ] E2E covers critical path (if applicable)
- [ ] Every `TDD: required` task in plan.md has an entry in tdd-evidence.md with RED (command, failing output, why the failure was expected) and GREEN (command, passing output); every `TDD: N/A` entry states its reason

## Automation Checks
- [ ] Check 1
- [ ] Check 2

## Manual Checks

Notes for the operator or developer to carry out in their own time. Plain bullets, never checkboxes; verify does not gate on them.
- Manual check 1


## Definition of Done

This feature is mergeable when:
- All acceptance criteria and binding constraints above are checked
- No regressions in existing tests
- Code review approved
