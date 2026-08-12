# OCTOFIT — Cursor Agent Guide

This repository uses **Cursor** for the Agentic SDLC.

## Before starting a new story

1. Read `octofit.json`.
2. If any stage is `failed` or `in-progress`, resume from `@master-sdlc-flow` for that story — do not start a new story.
3. Only start a new story when all stages are `succeed` (or the user explicitly overrides).

## Canonical layout

| Purpose | Path |
|--------|------|
| Always-on project guidance | `AGENTS.md`, `.cursor/rules/` |
| SDLC subagents | `.cursor/agents/` |
| Reusable skills | `.cursor/skills/` |
| Prompt templates | `.cursor/prompts/` |
| Slash commands | `.cursor/commands/` |
| Hooks | `.cursor/hooks.json`, `.cursor/hooks/` |
| Phase artifacts | `artifacts/<JIRA-KEY>/` |
| Pipeline status | `octofit.json` |

## Master entrypoint

Invoke **`@master-sdlc-flow`** (or ask to run the master SDLC flow) with a Jira key such as `OCTOFITAI-22`.

Stage order (do not skip or reorder):

1. `@requirements-from-story`
2. `@architecture-from-requirements`
3. `@design-review`
4. `@implementation-planning`
5. `@implementation`
6. `@review`
7. `@verify`
8. `@pr-using-agentic-sdlc`

## Integrations

- **Jira / Confluence:** Atlassian MCP (`user-atlassian`)
- **Branches / commits / PRs:** GitHub MCP (`user-github`) against `chavanlaxman/OCTOFIT`
- **Local git:** allowed for branch inspection; prefer GitHub MCP for remote PR creation
