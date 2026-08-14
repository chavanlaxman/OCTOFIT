# OctoFit Capstone Scaffold

This repository contains the evolving OctoFit capstone scaffold used to deliver Jira-driven stories through an Agentic SDLC workflow. It currently includes the earlier registration and activity logging flows, the bootstrap-driven entry experience, and the OCTOFIT-10 team creation, listing, and join backend slice.

## Project Structure

- `backend/`: Express API, registration flow, activity logging flow, bootstrap aggregation, team creation, listing, and join services, and automated tests.
- `frontend/`: Static OctoFit UI that renders bootstrap data, activity forms, leaderboard views, team data, Nutrition & Routine, and the Daily Tracker panel.
- `artifacts/`: Current story requirements, architecture, design review, and implementation planning documents.

## Run Locally

Install backend dependencies and start the server:

```powershell
cd backend
npm install
npm start
```

The app listens on `http://localhost:3000` by default.

## Test

Run the backend test suite:

```powershell
cd backend
npm.cmd test
```

## Current Registration Behavior

- Exposes the registration endpoint at `/api/users/register/`.
- Validates and sanitizes registration input before persistence.
- Persists valid user accounts in memory for downstream consumers.
- Reflects joined team association in downstream account data after a successful team join.

## Current Activity Logging Behavior

- Exposes the activity logging endpoint at `/api/activities/`.
- Publishes an activity contract at `/api/activities/contract`.
- Validates and sanitizes activity input before persistence.
- Returns clear field-level validation errors for invalid submissions.
- Persists valid activities in memory and exposes them through `GET /api/activities/` for downstream consumers.

## Current Team Behavior

- Exposes the team creation endpoint at `/api/teams/`.
- Exposes the canonical team listing endpoint at `/api/teams/`.
- Exposes the team join endpoint at `/api/teams/:teamId/join/`.
- Validates and sanitizes team input before persistence.
- Persists created teams in memory through a dedicated repository boundary and reuses that same source for listing and bootstrap responses.
- Associates registered students to existing teams and reflects successful joins in team member counts and bootstrap data.

## Current Bootstrap Behavior

- Exposes the bootstrap endpoint at `/api/bootstrap/`.
- Aggregates users, teams, activities, challenges, leaderboard data, recommendations, and an additive `dailyEntries` array into a single response.
- `dailyEntries` is an array of persisted Daily Tracker rows (empty when none exist). Nutrition and routine records stay out of bootstrap.
- Reuses the same persisted team source for both team listing and bootstrap rendering.
- Includes additive user team-association fields when a registered student has joined a team.

## Current Daily Tracker Behavior

- Exposes Daily Tracker CRUD at `/api/daily-entries/` (`POST`/`GET` collection, `PUT`/`DELETE` by id).
- Persists one entry per `userId` + calendar `date`; duplicate creates return HTTP 409.
- List requires `userId`. Omitted `days` uses the last 7 local calendar days including today; a `date` query wins over `days`.
- The static frontend adds a Daily Tracker nav item and panel beside Home and Nutrition & Routine.
- The panel hydrates the selected date and chooses `POST` vs `PUT` from a hidden edit id. After writes it refreshes from `GET /api/daily-entries/`.

## Retained Scaffold Behavior

- Earlier scaffold surfaces remain available in the backend and continue to support later story slices.

## Delivery Notes

The scaffold intentionally leaves long-term persistence, production authentication integration, richer team business rules, and downstream analytics-specific aggregation behavior for follow-up decisions captured in the artifact documents.
