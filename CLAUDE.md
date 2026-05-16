# Docs

When making code changes, reflect them in all relevant docs: `README.md` and files under `docs/`. This includes route changes, renamed/added/removed files, store changes, and any shift in architecture.

---

# Code Style

## General

- Always use braces for `if`, `for`, `while`, etc. — no bracketless single-liners (enforced via ESLint `curly: all`)
- Sort object literal keys alphabetically when order has no semantic meaning (e.g. config objects, type definitions, plain data). Skip when order matters (e.g. migration steps, priority queues).
- `import type` must be a separate statement from value imports, even from the same module (enforced via ESLint `@typescript-eslint/consistent-type-imports`)

## Vue

- Always use `<script setup lang="ts">` in Single File Components
- Component names must be PascalCase
- Props and emits must be typed via `defineProps<{...}>()` and `defineEmits<{...}>()`
- Composables and utility functions must not be defined inline inside component files — extract them to `src/composables/` or `src/utils/`
