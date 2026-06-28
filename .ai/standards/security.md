# Standard: Security

## Rules

### Secrets

- No secrets, API keys, or credentials in the repository
- No secrets in environment variable names committed to version control
- Use a secrets manager (Vault, AWS SSM, etc.) for all credentials
- `.aiignore` must cover all `.env*` and `*.key` paths

### Input Validation

- Validate all inputs at system boundaries (HTTP, CLI, message queues)
- Use an explicit schema or type validator — do not rely on TypeScript types at runtime
- Reject unknown fields by default (do not pass-through unvalidated input)

### Authentication and Authorization

- Server-side auth enforcement on every protected route
- Do not trust client-supplied user IDs or roles without server-side verification
- Session tokens must be short-lived and rotatable
- Implement CSRF protection on all state-mutating endpoints

### Output Encoding

- Escape all user-supplied content before rendering in HTML contexts
- Do not use `dangerouslySetInnerHTML` or equivalent without explicit sanitization
- Use parameterized queries for all database interactions — no string interpolation in SQL

### Dependencies

- Run dependency vulnerability scanning in CI
- No dependency with a known critical CVE may ship to production
- Lock files must be committed and kept up to date

### Logging

- Do not log secrets, tokens, or PII
- Log all auth failures with timestamp and source IP
- Do not log full request bodies unless explicitly required and reviewed

## Rationale

Each rule maps to a class of incident. Server-side auth prevents privilege escalation. Parameterized queries prevent injection. Input validation prevents malformed data from reaching business logic.

## Examples

See `examples/` for `.ai/` structural patterns. Stack-specific security rules belong in `.ai/standards/` within each repository.
