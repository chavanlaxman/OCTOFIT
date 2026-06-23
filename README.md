# OctoFit Student Registration

This repository contains the OCTOFIT-3 student registration scaffold. It provides a small Express backend for `/api/users/register/`, a browser-based registration form that consumes the backend contract, and supporting SDLC artifacts for requirements, architecture, design review, and implementation planning.

## Project Structure

- `backend/`: Express API, registration contract, validation and account creation service, and automated tests.
- `frontend/`: Static registration UI that renders fields from the backend contract.
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

- Exposes the registration endpoint at `/api/users/register/`.
- Publishes a starter registration contract at `/api/users/register/contract`.
- Validates and sanitizes registration input before account creation.
- Returns clear field-level validation errors for invalid submissions.
- Creates an in-memory student account for valid submissions and rejects duplicate email registration attempts.

## Delivery Notes

The scaffold intentionally leaves long-term account persistence, production authentication integration, and the final post-registration flow for follow-up decisions captured in the artifact documents.
