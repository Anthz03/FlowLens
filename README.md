<div align="center">

<a href="#readme">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/final/flowlens-horizontal-on-dark.svg">
    <img src="logo/final/flowlens-horizontal.svg" alt="FlowLens" height="64">
  </picture>
</a>

### Know how your business really works. Then make it work better.

Process discovery and improvement for small and medium businesses.<br>
Describe a process in plain words, see it as a diagram, find what slows it down, and compare it with a better version.

<br>

![React](https://img.shields.io/badge/React-19-4F46E5?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-4F46E5?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-4F46E5?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-1E1B4B?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-1E1B4B?style=for-the-badge&logo=mongodb&logoColor=white)

<br>

<img src="flowlens-images/1.png" alt="The FlowLens dashboard: health score, manual tasks, bottlenecks and charts" width="100%">

</div>

<br>

# Part 1 · Introduction

## <img src="docs/icons/sparkles.svg" width="24" height="24" align="absmiddle" alt=""> What is FlowLens?

Most small businesses run on knowledge nobody wrote down. Orders, approvals and hand-overs follow habits that live in people's heads, spreadsheets and chat threads. That works until someone is away, a customer waits too long, or the business grows.

**FlowLens** is a working prototype of an information system that helps SMEs **discover, document, visualize, analyze and improve** their business processes, without consultants and without process-modelling jargon.

> [!TIP]
> **The idea in one line:** type how work happens → get a diagram → get a health score and a list of problems → generate a better version → compare the two.

## <img src="docs/icons/compass.svg" width="24" height="24" align="absmiddle" alt=""> How it works

| | Step | What you do |
|---|---|---|
| **1** | <img src="docs/icons/message-square-text.svg" width="16" height="16" align="absmiddle" alt=""> **Describe** | Type what happens in plain words (or fill in a simple form). Say who does each step and which tool they use. |
| **2** | <img src="docs/icons/workflow.svg" width="16" height="16" align="absmiddle" alt=""> **See it** | FlowLens draws the process as a diagram you can edit by dragging boxes and arrows. |
| **3** | <img src="docs/icons/activity.svg" width="16" height="16" align="absmiddle" alt=""> **Check it** | Get a **Process Health Score** and a clear list of manual tasks, slow steps, repeated steps and steps with nobody in charge. |
| **4** | <img src="docs/icons/rocket.svg" width="16" height="16" align="absmiddle" alt=""> **Improve it** | Create an improved **TO-BE** version in one click, then compare it with today's **AS-IS** process. |

## <img src="docs/icons/image.svg" width="24" height="24" align="absmiddle" alt=""> Take a look

### <img src="docs/icons/message-square-text.svg" width="20" height="20" align="absmiddle" alt=""> Process Discovery: describe it like you would to a new hire

Not documented yet? Type one step per line (start a line with `Sales Rep:` to say who does it, end it with `?` for a decision). FlowLens detects roles, tools and decisions, and you review the result before creating the process.

<img src="flowlens-images/2.png" alt="The Process Discovery wizard" width="100%">

### <img src="docs/icons/activity.svg" width="20" height="20" align="absmiddle" alt=""> Process Analysis: one number, five reasons

Every process gets a **Health Score out of 100**, broken down into Documentation, Automation, Role Clarity, Process Complexity and Efficiency, plus time per step and written recommendations.

<img src="flowlens-images/3.png" alt="The Process Analysis page with health score, metrics and charts" width="100%">

### <img src="docs/icons/workflow.svg" width="20" height="20" align="absmiddle" alt=""> Process Map: drag, connect, done

An editable React Flow diagram. Move boxes, add decisions, label branches and edit any step in the side panel. A hand icon means *manual*, a bolt means *automated*, and a red border marks a possible *bottleneck*.

<img src="flowlens-images/4.png" alt="The editable process map with the step editor panel" width="100%">

## <img src="docs/icons/puzzle.svg" width="24" height="24" align="absmiddle" alt=""> Features

| Module | What it does |
|---|---|
| <img src="docs/icons/layout-dashboard.svg" width="16" height="16" align="absmiddle" alt=""> **Dashboard** | Health scores, manual tasks, bottlenecks, where the time goes (by hand vs by system), top issues and suggestions based on your goals |
| <img src="docs/icons/folder-kanban.svg" width="16" height="16" align="absmiddle" alt=""> **Process Repository** | Search and filter all processes; each card shows a small "process strip" of its steps |
| <img src="docs/icons/circle-plus.svg" width="16" height="16" align="absmiddle" alt=""> **Create / Edit Process** | Name, department, status and steps, each with role, department, tool, inputs, outputs, time and manual/automated |
| <img src="docs/icons/compass.svg" width="16" height="16" align="absmiddle" alt=""> **Process Discovery** | Plain-words wizard that turns informal text into structured steps |
| <img src="docs/icons/workflow.svg" width="16" height="16" align="absmiddle" alt=""> **Process Map** | Editable flow diagram with decision branches, auto-layout and a side editing panel |
| <img src="docs/icons/activity.svg" width="16" height="16" align="absmiddle" alt=""> **Process Analysis** | Rule-based analysis and health score with recommendations |
| <img src="docs/icons/git-compare.svg" width="16" height="16" align="absmiddle" alt=""> **AS-IS vs TO-BE** | Side-by-side comparison with percentage improvement and a "what changed" list |
| <img src="docs/icons/file-text.svg" width="16" height="16" align="absmiddle" alt=""> **Process Details** | Roles, departments, tools, steps, inputs and outputs in one place |
| <img src="docs/icons/lock.svg" width="16" height="16" align="absmiddle" alt=""> **Accounts** | Email + password sign-in (optional Google sign-in), one private workspace per business |
| <img src="docs/icons/graduation-cap.svg" width="16" height="16" align="absmiddle" alt=""> **Guided onboarding** | A short setup questionnaire, then an 18-step interactive tour of every page |
| <img src="docs/icons/settings.svg" width="16" height="16" align="absmiddle" alt=""> **Settings** | Profile, password and sessions, company details, team and roles, **analysis rules**, activity log, and **data export** (CSV, JSON, print or PDF) |

## <img src="docs/icons/search.svg" width="24" height="24" align="absmiddle" alt=""> How the analysis works

FlowLens uses **simple, transparent rules**, not AI. You can read them in [`server/src/services/analyzer.js`](server/src/services/analyzer.js).

| It looks for | Rule |
|---|---|
| <img src="docs/icons/hand.svg" width="16" height="16" align="absmiddle" alt=""> **Manual tasks** | A task marked as performed manually |
| <img src="docs/icons/timer.svg" width="16" height="16" align="absmiddle" alt=""> **Bottlenecks** | A step of 45+ minutes, or 20+ minutes and more than twice the average |
| <img src="docs/icons/shuffle.svg" width="16" height="16" align="absmiddle" alt=""> **Excessive handoffs** | Connected steps owned by different roles (flagged when there are many) |
| <img src="docs/icons/copy.svg" width="16" height="16" align="absmiddle" alt=""> **Duplicate steps** | Two steps with very similar names |
| <img src="docs/icons/user-x.svg" width="16" height="16" align="absmiddle" alt=""> **Unclear responsibility** | A step with no role, or a role with no department |
| <img src="docs/icons/file-pen.svg" width="16" height="16" align="absmiddle" alt=""> **Poor documentation** | Missing descriptions, tools, inputs or outputs |

Every threshold can be tuned per company by an owner or admin in **Settings → Analysis rules** (for example, what counts as a bottleneck), and every score, finding and TO-BE suggestion follows the new rules.

### <img src="docs/icons/git-compare.svg" width="20" height="20" align="absmiddle" alt=""> From AS-IS to TO-BE

**Generate TO-BE** (in [`optimizer.js`](server/src/services/optimizer.js)) copies a process and applies improvements: it merges duplicate steps, automates repeatable manual tasks, shortens bottlenecks and flags missing owners. Your original is never changed. Example from the built-in demo:

| | AS-IS | TO-BE | Change |
|---|---:|---:|---:|
| Manual tasks | 9 | 4 | -56% |
| Estimated time | 222 min | 140 min | -37% |
| Health score | 49 | 68 | +19 |

## <img src="docs/icons/wrench.svg" width="24" height="24" align="absmiddle" alt=""> Built with

| Layer | Technology |
|---|---|
| Frontend | React · Vite · JavaScript |
| Styling | Tailwind CSS 4 · Geist and Outfit fonts |
| Diagram | React Flow (`@xyflow/react`) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js · Express 5 |
| Database | MongoDB · Mongoose |
| API | REST |

## <img src="docs/icons/folder-tree.svg" width="24" height="24" align="absmiddle" alt=""> Project structure

```text
FlowLens/
├── client/                 React + Vite frontend
│   ├── public/             Favicons and web manifest
│   └── src/
│       ├── components/     Layout, UI kit, Logo, ProcessStrip, FlowNodes, Tour…
│       ├── pages/          Landing, Login, Onboarding, Dashboard, Repository,
│       │                   ProcessForm, Discovery, ProcessMap, Analysis, Compare…
│       └── lib/            API client, auth context, constants
├── server/                 Node + Express backend
│   └── src/
│       ├── models/         User, Business, Process, ProcessStep, ProcessAnalysis
│       ├── routes/         REST API + auth
│       ├── services/       analyzer, optimizer, auth, Google sign-in
│       └── seed.js         Demo data
├── logo/                   Logo files, usage guidelines and the build script
└── flowlens-images/        Screenshots used in this README
```

## <img src="docs/icons/palette.svg" width="24" height="24" align="absmiddle" alt=""> The logo

The mark is an **F drawn as a process**: one path leaves the stem and branches into two nodes. It reads as a letter and as a tiny flowchart.

<div align="center">

<img src="logo/final/flowlens-symbol.svg" alt="FlowLens symbol" height="96">&nbsp;&nbsp;&nbsp;&nbsp;
<img src="logo/final/flowlens-app-icon.svg" alt="FlowLens app icon" height="96">&nbsp;&nbsp;&nbsp;&nbsp;
<img src="logo/final/flowlens-stacked.svg" alt="FlowLens stacked logo" height="96">

</div>

All logo files are in [`logo/final`](logo/final), with colours, spacing and do's and don'ts in the [logo guidelines](logo/FlowLens-logo-guidelines.md).

<br>

---

<br>

# Part 2 · Setup

## <img src="docs/icons/circle-check.svg" width="24" height="24" align="absmiddle" alt=""> Requirements

| You need | Notes |
|---|---|
| **Node.js** `20.19+` or `22.12+` | Required by Vite 8. Check with `node -v`. |
| **npm** | Comes with Node.js. |
| **MongoDB** *(optional)* | A local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. If you have neither, FlowLens uses a temporary in-memory database so you can still try it. |
| **Git** | To clone the repository. |

## <img src="docs/icons/rocket.svg" width="24" height="24" align="absmiddle" alt=""> Quick start

```bash
# 1. Get the code
git clone <your-repository-url> FlowLens
cd FlowLens

# 2. Install everything (root, server and client)
npm run install:all

# 3. Create your environment file
#    macOS / Linux / Git Bash:
cp server/.env.example server/.env
#    Windows PowerShell:
#    Copy-Item server/.env.example server/.env

# 4. Start the API and the web app together
npm run dev
```

Then open **http://localhost:5173**.

- The web app runs on port **5173** and the API on port **5000**. The web app forwards `/api` requests to the API for you.
- On first start with no database configured, FlowLens downloads a small MongoDB build and runs it in memory. This can take a minute **once**, and the data is **lost when you stop the server**.
- Demo data is loaded into an empty database automatically (`SEED_DEMO=true`).

### <img src="docs/icons/key-round.svg" width="20" height="20" align="absmiddle" alt=""> Try the demo account

| | |
|---|---|
| **Email** | `demo@flowlens.app` |
| **Password** | `demo1234` |

> [!WARNING]
> The demo account exists only while `SEED_DEMO=true` (local development). It is public in this README, so it must **not** exist on a public server. See [Deploying](#-deploying).

On the login page, **Try the demo** from the landing page, or the **Fill in demo account** button, fills these in for you. You can also **create your own account**: you will answer a few quick questions about your company, then a guided tour walks you through every page. Take the tour again any time with **Take the tour** in the top bar.

## <img src="docs/icons/settings.svg" width="24" height="24" align="absmiddle" alt=""> Configuration

All settings live in **`server/.env`** (copy it from `server/.env.example`). Never commit this file; it is already git-ignored.

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `5000` | Port for the API |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/flowlens` | Your MongoDB connection string (local or Atlas) |
| `USE_MEMORY_FALLBACK` | `true` | If `MONGODB_URI` cannot be reached, use a temporary in-memory database. Set to `false` in production so a bad connection fails loudly. |
| `SEED_DEMO` | `true` | Load demo data and the public demo account into an **empty** database. **Set to `false` in production.** |
| `AUTH_SECRET` | *(placeholder)* | Secret used to sign login sessions. **Change it to a long random string** (see below). Required in production. |
| `GOOGLE_CLIENT_ID` | *(empty)* | Optional. Turns on "Sign in with Google" |

Generate a strong `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## <img src="docs/icons/shield-check.svg" width="24" height="24" align="absmiddle" alt=""> Security

The API is hardened by default. Everything below works out of the box, and the settings are in `server/.env`.

| Area | What FlowLens does |
|---|---|
| **Authentication** | Passwords hashed with scrypt (non-blocking, upgradeable cost). Signed session tokens that expire after 12 hours, refresh while you are active, and can be revoked. Optional Google sign-in with server-side token verification. |
| **Password rules** | 8 to 128 characters with a letter and a number, and a block-list of common passwords. Changing a password signs out every other device. |
| **Brute-force protection** | An account locks for 15 minutes after 5 wrong passwords. Failed sign-ins are also rate limited per IP, and unknown emails take the same time and give the same message as wrong passwords. |
| **Rate limiting** | Per IP on every request, per user when signed in, stricter on sign-in, sign-up and the heavier analysis endpoints. Rejected requests get `429` with `Retry-After`. |
| **Authorization** | Three roles: **owner**, **admin**, **member**. Members can create and edit processes. Deleting processes, managing the team and changing company details need admin or owner. Only owners change roles, and a business always keeps at least one owner. |
| **Tenant isolation** | Every record is checked against the signed-in user's business, including steps and analyses. Other businesses get `404`. |
| **Input validation** | Every request body is checked with a strict schema (types, lengths, allowed values, size limits). Unknown fields are dropped, so clients cannot set owners, businesses or move steps between processes. |
| **Injection protection** | Keys starting with `$` or containing `.` are stripped, query parameters are validated, and ids are checked before reaching the database. |
| **HTTP hardening** | Security headers (Helmet), a CORS allow-list, `no-store` caching on API responses, a 256 KB body limit and no `X-Powered-By`. |
| **Safe errors** | Clients get short generic messages and a request id. Details stay in the server log. |
| **Audit log** | Sign-ins, lockouts, password changes, role changes and deletions are logged and kept for 90 days. Owners and admins read them at `GET /api/audit`. |
| **Safe defaults** | New team members get a random one-time password, never a fixed one. In production the server refuses to start with a weak `AUTH_SECRET`. |

Run the automated security tests (they use a temporary in-memory database):

```bash
npm --prefix server test
```

<details>
<summary><b>Security settings</b></summary>

| Variable | Default | What it does |
|---|---|---|
| `NODE_ENV` | `development` | Set to `production` to enforce a strong `AUTH_SECRET` |
| `TOKEN_TTL_HOURS` | `12` | How long a session lasts without activity |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Browser origins allowed to call the API |
| `TRUST_PROXY` | `false` | Set to `1` (or your proxy setup) behind a reverse proxy, so client IPs are correct |
| `MAX_FAILED_LOGINS` / `LOCKOUT_MINUTES` | `5` / `15` | Account lockout |
| `RATE_LIMIT_AUTH_MAX` | `10` | Failed sign-ins per IP per 15 minutes |
| `RATE_LIMIT_REGISTER_MAX` | `5` | New accounts per IP per hour |
| `RATE_LIMIT_IP_MAX` / `RATE_LIMIT_USER_MAX` | `1000` / `600` | Requests per 15 minutes |
</details>

> [!IMPORTANT]
> What is **not** included yet: email verification, two-factor sign-in and password-reset by email. Rate limits are kept in server memory, so use a shared store (such as Redis) if you run several API instances. Serve the site over HTTPS and let your host or reverse proxy add security headers (such as a Content-Security-Policy) to the frontend.

## <img src="docs/icons/database.svg" width="24" height="24" align="absmiddle" alt=""> Choose your database

<details>
<summary><b>Option A · No setup (in-memory)</b></summary>

Leave `MONGODB_URI` as it is and keep `USE_MEMORY_FALLBACK=true`. If no MongoDB is running locally, FlowLens starts a temporary one. Perfect for a quick look. Data disappears when the server stops.
</details>

<details>
<summary><b>Option B · Local MongoDB</b></summary>

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and start it.
2. Keep `MONGODB_URI=mongodb://127.0.0.1:27017/flowlens` in `server/.env`.
3. Run `npm run dev`. The demo data is created on first start.
</details>

<details>
<summary><b>Option C · MongoDB Atlas (free cloud database)</b></summary>

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a database user with a password.
3. **Network Access** → allow your IP address.
4. **Connect → Drivers** → copy the connection string and put it in `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/flowlens
   ```
5. Run `npm run dev`. If the password has special characters, URL-encode them.
</details>

## <img src="docs/icons/lock.svg" width="24" height="24" align="absmiddle" alt=""> Optional: Google sign-in

The "Sign in with Google" button appears **only when `GOOGLE_CLIENT_ID` is set**. Without it, email and password sign-in works as normal.

<details>
<summary><b>How to set it up (free)</b></summary>

1. In the [Google Cloud Console](https://console.cloud.google.com), create a project, then open **APIs & Services → OAuth consent screen** (choose *External*, default scopes only).
2. Go to **Credentials → Create credentials → OAuth client ID → Web application**.
3. Under **Authorized JavaScript origins**, add `http://localhost:5173` (and your real domain when you deploy).
4. Copy the **Client ID** into `server/.env` as `GOOGLE_CLIENT_ID=…apps.googleusercontent.com`, then restart the API.

While the consent screen is in *Testing* mode, only the test users you list can sign in. The server verifies Google's token itself, then signs the user in (creating the account on first use, or linking an existing account with the same email). Google may ask for a card to verify your account; basic sign-in is not billed.
</details>

## <img src="docs/icons/terminal.svg" width="24" height="24" align="absmiddle" alt=""> Useful commands

| Command | What it does |
|---|---|
| `npm run install:all` | Install dependencies for root, server and client |
| `npm run dev` | Start API (`:5000`) and web app (`:5173`) together |
| `npm run seed` | Load demo data into an empty database |
| `npm --prefix server start` | Start the API only (no auto-reload) |
| `npm --prefix server test` | Run the security tests |
| `npm --prefix server run preflight` | Pre-launch check: settings, database and demo account (see [Deploying](#-deploying)) |
| `npm --prefix server run remove-demo` | Show (or with `-- --yes`, delete) the public demo account |
| `npm --prefix client run dev` | Start the web app only |
| `npm --prefix client run build` | Create a production build in `client/dist` |
| `npm --prefix client run lint` | Lint the frontend |
| `python logo/src/build_logo.py` | Rebuild the logo files *(needs `pip install fonttools`)* |

## <img src="docs/icons/plug.svg" width="24" height="24" align="absmiddle" alt=""> API overview

All routes are under `/api` and need a signed-in session, except `/api/auth/*`. Each business only sees its own data.

| Area | Endpoints |
|---|---|
| **Auth** | `POST /auth/register` · `POST /auth/login` · `POST /auth/google` · `GET /auth/me` · `GET /auth/config` · `POST /auth/onboarding` · `PUT /auth/profile` · `POST /auth/change-password` · `POST /auth/logout-all` |
| **Processes** | `GET /processes` · `GET /processes/:id` · `POST /processes` · `PUT /processes/:id` · `DELETE /processes/:id` |
| **TO-BE** | `POST /processes/:id/duplicate` with `{ "optimize": true }` |
| **Steps** | `GET/POST /processes/:id/steps` · `GET/PUT/DELETE /steps/:id` |
| **Analysis** | `GET/POST /analysis/process/:id` · `GET /analysis` · `PUT/DELETE /analysis/:id` |
| **Users & businesses** | `GET/POST /users` · `PUT/DELETE /users/:id` · `POST /users/:id/reset-password` · `GET /businesses` · `PUT /businesses/:id` (team and company changes need admin or owner) |
| **Settings** | `GET /settings/analysis-rules` · `PUT/DELETE /settings/analysis-rules` (admin or owner) |
| **Export** | `GET /export/processes?format=csv\|json` · `GET /processes/:id/export?format=csv\|json` |
| **Security log** | `GET /audit` (admin or owner) |
| **Dashboard** | `GET /dashboard` |

## <img src="docs/icons/globe.svg" width="24" height="24" align="absmiddle" alt=""> Deploying

FlowLens deploys as **three parts**. The website and the API live on different hosts, so the website is built knowing the API's address.

```text
 Visitor's browser
        |
        |  https://your-site.vercel.app        (website: static files)
        v
 +-----------------+   https calls to the API   +--------------------+      +----------------+
 |  Vercel         | -------------------------> |  Render            | ---> | MongoDB Atlas  |
 |  client/        |   (CORS allow-list)        |  server/ (Node)    |      | (database)     |
 +-----------------+                            +--------------------+      +----------------+
```

> [!NOTE]
> The steps below use **Vercel**, **Render** and **MongoDB Atlas**, which all have free plans (check their current limits). Any static host and any Node host work the same way: build the website with `VITE_API_URL`, and set the API's environment variables.

### 1. Put the code on GitHub
Push this repository to GitHub. `server/.env` is git-ignored, so your secrets stay on your computer.

### 2. Create the production database (MongoDB Atlas)
1. Create a **new cluster or a new database** for production. Do not reuse your development database, because it holds the demo account.
2. **Database Access** → add a user with a **long random password** and the *readWrite* role on the `flowlens` database only.
3. **Network Access** → Render's free plan has no fixed IP address, so allow `0.0.0.0/0`. The strong password and the dedicated user are what protect the database.
4. **Connect → Drivers** → copy the connection string and add the database name: `mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/flowlens`
5. Turn on **backups** (Atlas → Backup) and set an **alert** for unusual activity if your plan allows it.

### 3. Deploy the API on Render
1. Render dashboard → **New → Blueprint** → choose your repository. Render reads [`render.yaml`](render.yaml).
2. Fill in the values it asks for:
   - `MONGODB_URI`: the connection string from step 2
   - `CORS_ORIGINS`: for now `https://placeholder.example` (you will replace it in step 5)
   - `GOOGLE_CLIENT_ID`: optional
3. `AUTH_SECRET` is generated for you. `NODE_ENV=production`, `SEED_DEMO=false`, `USE_MEMORY_FALLBACK=false` and `TRUST_PROXY=1` are already set.
4. When it finishes, open `https://YOUR-API.onrender.com/api/health`. It should show `{"ok":true}`.

> [!TIP]
> Render's free plan puts the API to sleep when idle, so the first visit after a quiet period can take 30 to 60 seconds. A paid plan keeps it awake.

### 4. Deploy the website on Vercel
1. Vercel → **Add New → Project** → import the repository.
2. Set **Root Directory** to `client` (the framework is detected as Vite).
3. Under **Environment Variables** add `VITE_API_URL` = `https://YOUR-API.onrender.com` (no trailing slash and no `/api`).
4. Deploy. Vercel applies [`client/vercel.json`](client/vercel.json): page routing for deep links, caching for built files, and security headers including a Content-Security-Policy.

### 5. Connect the two
On Render, set `CORS_ORIGINS` to your website's address **exactly**: `https://YOUR-SITE.vercel.app` (https, no trailing slash). Several addresses can be separated by commas. Then let Render redeploy.

> [!NOTE]
> Only the addresses listed in `CORS_ORIGINS` can use the API from a browser. Vercel preview deployments have their own addresses, so use your production address (or add the preview address while testing).
>
> If you later use a custom API domain such as `api.example.com`, change `https://*.onrender.com` in the `connect-src` part of `client/vercel.json` to that domain, and redeploy the website.

### 6. Google sign-in (optional)
In Google Cloud Console → your OAuth client, add `https://YOUR-SITE.vercel.app` under **Authorized JavaScript origins**, and publish the consent screen (**In production**) so people outside your test list can sign in. Make sure `GOOGLE_CLIENT_ID` is set on Render.

### 7. Run the pre-launch check
Before you tell anyone, run the checker **with the same values you gave Render**. It checks the settings, connects to the database, and fails if the public demo account is still there.

```bash
cd server
# macOS / Linux / Git Bash
NODE_ENV=production AUTH_SECRET='<same value as on Render>' MONGODB_URI='<atlas uri>' \
CORS_ORIGINS='https://YOUR-SITE.vercel.app' SEED_DEMO=false USE_MEMORY_FALLBACK=false TRUST_PROXY=1 \
npm run preflight
```

```powershell
# Windows PowerShell
cd server
$env:NODE_ENV='production'; $env:AUTH_SECRET='<same value as on Render>'; $env:MONGODB_URI='<atlas uri>'
$env:CORS_ORIGINS='https://YOUR-SITE.vercel.app'; $env:SEED_DEMO='false'; $env:USE_MEMORY_FALLBACK='false'; $env:TRUST_PROXY='1'
npm run preflight
```

If you must reuse a database that contains the demo account, remove it first. `npm run remove-demo` shows what would be deleted, and `npm run remove-demo -- --yes` deletes it.

### Before you go public: checklist

| | Item | How |
|---|---|---|
| ☐ | **No public demo account** | `SEED_DEMO=false`, fresh production database, checked by `npm run preflight` |
| ☐ | **Strong secret** | `AUTH_SECRET` is generated by Render. In production the server refuses to start with a weak one |
| ☐ | **HTTPS everywhere** | Provided by Vercel and Render. Security headers (HSTS, CSP, frame blocking) are set for you |
| ☐ | **Only your website can call the API** | `CORS_ORIGINS` set to your exact `https://` address |
| ☐ | **Real visitor IPs for rate limiting** | `TRUST_PROXY=1` on Render |
| ☐ | **Database locked down** | Dedicated database user with a strong password, backups on |
| ☐ | **Google sign-in works** | Your website is an authorized origin and the consent screen is published |
| ☐ | **One API instance** | Rate limits are kept in memory. Use a shared store (such as Redis) before running several |
| ☐ | **Email and password recovery** | Not built yet: lost passwords are reset by an owner in Settings |
| ☐ | **Privacy policy and terms** | Not included. Add them before collecting real customer data |

## <img src="docs/icons/bandage.svg" width="24" height="24" align="absmiddle" alt=""> Troubleshooting

<details>
<summary><b>The deployed website says "Failed to fetch" or shows a CORS error</b></summary>

The API only accepts browsers from the addresses in `CORS_ORIGINS`. Set it on Render to your website's exact address (`https://YOUR-SITE.vercel.app`, with no trailing slash) and redeploy. Also check that `VITE_API_URL` on Vercel is the API's address and that you redeployed the website after setting it.
</details>

<details>
<summary><b>Blocked by Content-Security-Policy after deploying</b></summary>

`client/vercel.json` allows API calls to `https://*.onrender.com`. If your API is on another domain, change that part of the `connect-src` rule to your API domain and redeploy the website.
</details>

<details>
<summary><b>The first request after a quiet period is very slow</b></summary>

On Render's free plan the API sleeps when idle and takes 30 to 60 seconds to wake. A paid plan, or a regular uptime ping to `/api/health`, avoids it.
</details>

<details>
<summary><b>The page is blank or shows "Request failed"</b></summary>

Make sure the API is running (`http://localhost:5000/api/health` should return `{"ok":true}`). `npm run dev` starts both servers; if you started only the web app, start the API too.
</details>

<details>
<summary><b>"Port 5000 / 5173 is already in use"</b></summary>

Another copy of FlowLens (or another app) is using the port. Stop it, or change `PORT` in `server/.env`. If you change the API port, update the proxy target in `client/vite.config.js`.
</details>

<details>
<summary><b>The server cannot connect to MongoDB</b></summary>

Check `MONGODB_URI`, that your database is running, and (for Atlas) that your IP is allowed under **Network Access**. With `USE_MEMORY_FALLBACK=true` the server falls back to a temporary in-memory database instead of stopping, so look for the message "Using in-memory MongoDB" in the terminal.
</details>

<details>
<summary><b>My data disappeared after a restart</b></summary>

You are using the in-memory database. Point `MONGODB_URI` at a local MongoDB or Atlas to keep your data.
</details>

<details>
<summary><b>Google sign-in says "access blocked"</b></summary>

While the OAuth consent screen is in *Testing* mode, add your Google account under **Audience → Test users**. Also check that `http://localhost:5173` is listed as an Authorized JavaScript origin, and wait a few minutes after creating a new Client ID.
</details>

<details>
<summary><b>I do not see the guided tour</b></summary>

The tour starts automatically once per account, after the setup questions. Click **Take the tour** in the top bar (or **Start the tour** in the sidebar) to run it again.
</details>

## <img src="docs/icons/triangle-alert.svg" width="24" height="24" align="absmiddle" alt=""> Good to know

- FlowLens is a **prototype**. The analysis is rule-based and the TO-BE generator uses simple heuristics, so treat the results as suggestions, not advice.
- The logo has **not** been checked against trademark registers. Do that before using it commercially.
- The icons in this README are from [Lucide](https://lucide.dev) (ISC license).
- The "FlowLens" lettering is outlined from [Inter](https://rsms.me/inter/) Bold (SIL Open Font License).

<br>

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="logo/final/flowlens-symbol-white.svg">
  <img src="logo/final/flowlens-symbol.svg" alt="" height="40">
</picture>

**Document it. See it. Improve it.**

</div>
