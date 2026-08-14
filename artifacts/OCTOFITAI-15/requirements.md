# Requirements — OCTOFITAI-15

## Title

Add Nutrition & Daily Routine Tracker feature (MVP)

## Source

- Jira: [OCTOFITAI-15](https://laxmanchavan2080.atlassian.net/browse/OCTOFITAI-15)
- Summary: Add Nutrition & Daily Routine Tracker feature (MVP)
- Status: To Do
- Priority: Medium
- Intake: Story description and acceptance criteria provided for requirements drafting (Atlassian MCP retrieval already completed upstream)

## Story Summary

Deliver an MVP Nutrition & Daily Routine Tracker so users can log meals and daily wellness metrics for a selected date, view a daily summary, and edit or delete entries with backend persistence. The UI exposes a dedicated “Nutrition & Routine” page reachable from the main navigation. Persistence uses a backend REST API with JSON storage by default and MongoDB when configured. Scope includes basic FE/BE validation, error handling, backend unit tests, and a Playwright smoke that creates and verifies one Nutrition and one Routine entry for today. Out of scope: nutrition food database/search, barcode scanning, recommendations, and social sharing.

## Assumptions

- Entries are scoped to a user identity (user id or equivalent student/user key) consistent with existing OctoFit patterns so list-by-date/user acceptance criteria are testable; full production authentication is not required for MVP if the scaffold continues to use an explicit user identifier on requests/payloads.
- Multiple Nutrition entries may exist for the same date and user (e.g., several snacks).
- Multiple Routine entries may exist for the same date and user unless implementation chooses a single-row-per-day model; acceptance criteria require create/edit/delete and listing all routine entries for the selected date, so create+list semantics must support at least one persisted routine record per day.
- Water intake is a non-negative numeric value; unit label is display-only (default assumed: milliliters) and does not require unit conversion in MVP.
- Sleep hours reasonable bounds for validation: greater than or equal to 0 and less than or equal to 24.
- Steps must be a non-negative integer (or whole-number numeric) greater than or equal to 0.
- Calories and macros (protein/carbs/fat) on Nutrition entries are optional; when provided they must be non-negative numbers.
- “Selected date” defaults to today in the UI and is changeable via a date control; Playwright smoke uses today.
- JSON file/default persistence is the default backend store; MongoDB is used only when explicitly configured (environment/config flag), with the same REST contract for both backends.
- Existing registration, activity, team, and bootstrap features remain available; this story adds a new feature surface rather than replacing them.

## Technical Constraints

- Backend: extend the existing Express API in `backend/` with REST CRUD for nutrition and routine resources.
- Persistence: JSON by default; MongoDB when configured — no change to public API contract between stores.
- Frontend: static OctoFit UI (`frontend/`) must add navigation and a dedicated Nutrition & Routine page/view with forms and daily summary (see Frontend Impact Analysis).
- Validation and errors: basic client- and server-side validation; API returns appropriate HTTP status codes and clear error payloads for invalid input and failed operations.
- Automated verification:
  - Backend tests covering create valid, reject invalid, update, delete, and list by date/user for both nutrition and routine.
  - Playwright smoke covering create one Nutrition + one Routine for today and verify they appear in the daily view.
- Out of scope must not be implemented: nutrition DB/search, barcode, recommendations, social sharing.

## Functional Requirements

### Navigation and daily view

| ID | Requirement | Traceability |
|----|-------------|--------------|
| FR-01 | The main UI shall expose a navigation item labeled **Nutrition & Routine** that opens the dedicated Nutrition & Routine page/view. | AC1 |
| FR-02 | The Nutrition & Routine page shall allow the user to select a calendar date for viewing and editing entries; the selected date shall drive the daily summary and create operations. | AC2, AC3, AC4 |
| FR-03 | The daily view shall list all Nutrition entries and all Routine entries for the selected date (and scoped user). | AC4, AC9 |
| FR-04 | After create, edit, or delete, the daily view shall reflect the updated set of entries without requiring a full application restart; data shall remain after page refresh (persisted via backend). | AC5, AC6 |

### Nutrition logging

| ID | Requirement | Traceability |
|----|-------------|--------------|
| FR-05 | The user shall be able to add a Nutrition entry for the selected date with required fields: meal type and description. | AC2 |
| FR-06 | Meal type shall be one of: Breakfast, Lunch, Dinner, Snack. | Story scope |
| FR-07 | Description shall be a non-empty text value after trim. | AC2 |
| FR-08 | The user may optionally supply calories and macros (protein, carbs, fat); omitted optional fields shall not block create/update. | Story scope |
| FR-09 | When optional calories/macros are provided, the system shall reject non-numeric or negative values with clear validation errors. | AC2, AC7 |
| FR-10 | Client and server shall reject Nutrition create/update when meal type or description is missing/invalid, without persisting the invalid payload. | AC2, AC8 |
| FR-11 | The user shall be able to edit an existing Nutrition entry; changes shall persist and remain visible after refresh. | AC5 |
| FR-12 | The user shall be able to delete an existing Nutrition entry; removal shall persist and remain reflected after refresh. | AC5 |

### Daily routine logging

| ID | Requirement | Traceability |
|----|-------------|--------------|
| FR-13 | The user shall be able to add a Routine entry for the selected date with required fields: sleep hours, water intake, and steps. | AC3 |
| FR-14 | Sleep hours shall be numeric and within reasonable bounds (assumed 0–24 inclusive). | AC3 |
| FR-15 | Water intake shall be numeric and non-negative. | AC3 |
| FR-16 | Steps shall be numeric (whole number) and non-negative. | AC3 |
| FR-17 | Client and server shall reject Routine create/update when required fields are missing or fail numeric/bounds validation, without persisting the invalid payload. | AC3, AC8 |
| FR-18 | The user shall be able to edit an existing Routine entry; changes shall persist and remain visible after refresh. | AC6 |
| FR-19 | The user shall be able to delete an existing Routine entry; removal shall persist and remain reflected after refresh. | AC6 |

### Backend REST API

| ID | Requirement | Traceability |
|----|-------------|--------------|
| FR-20 | The backend shall expose REST CRUD endpoints for Nutrition entries (create, read/list, update, delete). | AC7 |
| FR-21 | The backend shall expose REST CRUD endpoints for Routine entries (create, read/list, update, delete). | AC7 |
| FR-22 | List operations shall support filtering by date and user (per acceptance criteria). | AC8 |
| FR-23 | Successful create shall return an appropriate success status (e.g., 201) with the created resource representation. | AC7 |
| FR-24 | Successful update/delete/list shall return appropriate success statuses (e.g., 200/204 as chosen consistently) with clear response bodies where applicable. | AC7 |
| FR-25 | Invalid input shall return client-error status (e.g., 400) with field-level or message errors usable by the UI. | AC7, AC8 |
| FR-26 | Requests for missing resources on update/delete shall return not-found status (e.g., 404). | AC7 |
| FR-27 | Persistence shall store Nutrition and Routine data via JSON by default and via MongoDB when that store is configured, without changing the REST contract. | Story scope |

### Automated tests

| ID | Requirement | Traceability |
|----|-------------|--------------|
| FR-28 | Backend automated tests shall cover: create valid Nutrition and Routine; reject invalid Nutrition and Routine; update; delete; list by date/user. | AC8 |
| FR-29 | A Playwright smoke test shall create one Nutrition entry and one Routine entry for today and verify both appear in the daily view. | AC9 |

## Non-Functional Requirements

| ID | Category | Requirement | Traceability |
|----|----------|-------------|--------------|
| NFR-01 | Usability | Nutrition & Routine navigation and page labeling shall be clear and discoverable from the main UI without requiring deep links. | AC1 |
| NFR-02 | Reliability | Persisted Nutrition and Routine data shall survive page refresh and process restart for the active persistence backend (JSON file or MongoDB). | AC5, AC6, Story scope |
| NFR-03 | Data integrity | Server-side validation is authoritative; client validation is a UX aid and must not be the only gate. | AC2, AC3, AC7 |
| NFR-04 | Error handling | API and UI shall surface actionable error feedback for validation and failed operations (no silent failures on create/edit/delete). | Story scope |
| NFR-05 | Testability | Backend unit tests and Playwright smoke shall be runnable as part of verification for this story. | AC8, AC9 |
| NFR-06 | Scope control | MVP shall not include nutrition food database/search, barcode scanning, recommendations, or social sharing. | Story out of scope |

## Frontend Impact Analysis

This story has direct, user-visible frontend impact beyond API wiring:

1. **Main navigation**
   - Add a user-visible nav item labeled **Nutrition & Routine**.
   - Selecting it must navigate to (or reveal) the dedicated feature page/view from the current main UI shell.

2. **Dedicated page/view**
   - New Nutrition & Routine surface (page or primary view section) distinct from activity logging / leaderboard bootstrap panels.
   - Includes date selection for the daily context.

3. **Forms**
   - Nutrition form: meal type, description, optional calories/macros; client-side required-field validation with error display.
   - Routine form: sleep hours, water intake, steps; client-side numeric/bounds validation with error display.
   - Support create and edit flows (edit may reuse the same form pattern).

4. **Daily view / summary**
   - List Nutrition entries for the selected date.
   - List Routine entries for the selected date.
   - Per-entry edit and delete actions with confirmation or clear destructive affordance as consistent with existing UI patterns.
   - Refresh-safe: lists load from backend so persisted changes remain after reload.

5. **Error and status UX**
   - Show validation and API errors for failed create/update/delete.
   - Show success/status feedback consistent with existing OctoFit status patterns where applicable.

6. **Automation surface**
   - UI elements used by Playwright smoke (nav, forms, daily list) must be stable enough to create and verify today’s Nutrition and Routine entries.

No frontend work is required for out-of-scope features (food DB/search UI, barcode, recommendations, social sharing).

## Questions Asked And Answers Received

No blocking clarifying questions were required; story description and acceptance criteria were sufficient to draft MVP requirements.

Documented product assumptions (not answered by Jira text; used to keep requirements testable):

| Topic | Assumed default | Impact if changed later |
|-------|-----------------|-------------------------|
| Sleep hours bounds | 0–24 inclusive | Adjust validation rules and tests |
| Water unit | Numeric milliliters (label only) | Display copy / optional unit field |
| Steps | Non-negative whole number | Validation rule |
| User scoping | Explicit user identifier on entries/API (scaffold-compatible; no full auth required) | Auth design and list filters |
| Routine cardinality | Allow listing all routine entries for a date (at least one creatable record per day) | Data model uniqueness constraints |

Open questions (non-blocking for architecture start; resolve during design/implementation if needed):

1. Should there be at most one Routine record per user per date, or unlimited routine logs?
2. Exact REST path naming and whether Nutrition/Routine share a parent “daily tracker” resource?
3. Exact MongoDB configuration switch name/env var (to align with any existing ops conventions)?
