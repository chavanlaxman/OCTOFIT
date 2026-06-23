# Design Review

## Review 2026-06-23

### Source
- Architecture document: `artifact/architecture.md`
- Requirements document: `artifact/requirements.md`
- Jira issue: `OCTOFIT-4`

### Review Summary
The proposed activity logging architecture fits the OCTOFIT-4 story and stays appropriately small for the current scaffold. The main design question is not the layered structure, but how much downstream-read capability to provide now so the implementation credibly supports dashboard or leaderboard consumers without overbuilding speculative analytics features.

### Findings
1. The architecture correctly separates API handling, activity validation, persistence, and downstream retrieval concerns.
2. Using the same activity service for both create and read paths is a sensible way to satisfy the downstream availability acceptance criterion in this repository.
3. The absence of a provisioned database and authentication context limits production fidelity, but does not block a credible scaffold implementation.

### Risks And Gaps
1. Medium: The story does not define exact activity fields, so the initial contract may need revision when product analytics needs are clarified.
2. Medium: In-memory persistence satisfies scaffold scope only and will not preserve data across restarts.
3. Medium: Downstream consumers may eventually need filtering, sorting, or aggregation beyond a raw activity feed.
4. Low: Without session-derived identity, the scaffold must use explicit activity ownership fields or a simplified student role model.

### Agreed Design Decisions
1. Extend the existing Express scaffold with an `/api/activities/` create endpoint and a read endpoint for downstream consumption.
2. Keep validation in a dedicated service before persistence.
3. Implement only the minimum frontend changes needed to exercise activity logging and display stored activity records from the API.

### Required Architecture Updates
No further architecture updates are required before implementation. The architecture already captures the deliberate use of an API-readable activity store to satisfy downstream availability in the current workspace.

### Open Questions
1. Which additional activity fields, if any, are needed for leaderboard or dashboard calculations?
2. Should downstream consumers receive all activities or user-scoped subsets by default?
3. What durability and retention expectations apply after the scaffold stage?