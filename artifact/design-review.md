# Design Review

## Review 2026-06-23

### Source
- Architecture document: `artifact/architecture.md`
- Requirements document: `artifact/requirements.md`
- Jira issue: `OCTOFIT-3`

### Review Summary
The proposed layered registration architecture is a pragmatic fit for the current scope and aligns with the stated requirement to expose student registration through `/api/users/register/`. The main risks are not structural complexity, but missing product and policy decisions that directly affect validation rules, post-registration behavior, and security controls.

### Findings
1. The architecture correctly separates request handling, validation, account creation, and persistence concerns.
2. The design keeps validation ahead of persistence, which is appropriate for registration workflows.
3. Several critical behaviors remain under-specified, especially the registration data model and post-registration outcome.

### Risks And Gaps
1. High: The exact registration fields are undefined, so the validation boundary, persistence schema, and API contract cannot yet be finalized.
2. High: Post-registration behavior is unresolved, which affects session handling, UX flow, and possible downstream integration requirements.
3. Medium: Password, identity, consent, and privacy obligations are not defined, so security and compliance controls may be incomplete.
4. Medium: Error response structure is described at a high level, but the architecture does not yet define a canonical validation error format.

### Agreed Design Decisions
1. Keep the layered architecture with a dedicated validation service in front of account creation.
2. Retain `/api/users/register/` as the intake endpoint for the registration flow.
3. Treat the registration schema and post-registration flow as explicit follow-up decisions that must be resolved before implementation is complete.

### Required Architecture Updates
No architecture file changes are required yet. The current architecture already records the major open questions and risks that need resolution before implementation hardens the contract.

### Open Questions
1. Which student registration fields are mandatory, optional, and system-generated?
2. What is the required post-registration behavior: account creation only, auto-login, email confirmation, redirect, or another flow?
3. What password, consent, identity verification, or privacy rules must the registration flow enforce?
4. What canonical validation error payload should the API return?