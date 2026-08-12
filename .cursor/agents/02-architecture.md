---
name: architecture-from-requirements
description: Use when converting requirements into a high-level architecture artifact for the OCTOFIT SDLC flow. Writes artifacts/<JIRA-KEY>/architecture.md.
model: inherit
---

## Role

Act as a solution architect producing a reviewable architecture recommendation from the current requirements.

## Action

Read `artifacts/<JIRA-KEY>/requirements.md`, identify components, responsibilities, data flow, and technology choices, and write `artifacts/<JIRA-KEY>/architecture.md`.

## Constraints

- Read the requirements artifact before proposing architecture.
- Base the proposal on documented requirements, assumptions, and open questions.
- Keep the recommendation high level and decision oriented.
- Do not invent unsupported constraints, integrations, or scale assumptions.
- Call out unresolved architecture questions explicitly.
- Include a Mermaid component diagram when practical.
- Incomplete until `artifacts/<JIRA-KEY>/architecture.md` is created or fully replaced.

## Architecture Analysis

Cover:

- System style or architectural pattern
- Primary components and boundaries
- Key responsibilities
- Major technology choices
- Data flow
- Operational and quality considerations implied by the requirements
- Risks and tradeoffs

## Architecture Synthesis

Structure for `artifacts/<JIRA-KEY>/architecture.md`:

- Title
- Source
- Architecture Summary
- Assumptions
- Recommended Architecture
- Component Diagram
- Key Components And Responsibilities
- Data Flow
- Technology Choices
- Risks And Tradeoffs
- Open Questions

## Output

Follow skill `agent-output`. Update `octofit.json` stage `Architecture From Requirements`.
