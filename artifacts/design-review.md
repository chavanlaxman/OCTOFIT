# Design Review

## Title
OCTOFIT-8 Design Review

## Source
- Architecture document: artifacts/architecture.md
- Requirements document: artifacts/requirements.md
- Jira issue: OCTOFIT-8

## Review Summary
The proposed architecture is appropriately small for OCTOFIT-8 and keeps the team listing flow behind a clean route-service-repository boundary. The main design risk for this story is not route selection but contract drift between the new `GET /api/teams/` response and the frontend-facing team data already exposed by the application, so implementation must make client compatibility explicit.

## Findings
1. The architecture aligns with the story by centering the solution on `GET /api/teams/` and returning available team records from the application's team data source.
2. Reusing the existing team repository boundary is the correct choice because it avoids introducing a second source of truth for team data.
3. The architecture correctly calls out frontend impact even though the acceptance criteria are phrased as API behavior, because the story explicitly requires a response format usable by the React frontend.
4. The primary implementation risk is response-shape inconsistency between the new list endpoint and any existing bootstrap teams consumed by the frontend.

## Risks And Gaps
1. Medium: The requirements do not define the exact team fields needed by the frontend, so the implementation could satisfy the endpoint contract while still breaking UI rendering if the shape differs from current frontend expectations.
2. Medium: If the endpoint reads from a repository but bootstrap continues using hard-coded or differently shaped team data, the application will expose inconsistent client-facing team collections.
3. Low: The story does not define filtering rules for what counts as an available team, so the implementation should avoid inventing extra business logic beyond returning the current team records.

## Agreed Design Decisions
1. The canonical endpoint for OCTOFIT-8 is `GET /api/teams/`.
2. The endpoint should read from the existing team repository or store rather than from hard-coded route-local data.
3. The API response should follow the backend's established JSON envelope style with a top-level `status` field and a team collection payload.
4. Frontend compatibility must be closed either by updating the frontend or by validating that current frontend files remain correct against the delivered team shape.

## Required Architecture Updates
1. Explicitly state that bootstrap team data must remain contract-compatible with `GET /api/teams/` when both are consumed by the frontend.
2. Narrow the architecture scope to team retrieval only and remove any residual create-flow framing.

## Open Questions
1. Which frontend files currently consume or render team data for student selection?
2. Does the existing team repository already return a display-ready team shape, or is service-layer mapping required?
3. Should bootstrap and `GET /api/teams/` share the exact same team object shape, or is a compatible projection sufficient?