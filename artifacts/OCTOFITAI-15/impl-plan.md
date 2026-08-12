# Implementation Plan — OCTOFITAI-15

## Title

Nutrition & Daily Routine Tracker (MVP) — Implementation Plan

## Source

- Requirements: `artifacts/OCTOFITAI-15/requirements.md`
- Architecture: `artifacts/OCTOFITAI-15/architecture.md`
- Design review: `artifacts/OCTOFITAI-15/design-review.md`
- Jira: [OCTOFITAI-15](https://laxmanchavan2080.atlassian.net/browse/OCTOFITAI-15)
- Repo grounding: `backend/src/app.js`, `activityService.js`, `teamRepository.js`, `teamService.js`, `backend/test/activities.test.js`, `frontend/index.html`, `frontend/app.js`, `frontend/styles.css`, `backend/package.json`, root `.gitignore`

## Planning Summary

Deliver additive Nutrition and Routine CRUD behind sibling REST resources (`/api/nutrition/`, `/api/routine/`), with service-layer validation matching activity/team field-error style, and a swappable JSON-default / Mongo persistence layer used only by these repositories. Frontend adds a top-level **Nutrition & Routine** nav, a dedicated `#nutrition-routine-view` (date control, forms, daily lists, edit/delete, view-local status), and `buildApiUrl` fetch helpers. Verification covers AC8 backend tests (create valid, reject invalid, update, delete, list by user+date for both resources) and AC9 Playwright smoke at repo root. Design-review locks are binding: DELETE → `204`; list requires `userId` + `date` or `400`; MVP daily summary = lists; CORS includes `PUT`/`DELETE`; Playwright prefers repo root.

## Delivery Assumptions

- Explicit `userId` on create/list; no auth middleware.
- Multiple Nutrition and Routine entries per user/date allowed.
- Default store is JSON under `backend/data/` (create-on-write); Mongo only when `OCTOFIT_STORAGE=mongo` + `MONGODB_URI`.
- Unit/integration tests force JSON with injectable/temp file paths and `resetNutrition` / `resetRoutine` helpers.
- Optional GET-by-id may be omitted if edit hydrates from list-row payload.
- Aggregate calorie/step totals are out of MVP (lists only).
- Existing activity/team/registration in-memory stores are not migrated.
- Forms live primarily in static HTML with stable `id`s for Playwright; JS handles submit/list/edit wiring (acceptable alternative: JS-built forms if the same ids are set).

## Priority And Dependency Rules

1. Foundational persistence + CORS before routes.
2. Backend services/repos + routes before FE API client.
3. Backend AC8 tests before declaring API ready for FE integration.
4. FE nav/view/forms/lists after API contract is wired (can start markup in parallel once paths/fields are fixed).
5. Playwright smoke after FE selectors and backend are runnable end-to-end.
6. Docs/gitignore/release notes last.

Task IDs below are ordered dependency-first, then priority within a wave.

---

## Backend Implementation Tasks

### BE-1 — Expand CORS for PUT/DELETE

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | None |
| Area | backend |
| Files | `backend/src/app.js` |
| Work | Change `Access-Control-Allow-Methods` from `GET,POST,OPTIONS` to include `PUT` and `DELETE` (e.g. `GET,POST,PUT,DELETE,OPTIONS`). Keep OPTIONS → `204`. |
| Completion signal | Preflight/OPTIONS and middleware allow PUT/DELETE; existing GET/POST routes unchanged. |
| Blocked | — |

### BE-2 — Persistence scaffolding (JSON default + Mongo switch)

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | None (parallel with BE-1) |
| Area | backend |
| Files (create) | `backend/src/storage/storageConfig.js` (read `OCTOFIT_STORAGE`, `MONGODB_URI`); `backend/src/storage/jsonFileStore.js` (load/save collection by path); optional `backend/src/storage/mongoStore.js` or inline mongo adapter later; `backend/data/.gitkeep` |
| Files (change) | root `.gitignore` — add `backend/data/*.json` (keep `.gitkeep`); `backend/package.json` — add `mongodb` dependency only when implementing mongo path |
| Work | Single store-selection helper: default/`json` → file under `backend/data/` (`nutrition.json`, `routine.json`); `mongo` → collections `nutrition` / `routine` requiring `MONGODB_URI`. Create-on-write for JSON. Support injectable file path / base dir for tests. |
| Completion signal | Config returns active mode; JSON round-trip write/read works in isolation; mongo mode documents required env. |
| Blocked | — |

### BE-3 — Nutrition repository port + adapters

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | BE-2 |
| Area | backend |
| Files (create) | `backend/src/nutritionRepository.js` (or `backend/src/repositories/nutritionRepository.js`) |
| Work | Contract: `create`, `getById` (optional export), `update`, `delete`, `listByUserAndDate(userId, date)`, `resetNutrition()` for tests. Fields: `id`, `userId`, `date`, `mealType`, `description`, optional `calories`/`protein`/`carbs`/`fat`, `createdAt`, `updatedAt`. JSON adapter persists full collection; Mongo adapter uses same document shape and `{ userId, date }` filter. Id allocation stable for scaffold (numeric increment or equivalent). |
| Completion signal | Repository CRUD + list filter works against JSON; `resetNutrition` clears store for tests. |
| Blocked | — |

### BE-4 — Routine repository port + adapters

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | BE-2 |
| Area | backend |
| Files (create) | `backend/src/routineRepository.js` (or `backend/src/repositories/routineRepository.js`) |
| Work | Same contract as nutrition for routine fields: `id`, `userId`, `date`, `sleepHours`, `waterIntake`, `steps`, `createdAt`, `updatedAt`. `resetRoutine()` for tests. No unique(userId,date) constraint. |
| Completion signal | Repository CRUD + list filter works against JSON; reset helper available. |
| Blocked | — |

### BE-5 — Nutrition service (validation + orchestration)

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | BE-3 |
| Area | backend |
| Files (create) | `backend/src/nutritionService.js` |
| Work | Mirror `activityService` / `teamService` result shape `{ statusCode, body }`. Validate: required `userId`, `date` (`YYYY-MM-DD`), `mealType` ∈ Breakfast/Lunch/Dinner/Snack, non-empty trimmed `description`; optional calories/macros non-negative numbers when present. Operations: create → `201` + `{ status:'success', nutrition }`; update → `200` + success body or `404`; delete → `{ statusCode: 204 }` with no JSON body; list → require query `userId`+`date` else `400` field errors; success list `200` + `{ status:'success', nutritionEntries: [...] }` (or `nutrition` array — pick one name and keep consistent). Server validation is authoritative. |
| Completion signal | Invalid payloads never call persist; valid create/update/delete/list return locked statuses including DELETE `204`. |
| Blocked | — |

### BE-6 — Routine service (validation + orchestration)

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | BE-4 |
| Area | backend |
| Files (create) | `backend/src/routineService.js` |
| Work | Same response conventions as nutrition. Validate: required `userId`, `date`, `sleepHours` (0–24 inclusive), `waterIntake` (≥ 0), `steps` (non-negative integer). Create/update/delete/list with DELETE `204` and list requiring `userId`+`date`. |
| Completion signal | Validation and status codes match architecture locks. |
| Blocked | — |

### BE-7 — Wire REST routes in Express

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | BE-1, BE-5, BE-6 |
| Area | backend |
| Files | `backend/src/app.js` |
| Work | Register: |
| | `POST /api/nutrition/`, `GET /api/nutrition/` (query filters), `PUT /api/nutrition/:id`, `DELETE /api/nutrition/:id` |
| | `POST /api/routine/`, `GET /api/routine/` (query filters), `PUT /api/routine/:id`, `DELETE /api/routine/:id` |
| | Optional `GET .../:id` only if cheap. Map service `statusCode`/`body`; for `204` send empty body (`response.status(204).end()`). Trailing slash on collection paths to match `/api/activities/`. |
| Completion signal | All CRUD endpoints respond via supertest against `createApp()`. |
| Blocked | — |

### BE-8 — Backend unit/integration tests (AC8)

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | BE-7 |
| Area | backend |
| Files (create) | `backend/test/nutrition.test.js`, `backend/test/routine.test.js` |
| Files (change) | Existing tests’ `beforeEach` may also call `resetNutrition`/`resetRoutine` if shared app state could leak; force `OCTOFIT_STORAGE=json` and temp data dir if needed |
| Work | For **both** resources, cover: create valid → 201; reject invalid → 400 + field errors (no persist); update → 200 and persisted change; delete → **204** and absent from subsequent list; list by `userId`+`date` returns only matching rows; list missing `userId` and/or `date` → **400**. Prefer `node:test` + `supertest` like `activities.test.js`. Mongo adapter tests optional when URI present — not required to green the default suite. |
| Completion signal | `cd backend && npm test` passes including new nutrition/routine suites (AC8). |
| Blocked | — |

---

## Frontend Implementation Tasks

### FE-1 — Main nav + view shell

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | None (markup can start once API paths locked; wire after BE-7 for live data) |
| Area | frontend |
| Files | `frontend/index.html`, `frontend/styles.css`, `frontend/app.js` |
| Work | Add top-of-shell nav with a control labeled **Nutrition & Routine** (stable id e.g. `#nav-nutrition-routine`). Add dedicated section `#nutrition-routine-view` (initially hidden). Show/hide switcher: selecting nav reveals Nutrition view and de-emphasizes/hides bootstrap/activity primary surface (`#bootstrap-view` wrap existing hero content or toggle classes). Keep a way to return to bootstrap (e.g. “Home” / “Leaderboard” nav) without building a full SPA router. |
| Completion signal | Nav visible; click opens dedicated view without deep link (FR-01 / AC1). |
| Blocked | — |

### FE-2 — Date control, userId control, view-local status

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | FE-1 |
| Area | frontend |
| Files | `frontend/index.html`, `frontend/app.js`, `frontend/styles.css` |
| Work | Date input `#nutrition-routine-date` defaulting to today (`YYYY-MM-DD`). MVP `userId` control (`#nutrition-routine-user-id` text/number or select seeded from bootstrap users when available). Add **view-local** status region `#nutrition-routine-status` (design-review: global `#status` sits in hero and can be hidden). Reuse `setStatus`-style messaging for success/error. |
| Completion signal | Changing date/`userId` is available in the dedicated view; status remains visible when Nutrition view is active. |
| Blocked | — |

### FE-3 — Nutrition form (create/edit) + client validation

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | FE-2 |
| Area | frontend |
| Files | `frontend/index.html`, `frontend/app.js`, `frontend/styles.css` |
| Work | Form `#nutrition-form`: meal type select (Breakfast/Lunch/Dinner/Snack), description, optional calories/protein/carbs/fat; field-error nodes (e.g. `#mealType-error`). Client validation for required/enum/non-negative optionals; edit mode reuses form (hidden `#nutrition-edit-id`). Stable ids for Playwright. |
| Completion signal | Invalid client submit blocked with field errors; valid submit ready for API wiring (FE-5). |
| Blocked | — |

### FE-4 — Routine form (create/edit) + client validation

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | FE-2 |
| Area | frontend |
| Files | `frontend/index.html`, `frontend/app.js`, `frontend/styles.css` |
| Work | Form `#routine-form`: sleep hours, water intake (label ml), steps; field errors; edit via `#routine-edit-id`. Client bounds: sleep 0–24, water ≥ 0, steps non-negative integer. |
| Completion signal | Client validation matches FR-13–FR-17 UX; form ready for API wiring. |
| Blocked | — |

### FE-5 — API client helpers + daily lists + edit/delete

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | BE-7, FE-3, FE-4 |
| Area | frontend |
| Files | `frontend/app.js`, `frontend/index.html` |
| Work | Extend `buildApiUrl`/`fetch` helpers for: |
| | `GET/POST /api/nutrition/`, `PUT/DELETE /api/nutrition/:id` |
| | `GET/POST /api/routine/`, `PUT/DELETE /api/routine/:id` |
| | Always pass `userId` + `date` on lists and creates. Lists: `#nutrition-daily-list`, `#routine-daily-list` with empty states; per-row Edit/Delete (confirm or clear destructive control consistent with scaffold simplicity). Reload both lists on view open, date/`userId` change, and after successful mutation. Surface API `errors` and non-OK responses on view-local status — no silent failures. MVP daily summary = these lists (no totals required). |
| Completion signal | Full create/edit/delete + refresh-safe daily lists for selected date (FR-02–FR-19, AC2–AC6). |
| Blocked | Blocked until BE-7 exposes routes (helpers can be stubbed earlier). |

### FE-6 — Playwright-stable selector pass

| Field | Value |
|-------|-------|
| Priority | P1 |
| Dependencies | FE-5 |
| Area | frontend |
| Files | `frontend/index.html`, `frontend/app.js` |
| Work | Ensure stable ids/roles on: nav, date, userId, nutrition form fields + submit, routine form fields + submit, both daily lists and list item text. Prefer `id` attributes over brittle CSS. |
| Completion signal | Smoke can target elements without scraping layout classes. |
| Blocked | — |

---

## Shared Integration And Verification Tasks

### SH-1 — Gitignore + data directory hygiene

| Field | Value |
|-------|-------|
| Priority | P1 |
| Dependencies | BE-2 |
| Area | shared |
| Files | `.gitignore`, `backend/data/.gitkeep` |
| Work | Ignore runtime `backend/data/*.json`; commit empty dir via `.gitkeep`; document create-on-write in BE README note if present (optional one-liner in backend package description or existing docs only if already touched). |
| Completion signal | Runtime JSON files are not staged; store still creates files on first write. |
| Blocked | — |

### SH-2 — End-to-end manual smoke (dev)

| Field | Value |
|-------|-------|
| Priority | P1 |
| Dependencies | BE-8, FE-5 |
| Area | shared |
| Work | Start backend (`npm start` in `backend/`), open UI, use nav → create Nutrition + Routine for today → edit → delete → refresh and confirm persistence (JSON default). Spot-check CORS PUT/DELETE if FE is served cross-origin. |
| Completion signal | Happy path matches AC1–AC6 manually. |
| Blocked | — |

### SH-3 — Playwright project bootstrap (repo root)

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | FE-6 (selectors); BE-7 running server |
| Area | shared |
| Files (create) | `playwright.config.js` (or `.ts`) at **repo root**; `e2e/nutrition-routine.spec.js` (or `tests/e2e/...`); root `package.json` with script **`test:e2e`** (`npx playwright test`) and `@playwright/test` devDependency |
| Work | Prefer repo-root layout per design review. Configure `baseURL` to backend static serve (e.g. `http://localhost:3000`). Keep scope to smoke only — not a full suite. Document that backend must be running (or use Playwright `webServer` pointing at `backend` start). |
| Completion signal | `npm run test:e2e` from repo root is defined and launches Playwright. |
| Blocked | — |

### SH-4 — Playwright smoke (AC9)

| Field | Value |
|-------|-------|
| Priority | P0 |
| Dependencies | SH-3, FE-5, BE-8 |
| Area | shared |
| Files | `e2e/nutrition-routine.spec.js` (or under `tests/e2e/`) |
| Work | Flow: open app → click **Nutrition & Routine** nav → set/ensure today + userId → create one Nutrition entry → create one Routine entry → assert both appear in daily lists. No barcode/search/social coverage. |
| Completion signal | Smoke passes (AC9 / FR-29). |
| Blocked | — |

### SH-5 — Docs / release readiness notes

| Field | Value |
|-------|-------|
| Priority | P2 |
| Dependencies | BE-8, SH-4 |
| Area | shared |
| Work | Capture for implementer/PR: env vars `OCTOFIT_STORAGE`, `MONGODB_URI`; DELETE `204`; list filter requirements; how to run `backend` tests and root `test:e2e`. Prefer PR body / `implementation.md` later — do not invent new markdown docs unless already required by pipeline. |
| Completion signal | Implementation phase has clear runbooks for AC8/AC9. |
| Blocked | — |

---

## Blocked Tasks

| Task | Blocked reason | Unblock when |
|------|----------------|--------------|
| FE-5 (live API wiring) | Needs REST routes | BE-7 complete |
| SH-4 (Playwright smoke) | Needs UI + API + config | FE-5, BE-7, SH-3 complete |
| Optional Mongo adapter tests | Needs live `MONGODB_URI` | Available in CI/dev; not required for default JSON suite |

No pipeline blockers remain from design review.

---

## Open Questions

Resolved in this plan:

1. **Playwright npm script** → `test:e2e` at repository root (`npx playwright test`).
2. **`backend/data/*.json`** → gitignore + create-on-write; commit `backend/data/.gitkeep` only.
3. **Form construction** → Prefer static HTML forms with stable ids; JS wires events (JS-built forms allowed if same ids).

Remaining non-blocking (implementer choice):

1. Exact list response key names (`nutritionEntries` vs `nutrition`) — pick one and use consistently in FE + tests.
2. Whether optional GET-by-id is implemented — skip if edit uses list-row payload.
3. Whether Playwright `webServer` auto-starts backend or docs require a separate terminal.

---

## Implementation Readiness Notes

- Design review verdict was **approve-with-findings**; findings are folded into BE-1 (CORS), BE-2–BE-4 (dual-store guardrails), FE-1/FE-2 (nav + view-local status), SH-3/SH-4 (repo-root Playwright).
- Suggested delivery waves:
  1. BE-1 → BE-2 → BE-3/BE-4 → BE-5/BE-6 → BE-7 → BE-8
  2. FE-1 → FE-2 → FE-3/FE-4 → FE-5 → FE-6 (FE markup parallel after paths locked)
  3. SH-1 anytime after BE-2; SH-3 → SH-4 after FE-5; SH-2/SH-5 to close
- Out of scope must stay out: food DB/search, barcode, recommendations, social sharing, activity/team persistence migration, aggregate daily totals.
- Ready for `@implementation` once this plan is accepted and stage marked succeed.

### Task count

| Area | Tasks |
|------|-------|
| Backend | 8 (BE-1 … BE-8) |
| Frontend | 6 (FE-1 … FE-6) |
| Shared / verification | 5 (SH-1 … SH-5) |
| **Total** | **19** |
