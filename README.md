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
