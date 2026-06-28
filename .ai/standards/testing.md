# Standard: Testing

## Rules

### Coverage Requirements

- Unit tests required for all pure functions and domain logic
- Integration tests required for all API endpoints and database interactions
- E2E tests required for all critical user flows (auth, checkout, core CRUD)
- No untested code in production paths

### Test Structure

- Each test file lives adjacent to the file it tests: `{module}.test.ts`
- E2E tests live under `tests/e2e/`
- Test name format: `{unit under test} {condition} {expected result}`
- No test should depend on execution order

### Mocking

- Do not mock the database in integration tests
- Mock only at system boundaries (external APIs, email providers, clocks)
- No mocks in E2E tests

### Assertions

- One logical assertion per test case
- Do not use `toBeTruthy` / `toBeFalsy` — use specific matchers
- Assert on observable output, not on internal implementation

### Test Data

- Use factories, not hardcoded fixture files shared across tests
- Test data must not use real user data
- Each test creates and cleans up its own data

## Rationale

Integration tests against real databases catch schema drift that mocks cannot. Order-independent tests allow parallel execution and prevent flakiness from shared state.

## Examples

See `examples/` for `.ai/` structural patterns. Stack-specific test scaffolding belongs in `.ai/standards/` within each repository.
