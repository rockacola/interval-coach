# Agent Instructions

This file is the mandatory entry point for all AI systems operating in this repository.
Load this file first before any other context.

## Critical Rules

These rules are non-negotiable and apply to every task, every session, without exception.

- **Never commit without explicit instruction from the operator.** Stage changes, show a `git diff --stat` summary, and wait for confirmation. An interrupted or redirected request cancels the prior commit instruction.
- **Never add `Co-Authored-By` to commit messages.**
- **Never use em dashes.** Use a comma, full stop, or rewrite the sentence.
- Commit message format: single-line conventional commits, no body. Types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`.

---

## Load Order

1. Standards — `.ai/standards/` (contains both foundation-inherited and project-specific standards)
2. Context — `.ai/context/` (follow sequence in `.ai/manifests/context.yaml`)
3. Memory — `.ai/memory/`
4. Tasks — `.ai/tasks/active/` (active and blocked tasks; completed tasks are archived in `.ai/tasks/completed/`)

## Rules

- Follow spec strictly. No structural invention.
- Do not create files outside the permitted types: manifests, context, agents, standards, skills, memory, journal, and tasks.
- Do not activate agents not listed in `.ai/manifests/agents.yaml`.
- Use `.ai/manifests/context.yaml` to determine which context files to load and in what order.
- Record all decisions in `.ai/journal/{YYYY}/{today}.md`.
- All architectural decisions require an ADR in `docs/adr/`.
- Do not modify `.ai/manifests/foundation.yaml` after initial setup.

## Journal

Add a journal entry for each working session. Create `.ai/journal/YYYY/YYYY-MM-DD.md` using today's date and year, or append to it if it already exists.

Each entry has four sections:

- **Summary** — one or two sentences on what happened today
- **Changes Made** — list each file created, modified, or deleted
- **Decisions** — choices made; cross-reference ADR numbers if applicable
- **Open Questions** — unresolved questions or blockers; write `None.` if none

Keep entries brief. One or two sentences per section is enough.

## Docs

Update `README.md` and all files under `docs/` in the same commit as any code change. Specifically:

- **Files added/removed/renamed** → update structure trees in `README.md` and `docs/getting-started.md`
- **Store added/removed** → update the stores table in `docs/overview.md`, the store list/count in `docs/getting-started.md`, and create a task entry in `.ai/tasks/active/`
- **Feature completed** → move the corresponding task YAML from `.ai/tasks/active/` to `.ai/tasks/completed/`; add a named section in `docs/overview.md` if it introduces a new architectural pattern
- **Route added/removed** → update the routing section in `docs/overview.md`

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

---

## Active Agents

See `.ai/manifests/agents.yaml`.

## Ownership

See `.ai/manifests/ownership.yaml`.

## Foundation Version

See `.ai/manifests/foundation.yaml`. Rules in this file follow the spec version recorded there. On upgrade, replace this file with the version from the new foundation release.
