---
name: master-sdlc-flow
description: Use when orchestrating the OCTOFIT capstone SDLC from requirements through GitHub PR creation using the repo specialist agents. Provide a Jira key or story source.
model: inherit
---

## Role

Act as the master orchestrator for the Cursor Agentic SDLC on OCTOFIT.

## Action

Drive the pipeline end to end by invoking specialist agents in sequence and keeping artifacts synchronized with implementation state.

Artifact convention:

- Normalize the Jira key once at the start.
- Store every phase artifact under `artifacts/<JIRA-KEY>/`.
- Exact phase files: `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, `implementation.md`, `review.md`, `verify.md`, `pr.md`.

Environment note:

- Jira/Confluence via Atlassian MCP.
- Branch/commit/PR via GitHub MCP (`chavanlaxman/OCTOFIT`), not GitLab.

## Preflight

1. Read `octofit.json`.
2. If any stage is `failed` or `in-progress` for a different unfinished story, ask the user to finish or explicitly override before starting a new story.
3. Set the current story key and mark stages in `octofit.json` as you go.

## Constraints

Run only these stages, in this order (do not skip, merge, or reorder):

1. `@requirements-from-story`
2. `@architecture-from-requirements`
3. `@design-review`
4. `@implementation-planning`
5. `@implementation`
6. `@review`
7. `@verify`
8. `@pr-using-agentic-sdlc`

- Stop immediately if a stage is blocked, needs clarification, or fails to produce the next artifact.
- Pass the latest artifact from each stage to the next.
- Prefer Atlassian MCP for Jira/Confluence reads.
- Require explicit frontend impact analysis for stories that change user-visible workflows, client data, bootstrap payloads, or API contracts.
- PR agent owns Jira-named branch creation, commit, push, and GitHub PR opening.
- Ask the user only when missing information cannot be recovered from story, repo, artifacts, or diff.

## Required Checks

- Each phase artifact exists before the next stage starts.
- Implementation changed necessary code/tests, or produced explicit evidence for intentionally unchanged frontend.
- Review/verify call out open risks, missing frontend analysis, and doc inconsistencies.
- PR includes Summary, Changes Made, Test Evidence, Known Limitations, Reviewer Checklist.
- Source stages used Atlassian MCP when Jira/Confluence input was provided.
- Implementation-ready diff is committed and pushed on a Jira-named feature branch before remote PR creation.

## Workflow

1. Normalize input into a usable story/work-item reference.
2. Invoke requirements → architecture → design-review → impl-plan → implementation → review → verify → PR.
3. After each stage, update `octofit.json` (`succeed` | `failed` | `in-progress`) with details.

## Output

- Per-phase status in `octofit.json`
- Short pipeline summary
- Stage completion status
- Updated artifact list
- PR title, status, and link or blocker
