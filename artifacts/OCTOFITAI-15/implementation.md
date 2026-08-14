# Implementation — OCTOFITAI-15

## Title

Nutrition & Daily Routine Tracker (MVP) — Implementation Summary

## Source

- Jira: [OCTOFITAI-15](https://laxmanchavan2080.atlassian.net/browse/OCTOFITAI-15)
- Requirements: `artifacts/OCTOFITAI-15/requirements.md`
- Architecture: `artifacts/OCTOFITAI-15/architecture.md`
- Design review: `artifacts/OCTOFITAI-15/design-review.md`
- Implementation plan: `artifacts/OCTOFITAI-15/impl-plan.md`

## Implementation Summary

Delivered end-to-end MVP Nutrition & Daily Routine Tracker:

- Backend REST CRUD for `/api/nutrition/` and `/api/routine/` with service validation, DELETE `204`, list requiring `userId` + `date` (`400` when missing), and CORS allowing `PUT`/`DELETE`.
- Persistence defaults to JSON under `backend/data/`; switches to MongoDB when `OCTOFIT_STORAGE=mongo` and `MONGODB_URI` are set. Same REST contract for both stores.
- Frontend main nav **Nutrition & Routine**, dedicated view with date/user controls, create/edit forms, daily lists, edit/delete, and view-local status messaging.
- Backend AC8 unit/integration tests for both resources; repo-root Playwright smoke (`test:e2e`) for AC9.

## Files Changed

### Backend

- `backend/src/app.js` — CORS PUT/DELETE; nutrition/routine routes
- `backend/src/storage/storageConfig.js` — `OCTOFIT_STORAGE`, `MONGODB_URI`, `OCTOFIT_DATA_DIR`
- `backend/src/storage/jsonFileStore.js` — JSON load/save
- `backend/src/storage/mongoStore.js` — Mongo client/collection helper
- `backend/src/nutritionRepository.js`
- `backend/src/routineRepository.js`
- `backend/src/nutritionService.js`
- `backend/src/routineService.js`
- `backend/test/nutrition.test.js`
- `backend/test/routine.test.js`
- `backend/data/.gitkeep`
- `backend/package.json` — added `mongodb`

### Frontend

- `frontend/index.html` — nav, `#nutrition-routine-view`, forms, daily lists, Playwright ids
- `frontend/app.js` — view switcher, validation, API helpers, list/edit/delete wiring
- `frontend/styles.css` — nav + tracker layout styles

### Shared / E2E

- `.gitignore` — `backend/data/*.json`, Playwright artifacts, root `node_modules`
- `package.json` — root `test:e2e` script
- `playwright.config.js` — repo-root Playwright + backend `webServer`
- `e2e/nutrition-routine.spec.js` — AC9 smoke

## Backend Changes

| Area | Behavior |
|------|----------|
| CORS | `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS` |
| Nutrition API | `POST/GET /api/nutrition/`, `PUT/DELETE /api/nutrition/:id` |
| Routine API | `POST/GET /api/routine/`, `PUT/DELETE /api/routine/:id` |
| List filters | Require `userId` + `date`; otherwise `400` field errors |
| Delete | `204` empty body |
| Validation | Meal type enum; description required; sleep 0–24; water/steps non-negative; optional macros/calories non-negative |
| Identity | Explicit `userId` on payloads/queries (no auth middleware) |
| Cardinality | Multiple nutrition and routine entries per user/date |
| Persistence | JSON default (`backend/data/*.json`); Mongo when configured |
| List response keys | `nutritionEntries`, `routines` |

## Frontend Changes

### Frontend impact analysis (explicit)

1. **Main navigation** — Added top-of-shell nav with **Home** (`#nav-home`) and **Nutrition & Routine** (`#nav-nutrition-routine`).
2. **Dedicated view** — `#nutrition-routine-view` toggled visible; bootstrap/activity surface `#bootstrap-view` hidden while on tracker.
3. **Date / user controls** — `#nutrition-routine-date` defaults to today; `#nutrition-routine-user-id` seeded from bootstrap users when available (fallback `1`).
4. **Forms** — Static `#nutrition-form` and `#routine-form` with client validation and field-error nodes; edit via hidden `#nutrition-edit-id` / `#routine-edit-id`.
5. **Daily lists** — `#nutrition-daily-list` / `#routine-daily-list` with empty states; per-row Edit/Delete; reload after mutations and on date/user change.
6. **Status UX** — View-local `#nutrition-routine-status` (global `#status` remains on Home).
7. **Playwright surface** — Stable ids on nav, date, userId, form fields, submit buttons, and list containers.

Frontend files changed: `frontend/index.html`, `frontend/app.js`, `frontend/styles.css`.

## Tests Added Or Updated

### Backend unit/integration (AC8)

| File | Coverage |
|------|----------|
| `backend/test/nutrition.test.js` | create valid; reject invalid (no persist); update; delete `204`; list by user/date; list missing params `400` |
| `backend/test/routine.test.js` | create valid; reject invalid (no persist); update; delete `204`; list by user/date; list missing params `400` |

### Playwright smoke (AC9)

| File | Coverage |
|------|----------|
| `e2e/nutrition-routine.spec.js` | Open nav → create Nutrition + Routine for today → assert both appear in daily lists |

## Validation Evidence

### Unit test evidence (verify-unit-test)

- **Tests Added Or Updated:** `backend/test/nutrition.test.js`, `backend/test/routine.test.js`
- **Behavior Covered:** Valid create (`201`); invalid reject (`400` + field errors, no persist); update (`200` + persisted change); delete (`204` + absent from list); list filtered by `userId` + `date` for both nutrition and routine
- **Edge Cases Covered:** Missing list `userId`/`date` → `400`; invalid meal type/description/calories; sleep out of bounds; negative water; non-integer steps; cross-user and cross-date exclusion from list filters
- **Command Run:** `cd backend && npm test`
- **Execution Result:** PASS — 33 tests, 0 failed (includes prior activity/registration/team suites + 12 new nutrition/routine tests)
- **Remaining Gaps:** Mongo adapter path not exercised in default suite (requires live `MONGODB_URI`); no dedicated frontend unit tests (covered by Playwright smoke for happy path)

### How to run tests

```bash
# Backend unit/integration (AC8)
cd backend
npm test

# Playwright smoke (AC9) — starts backend via webServer
cd ..   # repo root
npm install
npx playwright install chromium   # once per machine
npm run test:e2e
```

### Env vars

| Variable | Purpose |
|----------|---------|
| `OCTOFIT_STORAGE` | `json` (default) or `mongo` |
| `MONGODB_URI` | Required when `OCTOFIT_STORAGE=mongo` |
| `OCTOFIT_DATA_DIR` | Optional override for JSON data directory (used by tests) |
| `PORT` | Backend port (default `3000`) |

### Playwright execution

- **Command:** `npm run test:e2e` (repo root)
- **Result:** PASS — 1 passed

## Known Limitations

- Aggregate daily calorie/step totals are out of MVP (lists only).
- No food DB/search, barcode, recommendations, or social sharing.
- No auth middleware; clients supply `userId` explicitly.
- Optional GET-by-id omitted; edit hydrates from list-row payload.
- Mongo mode is implemented but not covered by the default automated suite.
- Activity/team/registration stores remain in-memory (not migrated to JSON/Mongo).

## Open Questions

None blocking. Implementer choices locked as:

1. List keys: `nutritionEntries` and `routines`.
2. Optional GET-by-id skipped.
3. Playwright `webServer` auto-starts backend from repo root.
