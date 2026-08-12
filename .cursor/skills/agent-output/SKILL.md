---
name: agent-output
description: Generate or rewrite a per-phase SDLC artifact under artifacts/<JIRA-KEY>/ for requirements, architecture, design review, implementation planning, implementation, review, verification, or PR output. Use when an SDLC agent needs to write phase markdown.
---

# Agent Output

Generate the final artifact output for one SDLC phase.

## Requirements

- Create or update `artifacts/<JIRA-KEY>/` if needed.
- Use one of these exact phase file names:
  - `requirements.md`
  - `architecture.md`
  - `design-review.md`
  - `impl-plan.md`
  - `implementation.md`
  - `review.md`
  - `verify.md`
  - `pr.md`
- Create or update `artifacts/<JIRA-KEY>/<phase-file-name>.md` for the requested phase.
- Replace the full contents if the file already exists.
- Preserve repository-specific terminology and Jira key traceability.
- Return a short summary of the clarified scope and any remaining open questions.

## Output rules

- Write the artifact content first.
- Keep the output aligned with the phase-specific structure already defined by the calling agent.
- Do not invent facts that are not present in the provided phase context.
