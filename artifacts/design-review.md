# Design Review

## Title
OCTOFIT-10 Design Review

## Source
- Architecture document: artifacts/architecture.md
- Requirements document: artifacts/requirements.md
- Jira issue: OCTOFIT-10

## Review Summary
The proposed OCTOFIT-10 architecture is appropriately narrow and uses the right local control points. It adds the join command at the team service boundary instead of duplicating state mutation in Express handlers, and it explicitly accounts for the client-consumed read surfaces that must reflect joined state. The main review concern is consistency across the account store and team store during the same operation, but the design keeps that risk small for the current in-memory scaffold.

## Findings
1. Centering the story on `POST /api/teams/:teamId/join/` aligns directly with the Jira acceptance criteria.
2. Coordinating the write in the team service is the correct design because the route itself does not own the business rules for membership or cross-store mutation.
3. Extending the registration service to hold team association fields is necessary if the system is expected to prove that the student was actually associated with the selected team rather than only incrementing aggregate team state.
4. Reusing `GET /api/teams/` and `GET /api/bootstrap/` as the post-join evidence surfaces is the correct way to satisfy the requirement that subsequent team-related data reflect the join result.
5. The frontend impact analysis is adequate: no new UI path is required, but additive bootstrap data and updated team member counts must remain compatible with the existing client.

## Risks And Gaps
1. Medium: The join write touches both account data and team data, so implementation must enforce a clear mutation order and avoid partial updates on validation failures.
2. Medium: There is still no durable storage boundary, so team membership remains process-local and will be lost on restart.
3. Low: The story does not specify the join request body shape, so the `accountId` choice is an implementation assumption that should be captured in tests and returned responses.
4. Low: The current frontend does not render user team affiliation, so bootstrap proof will exist in data even if the UI does not visibly expose the new fields yet.

## Agreed Design Decisions
1. `POST /api/teams/:teamId/join/` is the canonical join endpoint for OCTOFIT-10.
2. The team service shall own validation, membership rules, and response shaping for joins.
3. The registration service shall persist `teamId` and `teamName` on joined student accounts.
4. The team repository shall increment the selected team's `memberCount` on a successful first-time join.
5. Frontend scope remains validation-only unless contract compatibility fails.

## Required Architecture Updates
1. None. The current architecture is implementation-ready for OCTOFIT-10.

## Open Questions
1. Should a future story expose joined team membership visibly in the frontend user list?
2. Should future storage work derive member counts from explicit team membership rows rather than mutating a numeric aggregate?