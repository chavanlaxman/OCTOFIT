# Design Review

## Review 2026-06-25

### Source
- Architecture document: `artifacts/architecture.md`
- Requirements document: `artifacts/requirements.md`
- Jira issue: `OCTOFIT-6`

### Review Summary
The proposed bootstrap architecture fits OCTOFIT-6 and stays appropriately small for the current scaffold. The main design question is whether the application should introduce a new aggregation boundary instead of overloading route handlers or the existing activity service, and the reviewed design correctly chooses a dedicated bootstrap composition layer.

### Findings
1. The architecture correctly separates bootstrap response composition from request handling and from existing activity and registration domain logic.
2. A single `/api/bootstrap/` response is the smallest credible way to satisfy the entry-view story without forcing the frontend to orchestrate multiple initial requests.
3. Reusing the current domain services while scaffolding teams, challenges, and recommendations keeps scope controlled and avoids unnecessary new persistence models.

### Risks And Gaps
1. Medium: Teams, challenges, and recommendations are scaffolded content rather than durable domain entities, so future stories may require contract changes.
2. Medium: In-memory persistence remains acceptable for the scaffold but does not satisfy restart durability or multi-instance consistency.
3. Medium: The bootstrap payload may grow over time, which could require payload partitioning, caching, or versioning.
4. Low: API base URL configuration is lightweight today and may need stronger environment conventions later.

### Agreed Design Decisions
1. Add a dedicated bootstrap composition service behind `GET /api/bootstrap/`.
2. Reuse registration and activity services as the data sources for users, activities, and leaderboard sections.
3. Allow scaffolded teams, challenges, and recommendations until later stories define dedicated persistence and business rules.
4. Load the entry experience from one bootstrap request using a configurable API base URL on the frontend.

### Required Architecture Updates
No further architecture updates are required before implementation. The architecture already captures the dedicated bootstrap service boundary, the response composition flow, and the frontend base URL requirement needed for OCTOFIT-6.

### Open Questions
1. When should scaffolded teams and challenges be promoted to persistent domain data?
2. Should recommendations remain heuristic or become personalized from richer user context?
3. Does the bootstrap payload need versioning or cache directives in later environments?