# Design Review — OCTOFITAI-15

## Title

Nutrition & Daily Routine Tracker (MVP) — Design Review

## Source

- Architecture: `artifacts/OCTOFITAI-15/architecture.md`
- Requirements: `artifacts/OCTOFITAI-15/requirements.md`
- Jira: [OCTOFITAI-15](https://laxmanchavan2080.atlassian.net/browse/OCTOFITAI-15)
- Repo grounding: `backend/src/app.js` (CORS `GET,POST,OPTIONS` only; no PUT/DELETE today), in-memory `teamRepository` / `activityService`, service field-error shape, static `frontend/index.html` + `frontend/app.js` (`buildApiUrl` / `#status` / no main nav), `backend/package.json` (`node --test` + supertest), no Playwright config in repo

## Review Summary

**Verdict: approve-with-findings**

The architecture is implementable and aligned with OCTOFITAI-15 requirements and existing Express + static-frontend patterns. Sibling REST resources, service-layer validation, explicit `userId`, JSON-default / Mongo-switched persistence, and an additive FE nav + dedicated view are sound MVP choices. Frontend impact analysis is adequate for planning. Findings below are clarifications and accepted tradeoffs—not blockers for implementation planning. Minor architecture document fixes from this review are applied in `architecture.md`.

## Findings

### Must-fix-now (before or at start of implementation planning)

None that block the pipeline. Architecture is sufficient to plan and implement.

Document hygiene corrected in architecture during this review:

1. Stray trailing `)` removed from Open Questions.
2. Previously open MVP decisions locked (delete status, daily-summary meaning, list filter validation, Playwright layout preference, GET-by-id optional).

### Important (address in impl plan / implementation; not pipeline blockers)

1. **CORS and first mutating verbs** — `app.js` today allows only `GET,POST,OPTIONS`. PUT/DELETE for nutrition/routine will fail cross-origin until `Access-Control-Allow-Methods` is expanded. Same-origin static serving from Express may mask this in happy-path local smoke; still required for consistency with the scaffold’s CORS middleware.
2. **Persistence is greenfield** — Current repositories are in-memory only. JSON file + Mongo adapters are new surface area. Keep a single repository contract, prefer injectable file path / forced `json` in unit tests, and avoid spreading dual-store logic into services or `app.js`.
3. **Frontend shell has no nav today** — Introducing a top-level nav + show/hide view is correct for FR-01 but is a UX change to the single hero shell. Keep one nav control and one dedicated `#nutrition-routine-view`; do not refactor the whole page into a multi-route SPA.
4. **Shared `#status` placement** — Global `#status` sits above the activity form inside the hero. Nutrition/Routine mutations need actionable feedback (NFR-04). Impl plan should either reuse a visible global status when the Nutrition view is active or add a view-local status region so errors are not hidden when the bootstrap surface is de-emphasized.
5. **Playwright greenfield** — No Playwright config or root frontend package exists. Smoke (FR-29) needs project bootstrap, stable selectors/ids, and a runnable script; scope must stay to create-one-nutrition + create-one-routine-for-today + assert daily lists.

### Minor / informational

1. **Trailing-slash style** — Collection paths with trailing slash (`/api/nutrition/`, `/api/routine/`) match `/api/activities/` and `/api/teams/`. Item paths without trailing slash (`/api/nutrition/:id`) are acceptable; join uses a trailing slash on a nested action path—no need to force `:id/` unless Express routing tests require it.
2. **Optional GET-by-id** — Not required if edit hydrates from the list-row payload already loaded in the UI.
3. **Daily “summary” vs aggregates** — Requirements emphasize listing entries for the selected date. Summing calories/steps is optional and out of MVP unless time remains; lists satisfy AC4/AC9.

## Risks And Gaps

| Priority | Risk / gap | Must-fix-now vs accepted | Mitigation |
|----------|------------|--------------------------|------------|
| High | Dual JSON/Mongo implementations drift | Accepted tradeoff with guardrails | Shared repository interface; unit tests on JSON path; Mongo adapter tests optional when URI present |
| High | JSON file write races | Accepted for MVP | Single Node process assumption; document limitation |
| Medium | No auth; spoofable `userId` | Accepted (scaffold parity with free-text activity identity) | Explicit `userId` on create/list; no middleware in MVP |
| Medium | Playwright setup cost / flake | Must address in impl, not architecture blocker | Minimal smoke; stable `id`s on nav, date, forms, list rows; prefer repo-root e2e layout |
| Medium | FE view switcher hides activity `#status` | Gap to close in impl plan | View-local or always-visible status for Nutrition & Routine |
| Low | Multiple routine rows per day | Accepted product tradeoff | CRUD symmetry; uniqueness/upsert deferred |
| Low | Activities/teams remain in-memory | Accepted scope boundary | Do not expand persistence rewrite in this story |
| Low | Mongo driver dependency only for mongo mode | Accepted | Add `mongodb` only when implementing mongo path; default JSON stays dependency-light |

**Frontend impact analysis confirmation:** Adequate.

Architecture’s “Frontend impact (explicit)” section covers navigation, dedicated view, forms, daily lists with edit/delete, `buildApiUrl` fetch helpers, validation/status UX, Playwright selectors, and MVP `userId` control—matching requirements Frontend Impact Analysis items 1–6. Repo check confirms no existing nav (stacked sections only), so the planned nav + section switcher is necessary and correctly scoped. Out-of-scope FE features are excluded.

## Agreed Design Decisions

1. **REST shape** — Sibling resources `/api/nutrition/` and `/api/routine/` with query list filters; no parent daily-tracker aggregate.
2. **Identity** — Explicit required `userId` on create and on list queries; prefer registration/bootstrap account `id` when available; no session/JWT.
3. **Routine cardinality** — Unlimited routine entries per user per date (same as nutrition).
4. **Persistence switch** — `OCTOFIT_STORAGE=json|mongo` (default `json`); `MONGODB_URI` required for mongo; identical REST contract.
5. **Delete responses** — Use **`204` No Content** for successful DELETE on both resources.
6. **List filters** — `userId` and `date` (`YYYY-MM-DD`) both required for list endpoints; missing/invalid → **`400`** with field errors.
7. **GET by id** — Optional helper; MVP edit UX may use in-memory list-row data + PUT by id.
8. **Daily summary UI** — MVP = date-scoped Nutrition list + Routine list (and forms); aggregate totals are optional enhancement, not required.
9. **Frontend** — Static HTML/JS view switcher; labeled **Nutrition & Routine** nav; dedicated section with date control, both forms, daily lists, edit/delete; reuse field-error patterns.
10. **CORS** — Expand allow-methods to include `PUT` and `DELETE`.
11. **Playwright layout preference** — Repository-root Playwright config + `e2e/` (or `tests/e2e/`) smoke; keep backend `node --test` for API unit tests. Exact npm script name left to impl plan.
12. **Validation** — Server authoritative; client UX aid only; meal types enum Breakfast/Lunch/Dinner/Snack; sleep 0–24; water ≥ 0; steps non-negative integer; optional macros/calories non-negative when present.
13. **Out of scope** — Food DB/search, barcode, recommendations, social sharing remain unimplemented.

## Required Architecture Updates

Applied in `artifacts/OCTOFITAI-15/architecture.md` as part of this review:

1. Removed document typo (stray `)`).
2. Locked delete status to `204`.
3. Stated list missing `userId`/`date` → `400`.
4. Clarified daily summary = lists for MVP (aggregates optional).
5. Marked GET-by-id optional for edit UX.
6. Recorded Playwright repo-root preference.
7. Noted FE status visibility concern for the view switcher.

No structural redesign required (layers, REST sibling resources, storage switch, and FE approach remain as proposed).

## Open Questions

Non-blocking; resolve during implementation planning if needed:

1. Exact npm script name for Playwright smoke (e.g. `test:e2e` at repo root).
2. Whether `backend/data/*.json` runtime files are gitignored vs committed empty seeds (prefer gitignore + create-on-write).
3. Whether Nutrition/Routine forms live fully in static HTML or are partially built in JS like the activity contract-driven form—either is fine if selectors stay stable for Playwright.
