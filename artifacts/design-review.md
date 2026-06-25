# Design Review

## Review 2026-06-24

### Source
- Architecture document: `artifact/architecture.md`
- Requirements document: `artifact/requirements.md`
- Jira issue: `OCTOFIT-5`

### Review Summary
The proposed leaderboard architecture fits the OCTOFIT-5 story and stays appropriately small for the current scaffold. The main design question is not whether a leaderboard endpoint should exist, but how to derive a credible ranking from the current activity data without inventing speculative analytics behavior.

### Findings
1. The architecture correctly separates leaderboard request handling, aggregation logic, and persistence concerns.
2. Deriving leaderboard results from the existing activity store is the smallest credible way to satisfy the story without introducing duplicate state.
3. The absence of a provisioned database and authentication context limits production fidelity, but does not block a credible scaffold implementation.

### Risks And Gaps
1. Medium: The story does not define the ranking formula, so the initial leaderboard contract may need revision when product or analytics needs are clarified.
2. Medium: In-memory persistence satisfies scaffold scope only and will not preserve data across restarts.
3. Medium: Downstream consumers may eventually need filtering, historical windows, or richer leaderboard statistics beyond a simple ranking feed.
4. Low: Without session-derived identity, the scaffold must use submitted student names instead of verified user identifiers.

### Agreed Design Decisions
1. Extend the existing Express scaffold with an `/api/leaderboard/` read endpoint derived from the current activity store.
2. Keep leaderboard aggregation in the existing activity service rather than introducing a separate persistence model.
3. Implement only the minimum frontend changes needed to display ranked leaderboard entries and refresh them after successful activity submissions.

### Required Architecture Updates
No further architecture updates are required before implementation. The architecture already captures the deliberate use of activity-derived leaderboard data to satisfy the story in the current workspace.

### Open Questions
1. Should leaderboard totals eventually be time-windowed rather than all-time aggregates?
2. Should downstream consumers receive only the top rankings or the full ranked list by default?
3. What durability and retention expectations apply after the scaffold stage?