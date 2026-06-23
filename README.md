# OctoFit Activity Logging

This repository contains the OCTOFIT-4 activity logging scaffold. It extends the earlier registration scaffold with a small Express backend for `/api/activities/`, a browser-based activity logging form, and supporting SDLC artifacts for requirements, architecture, design review, and implementation planning.

## Project Structure

- `backend/`: Express API, activity logging service, retained registration scaffold, and automated tests.
- `frontend/`: Static activity logging UI that renders fields from the backend contract and lists persisted activities.
- `artifact/`: Requirements, architecture, design review, and implementation planning documents.

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

## Current Activity Logging Behavior

- Exposes the activity logging endpoint at `/api/activities/`.
- Publishes an activity contract at `/api/activities/contract`.
- Validates and sanitizes activity input before persistence.
- Returns clear field-level validation errors for invalid submissions.
- Persists valid activities in memory and exposes them through `GET /api/activities/` for downstream consumers.

## Retained Scaffold Behavior

- The earlier registration endpoints remain in the backend as an existing scaffold surface, but they are not the primary OCTOFIT-4 delivery target.

## Delivery Notes

The scaffold intentionally leaves long-term persistence, production authentication integration, and downstream analytics-specific aggregation behavior for follow-up decisions captured in the artifact documents.
