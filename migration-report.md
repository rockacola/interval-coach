# Migration Report

**Foundation version applied:** 1.1.1
**Migration date:** 2026-06-28
**Repo type:** migrated

---

## Summary

Applied Engineering AI Foundation v1.1.1 to the interval-coach repository. The repo had no prior `.ai/` structure. Two journal files were moved from `journal/` to `.ai/journal/2026/`. All required folders and files were created from foundation templates. Foundation standards were copied verbatim. `CLAUDE.md` was folded into `AGENTS.md` and deleted. `docs/tasks.md` was converted into 32 individual YAML task files under `.ai/tasks/`.

---

## Mapping Plan

| Source | Action | Target | Reason |
|--------|--------|--------|--------|
| `journal/2026-05-22.md` | move | `.ai/journal/2026/2026-05-22.md` | spec places journals at `.ai/journal/{YYYY}/{date}.md` |
| `journal/2026-05-23.md` | move | `.ai/journal/2026/2026-05-23.md` | spec places journals at `.ai/journal/{YYYY}/{date}.md` |
| `README.md` | keep | — | already a required file per spec |
| `CLAUDE.md` | keep | — | not governed by spec |
| `docs/getting-started.md` | keep | — | `docs/` is an optional folder in spec |
| `docs/overview.md` | keep | — | `docs/` is an optional folder in spec |
| `docs/tasks.md` | keep | — | distinct from `.ai/tasks/` YAML workflow tasks |
| `src/**`, `scripts/**`, `.github/**` | keep | — | application code, not governed by spec |

---

## Files Moved

- `journal/2026-05-22.md` → `.ai/journal/2026/2026-05-22.md` (git mv)
- `journal/2026-05-23.md` → `.ai/journal/2026/2026-05-23.md` (git mv)

---

## Files Archived

None.

---

## Files Created

**Manifests:**
- `.ai/manifests/foundation.yaml`
- `.ai/manifests/context.yaml`
- `.ai/manifests/ownership.yaml`
- `.ai/manifests/agents.yaml`

**Context:**
- `.ai/context/product.md`
- `.ai/context/architecture.md`

**Memory:**
- `.ai/memory/lessons-learned.md`
- `.ai/memory/known-issues.md`
- `.ai/memory/tribal-knowledge.md`

**Standards (copied from foundation v1.1.1):**
- `.ai/standards/coding.md` — created
- `.ai/standards/testing.md` — created
- `.ai/standards/security.md` — created

**Tasks — active (25 files):**
- `.ai/tasks/active/task-001.yaml` through `task-025.yaml`

**Tasks — completed (7 files):**
- `.ai/tasks/completed/task-026.yaml` through `task-032.yaml`

**Root:**
- `AGENTS.md` (folded from `CLAUDE.md` + foundation template)
- `.aiignore`
- `migration-report.md`

---

## Files Deleted

- `CLAUDE.md` — content folded into `AGENTS.md`
- `docs/tasks.md` — content converted to `.ai/tasks/` YAML files

---

## Validation Results

**audit_result: passed | errors: 0 | warnings: 0**

All 47 checks passed. Highlights:

- All 11 required folders present
- All 3 required root files present (AGENTS.md, README.md, .aiignore)
- All 4 manifests valid (foundation, context, ownership, agents)
- `.ai/context/product.md` and `.ai/context/architecture.md` have all required sections
- All 3 memory files have required frontmatter and sections
- All 3 standard files have required sections
- No unknown files in `.ai/`
- No structural drift detected
- All agents in `agents.yaml` are registered in `spec/agent-registry.yaml`

---

## Pending Human Decisions

None. All items resolved.
