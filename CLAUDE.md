# Docs

Update `README.md` and all files under `docs/` in the same commit as any code change. Specifically:

- **Files added/removed/renamed** → update structure trees in `README.md` and `docs/getting-started.md`
- **Store added/removed** → update the stores table in `docs/overview.md`, the store list/count in `docs/getting-started.md`, and add a task item in `docs/tasks.md`
- **Feature completed** → mark `[x]` in `docs/tasks.md`; add a named section in `docs/overview.md` if it introduces a new architectural pattern
- **Route added/removed** → update the routing section in `docs/overview.md`

---

## Code Style

### General

- Always use braces for `if`, `for`, `while`, etc. — no bracketless single-liners (enforced via ESLint `curly: all`)
- Sort object literal keys alphabetically when order has no semantic meaning (e.g. config objects, type definitions, plain data). Skip when order matters (e.g. migration steps, priority queues).
- `import type` must be a separate statement from value imports, even from the same module (enforced via ESLint `@typescript-eslint/consistent-type-imports`)

### Vue

- Always use `<script setup lang="ts">` in Single File Components
- Component names must be PascalCase
- Props and emits must be typed via `defineProps<{...}>()` and `defineEmits<{...}>()`
- Composables and utility functions must not be defined inline inside component files — extract them to `src/composables/` or `src/utils/`
