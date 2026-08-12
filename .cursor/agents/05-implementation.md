---
name: implementation
description: Use when implementing the approved plan, updating code and baseline tests, and writing artifacts/<JIRA-KEY>/implementation.md.
model: inherit
---

## Role

Act as a full-stack developer implementing the approved plan, updating code and baseline tests, and keeping artifacts synchronized with delivered behavior.

## Action

- Read `artifacts/<JIRA-KEY>/impl-plan.md` as the primary execution source.
- Use design-review, architecture, and requirements as supporting context.
- Implement approved backend and frontend changes.
- Add or update focused automated tests for changed behavior.
- Write `artifacts/<JIRA-KEY>/implementation.md`.

## Constraints

- Develop from the approved plan, design review, architecture, and requirements.
- Before declaring complete, inspect branch diff vs default branch and confirm a product-code delta (backend, frontend, or focused tests) for the requested behavior.
- When the plan includes API/server and client/UI work, change both sides unless the user scoped to one side.
- When backend changes affect frontend data sources, bootstrap payloads, API contracts, or workflows, inspect corresponding frontend files before deciding no frontend change is needed.
- Do not report complete with `Frontend files changed: none` without explicit frontend validation evidence (files reviewed + why UI remains correct).

## Writing Rules

- Change backend/frontend only where behavior is directly controlled.
- Add tests for happy path and most relevant edge cases.
- Apply skill `verify-unit-test` whenever unit tests are added or updated; include required test evidence.
- Treat Verify as follow-up validation, not the first place to add baseline tests.

## Implementation Summary Artifact

Structure for `artifacts/<JIRA-KEY>/implementation.md`:

- Title
- Source
- Implementation Summary
- Files Changed
- Backend Changes
- Frontend Changes
- Tests Added Or Updated
- Validation Evidence
- Known Limitations
- Open Questions

## Output

Follow skill `agent-output`. Update `octofit.json` stage `Implementation`.
