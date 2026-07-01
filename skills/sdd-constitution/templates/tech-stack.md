# Tech Stack & Implementation

## Project Structure

```
src/              → Application source code
src/components    → [Component description]
src/lib           → Shared utilities and helpers
tests/            → Unit and integration tests
e2e/              → End-to-end tests
sdd-specs/            → Specification & design documents (including plans, features, and ADRs)
```

## Code Style

### Naming Conventions

- Files: `camelCase.ts` for sources, `name.test.ts` for tests
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Classes: `PascalCase`

### Formatting Rules

- Indentation: [spaces/tabs]
- Line length: [max length]

### Example

```typescript
// Good
function fetchUserData(userId: string): Promise<User> {
  // [implementation]
}

// Bad
function getuserdata(id) {
  // [avoid this]
}
```

## Testing Strategy

For detailed implementation guidelines (AAA structure, mocks, and builders), refer to the shared `sdd-harness:references/testing-patterns.md` reference.

### Framework & Tools
- Test Runner: [framework]
- Assertion Library: [library]
- Coverage Target: [%]

### TDD & Mocking Conventions
- **TDD Cycle**: Follow Red-Green-Refactor. Always write a failing test before introducing logic.
- **Mock Boundaries**: Mock database calls, HTTP requests, file systems, and external API integrations. Never mock pure functions, internal utilities, or core domain logic.
- **Builder Pattern**: Use builder classes (e.g. `UserBuilder`) to construct complex objects and mock values in test setups to protect tests against signature/constructor changes.

### Test Organization

Tests live in: `tests/` and `src/[feature].test.ts`

### Test Levels

- **Unit**: Test individual functions, pure logic
- **Integration**: Test feature workflows, database interactions
- **E2E**: Test user flows, critical paths

Coverage expectations by level:
- Unit: 80%+
- Integration: [%]
- E2E: Critical paths only
