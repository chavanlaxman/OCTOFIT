# Implementation Plan

## Title
OCTOFIT-10 Implementation Plan

## Source
- Requirements document: artifacts/requirements.md
- Architecture document: artifacts/architecture.md
- Design review: artifacts/design-review.md
- Jira issue: OCTOFIT-10

## Planning Summary
OCTOFIT-10 should be delivered by extending the current in-memory team and account model with one explicit join command. The implementation should stay local to the route, team service, team repository, registration service, and focused tests. The frontend scope remains validation-only because the current UI has no join control, but the bootstrap contract must still prove that joined state is reflected for clients.

## Delivery Assumptions
- The implementation surface is the existing Express backend in `backend/src` and the existing static frontend in `frontend/`.
- The join contract will use `accountId` in the request body as the API-facing student identifier.
- The team listing endpoint and bootstrap payload remain the primary downstream evidence surfaces for joined state.
- Frontend files should remain unchanged unless additive bootstrap fields break current client assumptions.
- In-memory persistence remains acceptable for the story.

## Priority And Dependency Rules
1. Implement the join contract in the service layer before broadening any read-model changes.
2. Keep route handlers thin and move all membership rules into the team service.
3. Add targeted tests immediately after the join flow is wired.
4. Validate frontend compatibility from the existing `frontend/app.js` rendering path before deciding whether frontend edits are necessary.
5. Refresh SDLC artifacts and test evidence after executable validation succeeds.

## Backend Implementation Tasks
Backend stack: Node.js, Express 4, CommonJS modules, `node:test`, `supertest`, in-memory process storage.

1. Add account lookup and team-assignment support in the registration service
   - Priority: P0
   - Type: Backend
   - Goal: Persist student team association fields and expose the account lookup needed by the join command.
   - Dependencies: artifacts/requirements.md, artifacts/architecture.md, artifacts/design-review.md
   - Expected output: Registration service functions that can read an account by id, assign team membership once, and expose joined state through list/bootstrap consumers.

2. Extend the team repository with targeted join-state mutation support
   - Priority: P0
   - Type: Backend
   - Goal: Allow the selected team's member count to increase on a successful join without changing unrelated list or create behavior.
   - Dependencies: Add account lookup and team-assignment support in the registration service
   - Expected output: Repository functions that can fetch a team by id and increment `memberCount` for the chosen team.

3. Implement `POST /api/teams/:teamId/join/` in the app and team service
   - Priority: P0
   - Type: Backend
   - Goal: Validate identifiers, enforce single-team membership, coordinate the account/team mutation, and return a stable success or error envelope.
   - Dependencies: Extend the team repository with targeted join-state mutation support
   - Expected output: Working join endpoint that satisfies all OCTOFIT-10 acceptance criteria.

4. Keep downstream team-related reads synchronized
   - Priority: P0
   - Type: Backend
   - Goal: Ensure `GET /api/teams/` and `GET /api/bootstrap/` expose the updated team count and joined account association after a successful join.
   - Dependencies: Implement `POST /api/teams/:teamId/join/` in the app and team service
   - Expected output: Unchanged read endpoints that automatically reflect joined state from shared sources.

## Frontend Implementation Tasks
Frontend stack: Static HTML, vanilla JavaScript, CSS, browser `fetch`, bootstrap-driven rendering.

1. Validate the existing team-rendering contract in `frontend/app.js`
   - Priority: P0
   - Type: Frontend
   - Goal: Confirm that the current client still only depends on `name`, `memberCount`, and `focus`, so updated counts remain compatible.
   - Dependencies: artifacts/requirements.md, artifacts/architecture.md
   - Expected output: Explicit evidence that the team list UI does not require code changes for this story.

2. Validate additive bootstrap user fields for compatibility
   - Priority: P0
   - Type: Frontend
   - Goal: Confirm that adding `teamId` and `teamName` to bootstrap users does not break the current rendering path because those fields are ignored by existing DOM code.
   - Dependencies: Validate the existing team-rendering contract in `frontend/app.js`
   - Expected output: Frontend remains unchanged with documented compatibility evidence.

## Shared Integration And Verification Tasks
1. Add focused API tests for the join contract
   - Priority: P0
   - Type: Shared
   - Goal: Cover missing account id, unknown team id, successful join, duplicate join rejection, and post-join read consistency.
   - Dependencies: Implement `POST /api/teams/:teamId/join/` in the app and team service
   - Expected output: Passing tests that directly prove all OCTOFIT-10 acceptance criteria.

2. Run the backend test suite for the touched slice
   - Priority: P0
   - Type: Shared
   - Goal: Execute backend tests after the OCTOFIT-10 updates.
   - Dependencies: Add focused API tests for the join contract
   - Expected output: Passing local test evidence for registration, team, bootstrap, and join behavior.

3. Refresh the HTML unit test evidence
   - Priority: P1
   - Type: Shared
   - Goal: Keep `artifacts/unit-test-report.html` synchronized with the latest local backend test execution.
   - Dependencies: Run the backend test suite for the touched slice
   - Expected output: Updated HTML summary for OCTOFIT-10 test evidence.

4. Prepare review and PR evidence
   - Priority: P1
   - Type: Shared
   - Goal: Capture frontend impact validation, remaining limitations, and branch readiness after implementation and tests succeed.
   - Dependencies: Refresh the HTML unit test evidence
   - Expected output: Review-ready OCTOFIT-10 delivery evidence.

## Blocked Tasks
1. Process-independent team durability
   - Area: Backend
   - Blocked: Yes
   - Reason: The repository still uses in-memory storage only.

2. New frontend join workflow
   - Area: Frontend
   - Blocked: No
   - Reason: Not required by OCTOFIT-10 and intentionally excluded from scope.

## Open Questions
1. Should a later story allow a student to leave or switch teams?
2. Should a later durable data model represent explicit team memberships rather than only account association plus aggregate counts?

## Implementation Readiness Notes
Backend: Ready for focused implementation and contract verification.

Frontend: Validation required even if no frontend files change because the story updates client-consumed bootstrap data.