# Requirements for OCTOFIT-5

## Title
Show student leaderboard rankings

## Source
- Jira issue: OCTOFIT-5
- Browse link: https://laxmanchavan2080.atlassian.net/browse/OCTOFIT-5

## Story Summary
The system must allow a student to view leaderboard rankings so that progress can be compared with other students using the latest tracked activity data.

## Assumptions
- The leaderboard ranks students using tracked activity data already persisted by the existing activity logging scaffold.
- The current story scope is limited to leaderboard retrieval and display, not new authentication or registration behavior.
- In-memory activity persistence remains acceptable for the scaffold stage because no durable data store is provisioned in this workspace.
- The story does not define a ranking formula, so the scaffold can rank students by cumulative activity duration with deterministic tie-breaking.

## Functional Requirements
1. The system shall provide leaderboard retrieval through `/api/leaderboard/`.
2. The system shall return leaderboard data that includes ranking information suitable for display.
3. The system shall derive leaderboard rankings from the latest tracked activity data available in the current application store.
4. The system shall aggregate tracked activity data at the student level for leaderboard display.
5. The system shall order leaderboard entries deterministically so equal totals do not produce unstable ranking output.
6. The system shall keep the leaderboard data contract readable by downstream dashboard or reporting consumers.
7. The system shall allow the in-repo frontend to render the leaderboard rankings from the API response.

## Non-Functional Requirements
1. Reliability: The leaderboard shall reflect newly logged activities without requiring application restart or manual recomputation.
2. Reliability: The leaderboard response shall preserve a consistent JSON shape when no activities have been logged.
3. Security: The leaderboard response shall avoid exposing internal implementation details beyond student-facing ranking data.
4. Usability: The leaderboard output shall be understandable without requiring consumers to infer the rank ordering logic from raw activity events.
5. Extensibility: The leaderboard data contract shall support future dashboard or reporting consumers without relying on frontend-only state.

## Open Questions
1. Should the product ranking formula stay based on cumulative duration, or should it use points, streaks, or activity-specific weights?
2. Do downstream consumers need filtering windows such as weekly or monthly leaderboards?
3. Should students see only top performers or the full ranked list by default?
4. What durable storage and recalculation behavior are required after the scaffold stage?