# Implementation Plan

## Title
OCTOFIT-7 Implementation Plan

## Source
- Requirements document: artifacts/requirements.md
- Architecture document: artifacts/architecture.md
- Design review: artifacts/design-review.md
- Jira issue: OCTOFIT-7

## Planning Summary
OCTOFIT-7 can be delivered in the existing Node.js and Express backend by introducing a dedicated team domain slice for creation and listing, wiring `POST /api/teams/` and a team listing endpoint to the same in-memory repository boundary, and then updating bootstrap composition so existing consumers observe the same persisted team records instead of scaffolded team data. The frontend does not require a new team-creation workflow for this story, but the existing static app should be verified against the updated team source because it already renders team data from the bootstrap payload.

## Delivery Assumptions
- The implementation surface is the existing backend Express app in `backend/src` and the static frontend in `frontend/`.
- The repository currently uses in-memory state for activities and registrations, so OCTOFIT-7 team persistence will follow the same process-lifetime model unless requirements change.
- The team listing capability required by OCTOFIT-7 can be satisfied by a backend listing endpoint and should also feed the existing bootstrap response so frontend team views stay aligned.
- No new frontend team-creation form is required by the story.
- The design review artifact is being treated as the current approved review input even though it does not yet contain OCTOFIT-7-specific findings.

## Priority And Dependency Rules
1. Establish the canonical team contract and listing route before adding implementation code.
2. Create one shared team repository boundary before wiring create and list endpoints.
3. Implement backend service logic before route registration.
4. Update bootstrap composition only after the backend team source is available.
5. Add focused automated tests immediately after each backend slice is wired.
6. Limit frontend work to compatibility validation unless the backend contract forces a UI adjustment.

## Backend Implementation Tasks
Backend stack: Node.js, Express 4, CommonJS modules, `node:test`, `supertest`, in-memory process storage.

1. Finalize the team API contract and canonical listing route
   - Priority: P0
   - Type: Backend
   - Goal: Define the request fields, success payload, validation behavior, and the canonical listing endpoint that satisfies the architecture's unspecified team read path.
   - Dependencies: artifacts/requirements.md, artifacts/architecture.md, artifacts/design-review.md
   - Expected output: A documented implementation decision for `POST /api/teams/` and the team listing route, consistent with existing API response conventions.

2. Create a shared team repository module
   - Priority: P0
   - Type: Backend
   - Goal: Add a dedicated persistence boundary responsible for storing, retrieving, and resetting team records so create and list flows use the same source of truth.
   - Dependencies: Finalize the team API contract and canonical listing route
   - Expected output: A new backend module exposing list, create, and test-reset capabilities for team records.

3. Implement the team service layer
   - Priority: P0
   - Type: Backend
   - Goal: Centralize validation, normalization, identifier assignment, and response shaping for team creation and listing without pushing business logic into Express route handlers.
   - Dependencies: Create a shared team repository module
   - Expected output: A service module that returns API-ready create and list results and preserves the clear separation required by the story.

4. Register team creation and listing routes in the Express app
   - Priority: P0
   - Type: Backend
   - Goal: Expose `POST /api/teams/` and the canonical listing endpoint through `backend/src/app.js`, matching current JSON and status code conventions.
   - Dependencies: Implement the team service layer
   - Expected output: Reachable API routes backed by the new team service.

5. Replace bootstrap scaffold teams with repository-backed teams
   - Priority: P1
   - Type: Backend
   - Goal: Update bootstrap composition so the existing bootstrap `teams` section is derived from the shared team source instead of hard-coded scaffold data.
   - Dependencies: Register team creation and listing routes in the Express app
   - Expected output: `GET /api/bootstrap/` returns teams that remain consistent with the team listing endpoint after successful creation.

6. Add focused backend tests for creation, persistence, and listing
   - Priority: P0
   - Type: Backend
   - Goal: Extend the current `node:test` and `supertest` suite with OCTOFIT-7 coverage for invalid create requests, valid create requests, listing visibility, and bootstrap consistency if bootstrap is updated.
   - Dependencies: Register team creation and listing routes in the Express app, Replace bootstrap scaffold teams with repository-backed teams
   - Expected output: Passing tests that directly cover all OCTOFIT-7 acceptance criteria.

