# FlowLens – SME Process Discovery & Improvement

React + Vite + Tailwind + React Flow + Recharts frontend; Node/Express + MongoDB (Mongoose) backend.

## Run
```
npm run install:all     # installs root, server and client dependencies
npm run dev             # API on :5000, web app on :5173
```
Configure `server/.env` (see `.env.example`): `MONGODB_URI` for local MongoDB or Atlas.
If MongoDB is unreachable and `USE_MEMORY_FALLBACK=true`, an in-memory MongoDB is used (data resets on restart).
`SEED_DEMO=true` loads demo processes into an empty database.

## API
`/api/{users,businesses}` CRUD · `/api/processes` CRUD (+ `POST /:id/duplicate {optimize}`) ·
`/api/processes/:id/steps`, `/api/steps/:id` · `/api/analysis/process/:id` · `/api/dashboard`

Analysis is rule-based (`server/src/services/analyzer.js`); TO-BE generation in `optimizer.js`.

## Google Sign-In (optional, free)
1. In Google Cloud Console create a project → **APIs & Services → OAuth consent screen** (External; default scopes only).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
   Add `http://localhost:5173` (and your real domain later) under *Authorized JavaScript origins*.
3. Put the Client ID in `server/.env`: `GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com` and restart the API.

The "Sign in with Google" button appears on the login page only when `GOOGLE_CLIENT_ID` is set. The server verifies the
Google ID token, then signs the user in (creating the account on first use, or linking an existing account with the same email).
While the consent screen is in *Testing* mode only the test users you list can sign in.
