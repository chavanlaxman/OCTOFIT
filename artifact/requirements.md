# Requirements for OCTOFIT-4

## Title
Allow students to log activities

## Source
- Jira issue: OCTOFIT-4
- Browse link: https://laxmanchavan2080.atlassian.net/browse/OCTOFIT-4

## Story Summary
The system must allow a student to log a fitness activity so that the activity can be tracked within OctoFit and made available to downstream dashboard or leaderboard experiences.

## Assumptions
- The story scope is limited to activity logging and data availability, not registration or authentication changes.
- The current scaffold can use an application-defined activity schema because the story does not prescribe exact fields.
- Downstream dashboard or leaderboard availability can be satisfied in this repository by exposing persisted activity data through an API that other consumers can read.
- The current workspace does not include a dedicated dashboard or leaderboard implementation, so this stage can only provide the backend contract those consumers would use.

## Functional Requirements
1. The system shall provide an activity logging capability through `/api/activities/`.
2. The system shall accept the activity fields required by the application-defined activity model.
3. The system shall validate submitted activity data before persistence.
4. The system shall persist a valid activity in the configured data store.
5. The system shall return a success response when activity logging completes successfully.
6. The system shall reject invalid activity submissions without persisting them.
7. The system shall return clear validation feedback for invalid activity submissions.
8. The system shall make logged activities available through an application-readable interface for downstream dashboard or leaderboard views.
9. The system shall associate persisted activities with the student role expected by the current OctoFit scaffold.

## Non-Functional Requirements
1. Security: The system shall validate and sanitize activity input before persistence or downstream processing.
2. Security: The system shall avoid exposing internal implementation details in validation and error responses.
3. Reliability: The system shall persist only validated activities and leave stored activity data unchanged when validation fails.
4. Usability: The system shall provide clear success indication when an activity is logged.
5. Usability: The system shall provide actionable field-level validation feedback when activity submission fails.
6. Extensibility: The activity data contract shall be structured so downstream dashboard or leaderboard consumers can read logged activities without depending on frontend-only state.

## Open Questions
1. Which activity attributes are mandatory beyond the minimal scaffold fields?
2. Should activity logging support editing or deleting previously logged activities?
3. What aggregation or filtering shape do downstream dashboard or leaderboard views require?
4. Are there audit, privacy, or retention rules for stored activity data?