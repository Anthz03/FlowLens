I want you to build a working prototype of an Information System for Small and Medium Enterprises (SMEs).

## Concept

The system helps SMEs **discover, document, visualize, analyze, and improve their business processes**.

Many SMEs do not have their processes properly documented. Employees often rely on personal knowledge, spreadsheets, messaging apps, and informal instructions.

## Core Workflow

The user should be able to:

1. Create a business process.
2. Enter the process name and description.
3. Add process steps/activities.
4. Assign employees or roles to each step.
5. Identify departments involved.
6. Identify tools/systems used.
7. Define inputs and outputs.
8. Add decision points.
9. Generate a visual process flow.
10. Edit the process flow.
11. Analyze the process for:
   - Manual tasks
   - Bottlenecks
   - Duplicate steps
   - Excessive handoffs
   - Unclear responsibilities
12. Generate a simple **Process Health Score**.
13. Create an improved **TO-BE process**.
14. Compare the **AS-IS vs TO-BE** processes.

## Main Pages

- Dashboard
- Process Repository
- Create Process
- Process Discovery
- Process Map
- Process Analysis
- AS-IS vs TO-BE Comparison
- Process Details

## Basic Tech Stack

Use a simple modern web stack:

- **Frontend:** React + Vite
- **Language:** JavaScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Process Diagram:** React Flow
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **API:** REST API

Use environment variables for database configuration.

## Basic Technical Tasks

### Project Setup
- Create the React/Vite frontend.
- Create the Node.js/Express backend.
- Configure Tailwind CSS.
- Set up the project folder structure.
- Configure environment variables.
- Connect the backend to MongoDB.

### Backend
Create REST API endpoints for:

- Users
- Businesses
- Processes
- Process Steps
- Process Analysis

Basic operations should include:

- Create
- Read
- Update
- Delete

Example:

```text
GET    /api/processes
GET    /api/processes/:id
POST   /api/processes
PUT    /api/processes/:id
DELETE /api/processes/:id
```

### Database

Create basic models for:

```text
User
Business
Process
ProcessStep
ProcessAnalysis
```

A Process should contain information such as:

```text
name
description
department
status
steps
createdBy
createdAt
updatedAt
```

A ProcessStep should contain:

```text
name
description
role
department
type
tool
estimatedTime
isManual
order
```

### Frontend

Create reusable components for:

- Sidebar
- Navbar
- Dashboard cards
- Tables
- Forms
- Modal dialogs
- Process cards
- Process flow nodes
- Analysis cards
- Score indicators

The Process Map should use **React Flow** so users can visually see and edit the workflow.

## Process Analysis

For the prototype, use rule-based analysis instead of complex AI.

Example rules:

```text
IF a step is manual
→ identify it as a manual task.

IF estimated time is high
→ flag it as a possible bottleneck.

IF multiple consecutive steps belong to different roles
→ identify excessive handoffs.

IF two steps have similar names
→ flag possible duplication.
```

Generate a simple score such as:

```text
Process Health Score: 72/100
```

with categories such as:

- Documentation
- Automation
- Role Clarity
- Process Complexity
- Efficiency

## AS-IS vs TO-BE

Allow users to duplicate an existing process as a TO-BE version and modify it.

Display a comparison:

```text
                    AS-IS     TO-BE

Process Steps         10         7
Manual Tasks           6         3
Handoffs                5         3
Estimated Time       120 min    75 min
```

Also show the percentage improvement where possible.

## UI/UX

Make the interface:

- Modern
- Clean
- Professional
- Dashboard-oriented
- Easy for non-technical SME users
- Responsive

Use a consistent design system and avoid unnecessary animations or complicated UI.

## Development Approach

Build the prototype incrementally.

Start with:

1. Project setup
2. Dashboard
3. Process Repository
4. Create/Edit Process
5. Process Map
6. Process Analysis
7. AS-IS vs TO-BE
8. Backend API
9. MongoDB integration
10. Final UI polish

Keep the implementation simple and understandable.

Do not add unnecessary enterprise features such as complex authentication, microservices, advanced AI agents, or complicated permissions unless they are necessary for the prototype.

The priority is to have a **fully working end-to-end prototype that can be demonstrated as an SME Business Process Discovery and Improvement System.**