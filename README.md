# TaskForge

A full-stack Task Tracker application with JWT authentication, role-based access control, and real-time task updates — built with ASP.NET Core, PostgreSQL, and React + TypeScript.


---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Running Everything Together](#4-running-everything-together)
- [Verifying the Application Works](#verifying-the-application-works)
- [API Documentation (Postman)](#api-documentation-postman)
- [Design Decisions](#design-decisions)
- [Testing](#testing)
- [CI Pipeline](#ci-pipeline)
- [Assumptions](#assumptions)
- [Future Improvements](#future-improvements)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 8 (C#), Dapper, Npgsql |
| Database | PostgreSQL 15 — SQL functions & stored procedures (no ORM) |
| Frontend | React 18, TypeScript, Vite, MUI (Material UI) |
| Authentication | JWT Bearer tokens, BCrypt password hashing |
| Real-time | SignalR (WebSockets) |
| Validation | FluentValidation |
| Testing | xUnit, Moq (backend); Vitest (frontend) |
| CI | GitHub Actions (three independent workflows) |
| Local infrastructure | Docker Compose (PostgreSQL) |

---

## Repository Structure

This is a mono repo containing all three layers of the application:

```
taskforge/
├── database/              # PostgreSQL schema — migrations, functions, procedures
│   └── migrations/         # Versioned SQL files, applied in order (V001, V002, ...)
├── api/                    # ASP.NET Core backend
│   ├── TaskForge.Api/              # Controllers, SignalR hub, Program.cs
│   ├── TaskForge.Application/      # DTOs, services, validators, interfaces
│   ├── TaskForge.Domain/           # Entities, enums (no external dependencies)
│   ├── TaskForge.Infrastructure/   # Dapper repositories, JWT service, DB connection
│   └── TaskForge.sln
├── tests/
│   └── TaskForge.UnitTests/        # xUnit + Moq unit tests
├── client/                 # React + TypeScript frontend
│   └── src/
│       ├── api/             # Axios API clients
│       ├── components/      # Shared UI components (dialogs, forms)
│       ├── context/         # AuthContext (JWT/session state)
│       ├── hooks/           # useTaskHub (SignalR)
│       └── pages/           # Login, Register, Dashboard, UserManagement
├── docs/                   # Postman collection and environment
├── .github/workflows/      # CI pipelines (database, backend, frontend)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Prerequisites

| Tool | Purpose |
|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Runs PostgreSQL locally — no native Postgres install needed |
| [.NET 8 SDK](https://dotnet.microsoft.com/download) | Builds and runs the API |
| [Node.js 20+](https://nodejs.org) | Builds and runs the React client |
| Git | Cloning the repository |

No native PostgreSQL installation is required — the database runs entirely inside a Docker container.

---

## Setup Instructions

### 1. Database Setup

Start PostgreSQL in Docker:

```bash
docker compose up -d
docker compose ps   # confirm status shows "healthy"
```

Apply the database schema (tables, functions, and stored procedures), in order:

**macOS / Linux:**
```bash
for f in database/migrations/*.sql; do
  echo "Applying $f"
  docker exec -i taskforge-postgres psql -v ON_ERROR_STOP=1 -U taskforge -d taskforge < "$f"
done
```

**Windows (PowerShell):**
```powershell
Get-ChildItem -Path "database/migrations" -Filter *.sql | Sort-Object Name | ForEach-Object {
    Write-Host "Applying $($_.Name)"
    Get-Content $_.FullName | docker exec -i taskforge-postgres psql -v ON_ERROR_STOP=1 -U taskforge -d taskforge
}
```

Verify the schema landed correctly:
```bash
docker exec -it taskforge-postgres psql -U taskforge -d taskforge -c "\dt"
```
Expected: `roles`, `users`, `tasks`, `task_statuses`.

### 2. Backend Setup

```bash
cd api/TaskForge.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5433;Database=taskforge;Username=taskforge;Password=devpassword"
dotnet user-secrets set "Jwt:Secret" "<a long random string, at least 32 characters>"
cd ../..
```

Restore, build, and run:
```bash
dotnet restore api/TaskForge.sln
dotnet run --project api/TaskForge.Api
```

The API starts on `http://localhost:5043` (port may vary — check the console output). Swagger UI is available at `http://localhost:5043/swagger`.

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:
```
VITE_API_BASE_URL=http://localhost:5043/api
```

Run the dev server:
```bash
npm run dev
```

The client starts on `http://localhost:5173`.

### 4. Running Everything Together

From the repository root, in three separate terminals:

```bash
# Terminal 1 — database (only needed once, stays running)
docker compose up -d

# Terminal 2 — backend
dotnet run --project api/TaskForge.Api

# Terminal 3 — frontend
cd client && npm run dev
```

---

## Verifying the Application Works

1. **Health check:**
   ```bash
   curl http://localhost:5043/health
   ```
   Expected: `Healthy`

2. **Open the app:** navigate to `http://localhost:5173/register` and create an account.
   - The **first** user ever registered is automatically assigned the `Admin` role.
   - Every subsequent registration is assigned the `User` role.

3. **Real-time updates:** open the app in two browser windows (both logged in). Create, edit, or delete a task in one window — the other should update immediately, without a refresh.

---

## API Documentation (Postman)

Import both files from `docs/`:
- `TaskForge.postman_collection.json`
- `TaskForge.postman_environment.json`

The collection covers every implemented endpoint (auth, tasks, users) and includes scripts that automatically capture the JWT token and task IDs between requests, so  can run through the full flow with minimal manual setup — set the active environment, run **Register**, then any other request.

---

## Design Decisions

### Architecture

The backend follows a layered architecture with strict separation of concerns:

```
Controllers  →  Application Services  →  Repositories (Dapper)  →  PostgreSQL (SQL functions/procedures)
```

- **`TaskForge.Domain`** — plain entity classes and enums, no dependencies on any other project or library.
- **`TaskForge.Application`** — business logic, DTOs, validators, and interfaces. Contains the RBAC ownership logic (e.g., a standard User can never retrieve or modify another user's tasks — this is enforced here, not just hidden in the UI).
- **`TaskForge.Infrastructure`** — Dapper repositories that call PostgreSQL functions/procedures directly. No Entity Framework Core.
- **`TaskForge.Api`** — controllers, SignalR hub, JWT configuration, and startup wiring.

### Why raw SQL functions/procedures instead of an ORM (EF Core)

This was a deliberate choice to demonstrate direct SQL competency and fine-grained control over query performance, rather than a default. Functions are used for reads and writes that need to return data (e.g., `fn_create_task` returns the inserted row); procedures are used for pure writes where only success/failure matters (e.g., `sp_delete_task`), since PostgreSQL procedures cannot return a result set.

### First-user-becomes-Admin bootstrap

The very first user to register becomes an Admin automatically; every user after that is a standard User. This is implemented inside the `fn_register_user` SQL function using `pg_advisory_xact_lock`, which serializes concurrent registrations so two simultaneous signups can never both become Admin — the race condition is closed at the database level, not in application code.

### Task status as a lookup table, not an ENUM

`task_statuses` is a normal table (`Todo`, `InProgress`, `Done`), not a PostgreSQL `ENUM`. This means adding a new status later is a simple `INSERT`, not a schema migration, and the frontend fetches valid options from `GET /api/tasks/statuses` rather than hardcoding them.

### RBAC enforcement — real, not cosmetic

Role checks happen in two places, deliberately:
1. **Endpoint-level** — `[Authorize(Roles = "Admin")]` on Admin-only routes (e.g., `GET /api/users`).
2. **Ownership-level** — inside `TaskService`, every read/update/delete verifies the requester either owns the task or is an Admin, using the user ID embedded in their JWT claims — never trusting a client-supplied parameter. Hiding buttons in the UI (e.g., the owner filter, the "Users" nav link) is a UX convenience only; the actual security boundary is entirely server-side.

### Real-time updates via SignalR

A `TaskHub` broadcasts `TaskCreated`, `TaskUpdated`, and `TaskDeleted` events to all connected, authenticated clients after every successful mutation. The frontend merges these events into local component state directly, avoiding a full refetch on every change.

### JWT authentication, not a third-party identity provider

Authentication is handled entirely in-app (BCrypt password hashing + signed JWTs) rather than delegating to a service like Auth0. For a single application of this scope, a dedicated identity provider adds external dependencies and setup friction without a corresponding benefit — it would also complicate the zero-config "clone and run" experience this README is built around.

---

## Testing

Backend unit tests cover the Application layer's business logic (authentication flows, task ownership rules) using mocked repositories — no live database required for these:

```bash
dotnet test api/TaskForge.sln
```

---

## CI Pipeline

Three independent GitHub Actions workflows, each scoped to only run when its relevant folder changes:

| Workflow | Triggers on changes to | What it verifies |
|---|---|---|
| `ci-database.yml` | `database/**` | Every migration applies cleanly to a fresh PostgreSQL instance |
| `ci-backend.yml` | `api/**`, `tests/**`, `database/**` | The API builds, and all unit tests pass against a real, freshly-migrated PostgreSQL instance |
| `ci-frontend.yml` | `client/**` | The React app installs, lints, tests, and builds successfully |

All three run on every push and pull request targeting `main`, per the assignment's requirement.

---

## Assumptions

- No mandated technology stack was specified in the brief; ASP.NET Core, PostgreSQL, and React/TypeScript were chosen deliberately, suited to a backend-focused evaluation.
- "Real-time task updates" is interpreted as server-push via WebSockets (SignalR), rather than client-side polling.
- Only two roles (`User`, `Admin`) exist, as specified; no additional role hierarchy was assumed.
- Email/password authentication is sufficient; no OAuth/social login or email verification flow was implemented.
- "Owner" of a task refers to the current assignee/responsible party, which may differ from who originally created it — an Admin can create a task and assign it directly to another user.
- Local development runs over plain HTTP for simplicity; any real deployment would require HTTPS, since JWTs and credentials would otherwise be visible on the network path.

---

## Future Improvements

- **Refresh tokens** — access tokens currently expire without a renewal flow; a refresh token mechanism would avoid forcing re-login.
- **Password reset / email verification** — not implemented, as it was out of scope for the assignment's stated requirements.
- **httpOnly cookie storage for JWTs** — tokens are currently stored in `localStorage` for simplicity; a production system would use httpOnly cookies to mitigate XSS-based token theft.
- **Owner reassignment on edit** — Admins can currently assign ownership only at task creation; reassigning an existing task's owner would need a small extension to `sp_update_task`.
- **Rate limiting** on the login endpoint to reduce brute-force risk.
- **Containerized full-stack deployment** (Docker Compose covering API + client + Postgres together) and a CD pipeline — flagged as bonus/optional in the brief and not pursued given the time constraints.
- **Integration tests** against a real (Testcontainers-managed) PostgreSQL instance, complementing the current unit test suite.

---

## Troubleshooting

**Port 5432 already in use?** Change the host port mapping in `docker-compose.yml` (e.g. `"5433:5432"`) and update the connection string in your user secrets to match.

**Docker Desktop not running?** All `docker` commands require Docker Desktop to be open first (`docker info` will fail otherwise).

**SignalR connection fails with a CORS error?** Confirm `app.UseCors(...)` is registered *before* `app.UseAuthentication()` in `Program.cs` — CORS headers must be applied to every response, including authentication failures, or the browser reports a generic preflight error.

**A previously-working endpoint suddenly errors with "function does not exist"?** This usually means the database was reset (`docker compose down -v`) without reapplying migrations — rerun the migration loop from [Database Setup](#1-database-setup).
