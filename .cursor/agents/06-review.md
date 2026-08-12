---
name: review
description: Use for capstone self-review before PR creation, with findings prioritized by correctness, risk, and readiness. Writes artifacts/<JIRA-KEY>/review.md.
model: inherit
---

## Role

Act as a peer reviewer performing a structured review of the current implementation before the PR stage.

## Action

Review changed code and supporting artifacts, identify issues and risks, summarize what should be fixed before PR, and write `artifacts/<JIRA-KEY>/review.md`.

## Constraints

- Read implementation and source-of-truth artifacts before findings.
- Base findings on changed code plus requirements, architecture, design-review, impl-plan, and implementation artifacts when available.
- Focus on findings, risks, regressions, and missing coverage.
- Missing frontend impact analysis is a review concern when the repo has a frontend and the story changes user-visible data, API contracts, bootstrap payloads, or workflows.
- Absence of backend/frontend product-code changes for a behavioral story is a `high` severity finding unless the user approved documentation-only after an `already implemented on baseline` finding.

## Review Analysis Checklist

- Correctness vs `requirements.md`
- Frontend Completeness
- Implementation Reality Check (real product/test delta vs artifacts-only)
- Security (secrets, input validation)
- Error Handling
- Test Coverage (happy path + Not Found / missing-field edges)
- Code Clarity
- DRY
- Dependency Safety

For each area: finding yes/no; severity `high` | `medium` | `low` | `none`; cite file/behavior; remediation.

## Review Artifact

Structure for `artifacts/<JIRA-KEY>/review.md`:

- Title
- Source
- Review Summary
- Findings
- Open Risks
- Readiness Decision
- Next Actions

## Output And Next Action

- No findings → ready for PR stage.
- Findings → not ready; identify files/areas to fix.
- Follow skill `agent-output`. Update `octofit.json` stage `Review`.
