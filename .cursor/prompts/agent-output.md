# Agent Output Prompt

Generate the final artifact output for one SDLC phase.

Provide: Jira key, phase name, source content, and target artifact path.

Requirements:

- Create or update `artifacts/<JIRA-KEY>/` if needed
- Exact phase file names only: `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, `implementation.md`, `review.md`, `verify.md`, `pr.md`
- Replace full contents if the file exists
- Preserve terminology and Jira key traceability
- Do not invent facts
- Return a short scope summary and open questions

Prefer skill: `.cursor/skills/agent-output/SKILL.md`