7. Validate route isolation and test reset behavior
   - Priority: P1
   - Type: Backend
   - Goal: Ensure the new in-memory team state can be reset between tests and does not leak across unrelated backend scenarios.
   - Dependencies: Add focused backend tests for creation, persistence, and listing
   - Expected output: Stable repeatable tests with explicit team-state reset hooks.

## Frontend Implementation Tasks
Frontend stack: Static HTML, vanilla JavaScript, CSS, browser `fetch`, bootstrap-driven rendering.

1. Verify that no new frontend creation flow is required for OCTOFIT-7
   - Priority: P0
   - Type: Frontend
   - Goal: Confirm that the story is satisfied by backend API delivery and that the current static frontend only needs compatibility with any updated bootstrap team data.
   - Dependencies: artifacts/requirements.md, artifacts/architecture.md
   - Expected output: A documented decision to keep frontend scope limited unless a backend contract change forces UI updates.

2. Validate bootstrap team rendering against the new backend team source
   - Priority: P1
   - Type: Frontend
   - Goal: Confirm the existing team list rendering in `frontend/app.js` still works when bootstrap teams come from the repository-backed backend source.
   - Dependencies: Replace bootstrap scaffold teams with repository-backed teams
   - Expected output: No frontend code changes or a small compatibility adjustment if the backend team shape changes.

3. Apply minimal UI contract adjustments only if backend payload shape requires them
   - Priority: P2
   - Type: Frontend
   - Goal: Keep the existing teams panel functional without introducing a new story surface.
   - Dependencies: Validate bootstrap team rendering against the new backend team source
   - Expected output: A narrow frontend patch only if required for payload compatibility.

## Shared Integration And Verification Tasks
1. Align the team record shape across create, list, and bootstrap flows
   - Priority: P0
   - Type: Shared
   - Goal: Keep the same team representation across the new endpoints and bootstrap payload so downstream consumers do not see divergent contracts.
   - Dependencies: Implement the team service layer, Replace bootstrap scaffold teams with repository-backed teams
   - Expected output: One consistent team record shape used across backend responses.

2. Run the focused backend test suite for the touched slices
   - Priority: P0
   - Type: Shared
   - Goal: Execute the narrow automated checks that cover teams, bootstrap impact, and regression risk in adjacent routes.
   - Dependencies: Add focused backend tests for creation, persistence, and listing
   - Expected output: Passing `backend` tests for the OCTOFIT-7 slice.

3. Perform end-to-end API verification of the acceptance path
   - Priority: P1
   - Type: Shared
   - Goal: Verify that a valid `POST /api/teams/` request persists a team and that the created record appears in the listing capability and bootstrap data after creation.
   - Dependencies: Run the focused backend test suite for the touched slices
   - Expected output: Manual or scripted evidence that the end-to-end acceptance path works.

4. Confirm rollout readiness for the OCTOFIT-7 scope
   - Priority: P1
   - Type: Shared
   - Goal: Check that the implementation remains scoped to the story, preserves current route behavior, and introduces no unnecessary frontend surface area.
   - Dependencies: Perform end-to-end API verification of the acceptance path
   - Expected output: Review-ready OCTOFIT-7 delivery evidence.

## Blocked Tasks
1. Persistent storage beyond process lifetime
   - Area: Backend
   - Blocked: Yes
   - Reason: The workspace has no database or durable persistence layer provisioned, and the current project pattern is in-memory storage only.

2. Frontend team-creation experience
   - Area: Frontend
   - Blocked: No
   - Reason: Not required by OCTOFIT-7 and should not begin unless a new story expands scope.

3. Advanced team business rules such as uniqueness, ownership, or member limits
   - Area: Shared
   - Blocked: Partially
   - Reason: The requirements and architecture do not define these rules, so implementation should stay minimal until product guidance exists.

## Open Questions
1. What is the canonical team listing route for this repository: a new `GET /api/teams/` endpoint or another existing convention?
2. What fields must a valid team creation request include beyond the team name?
3. Should bootstrap continue exposing the same team card shape currently used by the frontend, or should the shared team contract be adjusted first?
4. Is in-memory team persistence acceptable for OCTOFIT-7 review, given that created teams only need to remain available after the create request completes?

## Backend Planning Status
Ready for implementation.

## Frontend Planning Status
No new feature work required by default; compatibility validation only unless the backend payload contract changes.