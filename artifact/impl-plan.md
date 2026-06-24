# Implementation Plan

## Plan 2026-06-23

### Source
- Architecture document: `artifact/architecture.md`
- Design review: `artifact/design-review.md`
- Requirements document: `artifact/requirements.md`
- Jira issue: `OCTOFIT-4`

### Planning Summary
The implementation can proceed immediately in this repository by extending the existing Express scaffold with an activities service, API routes, focused frontend updates, and automated tests. The core delivery risk is limited to choosing a minimal activity schema that is useful now without implying unapproved analytics behavior.

### Delivery Assumptions
- The existing backend and static frontend in this workspace are the approved implementation surfaces for the story.
- In-memory persistence is acceptable for the scaffold stage because no external data store is provisioned here.
- A simple read endpoint for logged activities is sufficient to satisfy downstream availability in the current workspace.

### Priority And Dependency Rules
1. Implement backend activity contract and persistence before changing the frontend.
2. Add focused automated tests as soon as the backend route exists.
3. Keep frontend work limited to collecting activities and rendering API-backed recent activity results.

### Implementation Tasks
1. Define the activity contract
   - Goal: Choose minimal fields, validation rules, and response shapes for `/api/activities/`.
   - Dependencies: `artifact/requirements.md`, `artifact/architecture.md`, `artifact/design-review.md`
   - Expected output: A concrete backend contract for activity creation and retrieval.

2. Implement backend activity logging
   - Goal: Add validation, persistence, and success or error responses for activity submissions.
   - Dependencies: Define the activity contract
   - Expected output: Backend logic that persists valid activities and rejects invalid ones.

3. Implement downstream activity retrieval
   - Goal: Expose stored activities through a read endpoint for dashboard or leaderboard consumers.
   - Dependencies: Implement backend activity logging
   - Expected output: Backend route that returns persisted activity data.

4. Adapt the frontend scaffold
   - Goal: Replace or repurpose the registration page so a student can submit activity data and see API-backed recent activity results.
   - Dependencies: Implement backend activity logging, Implement downstream activity retrieval
   - Expected output: A working in-repo activity logging UI.

5. Add verification coverage
   - Goal: Extend automated tests to cover invalid activity submission, successful persistence, and downstream retrieval.
   - Dependencies: Implement backend activity logging, Implement downstream activity retrieval
   - Expected output: Focused tests for the story acceptance criteria.

6. Validate release readiness
   - Goal: Run the narrow test suite and inspect the changed surface for story alignment.
   - Dependencies: Add verification coverage, Adapt the frontend scaffold
   - Expected output: Evidence that the OCTOFIT-4 slice is ready for review.

### Blocked Tasks
1. Production-grade persistence
   - Blocked: yes in this repository state
   - Reason: no external database or persistence infrastructure is provisioned in the workspace.

2. Real downstream dashboard or leaderboard integration
   - Blocked: partially
   - Reason: the story requires downstream availability, but this workspace does not contain those consumer applications.

### Open Questions
1. What activity metrics and dimensions do downstream consumers need beyond the scaffold contract?
2. Should the final product scope include editing, deleting, or filtering activities?
3. What durable store should replace the scaffold's in-memory repository?