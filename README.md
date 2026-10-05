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

# Introduction

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
