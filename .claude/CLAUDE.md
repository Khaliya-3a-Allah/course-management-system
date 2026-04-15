# Course Management System — Guidelines

## Project Context

This is a **university project**. Code quality, readability, and adherence to software engineering principles are graded. No shortcuts. The code-quality rules below apply to **both the frontend (`src/`) and the backend (`server/`)**.

## Current Phase

**Phase 2 — Full-Stack Integration.** Due **2026-04-20**.

Requirements from the Phase 2 PDF (`.claude/CSC443 - Project Phase 2.pdf`):

- RESTful Express API for users and the primary data entities (CRUD for each).
- MongoDB via Mongoose as the persistence layer (already wired).
- `bcrypt` password hashing on registration; JWT issued on login; protected write routes; ownership-based authorization for update/delete.
- Replace all mock data in the React frontend with real `fetch`/`axios` calls to the API; surface loading and success/error states in the UI.
- Deploy the backend (Render / Cyclic / Heroku) **and** the frontend (Netlify / GH Pages); the entire app must be reachable online.
- Comprehensive `README.md`: team names, assigned topic + primary entities, deployed URLs, local setup for the full stack, full API documentation (endpoints, methods, request/response, auth), screenshots or GIF, per-member contributions across both phases, and a short "challenges" write-up.

The old Phase 1 "no backend / no `server/` / no backend dependencies" rules are **obsolete** and have been removed.

## Code Quality Standards

### Readability First

- Write explicit, self-documenting code — no clever one-liners or ternary chains
- Use descriptive variable and function names (no single-letter names except loop iterators)
- Keep functions short and focused — one function, one responsibility
- Break complex logic into clearly named helper functions
- Add comments only when the "why" is not obvious from the code itself

### SOLID Principles

- **Single Responsibility**: Each file, component, function, controller, and middleware does one thing
- **Open/Closed**: Components and handlers accept props/config for customization — extend through composition, not modification
- **Liskov Substitution**: Shared components and CRUD factories must work interchangeably where their interface is expected
- **Interface Segregation**: Don't force components or middleware to depend on props/context/req-fields they don't use
- **Dependency Inversion**: Depend on abstractions (context hooks, `server/data/store.js`, utility functions) not concrete implementations

### File Organization

- One component / one route file / one controller / one model per file
- Keep files under 300 lines — extract when approaching this limit
- Group by feature/domain, not by type
- Frontend shared utilities → `src/utils/`; shared components → `src/components/`; pages → `src/pages/`
- Backend: routes → `server/routes/`; controllers → `server/controllers/`; models → `server/models/`; middleware → `server/middleware/`; helpers → `server/utils/`

### Immutability

- Never mutate state directly — always create new objects/arrays
- Use spread operators or functional updates for state changes
- Context update functions must return new references, not modify existing ones
- On the backend, treat request objects as read-only; build new response payloads rather than mutating models in place

### Error Handling

- Validate all user input at system boundaries before processing (client form validators **and** server-side checks)
- Show clear, user-friendly error messages in the UI
- On the server, throw `ApiError` from controllers and let the global `errorHandler` format the response — never `res.send` an error directly
- Never silently swallow errors
- Use try/catch around `JSON.parse`, `localStorage` access, and other fallible operations

## Project Structure

```
src/                       # React frontend
  components/              # Shared UI components
  pages/                   # Route-level pages
  context/AppContext.jsx   # Global app state (auth, courses, enrollments)
  data/                    # Mock data — being replaced by API calls in Phase 2
  routes/AppRouter.jsx     # HashRouter + route table
  utils/                   # Validators and shared helpers

server/                    # Express backend
  server.js                # Entry point — connects DB, starts HTTP server
  app.js                   # Express app (middleware pipeline, routes)
  config/env.js            # Env var loader — single source of truth
  db/connection.js         # Mongoose connection
  routes/*.routes.js       # Route definitions; aggregated in routes/index.js
  controllers/*.js         # Request handlers; crudFactory.js for uniform CRUD
  models/*.js              # Mongoose schemas
  middleware/              # authPlaceholder.js (real auth), errorHandler, notFound
  data/store.js            # Thin persistence abstraction over models
  utils/                   # ApiError, asyncHandler, createCrudRouter, id

.claude/                   # Project Claude config, plans, and reference PDFs
.env.example               # Backend env template (copy to .env; never commit .env)
```

## Tech Stack

### Frontend

- React 19 + Vite 8
- React Router DOM v7 (`HashRouter`)
- Tailwind CSS 3 for styling
- Plain JavaScript (no TypeScript)
- Custom validators in `src/utils/validators.js` (no external form libraries)
- `jspdf` for generating certificates

### Backend

- Node.js + Express 5
- Mongoose + MongoDB
- `bcrypt` for password hashing
- `jsonwebtoken` for JWT auth
- `helmet`, `cors`, `morgan` for security/CORS/logging
- `dotenv` for env loading (via `server/config/env.js`)

### Dev tooling

- `nodemon` (backend watch)
- ESLint 9 (`npm run lint`)
- Playwright (`npm run test:e2e`)
- `gh-pages` for the current frontend deploy (`npm run deploy`)

## Backend Conventions

- **RESTful layering:** `routes/*.routes.js` → `controllers/*.controller.js` → `models/*.js`. All feature routers are aggregated in `server/routes/index.js` and mounted under `env.API_PREFIX` (default `/api/v1`). Use `server/utils/createCrudRouter.js` + `server/controllers/crudFactory.js` for uniform CRUD; put entity-specific rules in the controller, not the router.
- **Middleware pipeline (in `server/app.js`):** `helmet` → `cors` → `morgan` (when `ENABLE_REQUEST_LOGS`) → `express.json` + `express.urlencoded` → API routes → `notFound` → `errorHandler`. Don't reorder without a reason.
- **Errors:** Throw `ApiError` from `server/utils/ApiError.js`. Wrap every async controller with `server/utils/asyncHandler.js` so thrown errors reach the global error handler. Never respond to errors directly from a controller.
- **Persistence abstraction:** Prefer `server/data/store.js` (`list` / `findById` / `create` / `update` / `remove`) over touching Mongoose models directly from controllers — keeps controllers thin and the persistence layer swappable.
- **Config:** All env reads go through `server/config/env.js`. No scattered `process.env.X` calls. No hardcoded secrets, connection strings, or JWT secrets anywhere in source.
- **Auth:** JWT is issued in `server/controllers/auth.controller.js` on login (expiry from `JWT_EXPIRES_IN`, default 7 d). Protect write routes with the middleware in `server/middleware/authPlaceholder.js`, which verifies JWTs and enforces role/owner-based authorization. On update/delete, the controller must verify the authenticated user owns the resource (or is admin) before proceeding.
- Note: `authPlaceholder.js` is misnamed — it is the **real** auth middleware, not a stub. Rename to `auth.js` is a separate, optional follow-up.

## Frontend–Backend Integration

### Base URLs

- **Live (production):** `https://course-management-system-fluu.onrender.com/api/v1`
- **Local dev:** `http://localhost:5000/api/v1`
- Selected via `VITE_API_URL`; read once in `src/utils/api.js`. **No hardcoded URLs in components or pages.**

### Auth endpoints (public)

| Method | Path             | Body                                       | Notes                                     |
|--------|------------------|--------------------------------------------|-------------------------------------------|
| POST   | `/auth/register` | `{ name, email, password, role }`          | `role` defaults to `"student"`            |
| POST   | `/auth/login`    | `{ email, password }`                      | Returns `{ token, user }`                 |
| GET    | `/auth/me`       | — (requires `Authorization: Bearer <t>`)   | Current user                              |

### Resource endpoints

Resources: `/courses`, `/modules`, `/lessons`, `/enrollments`, `/purchases`, `/progress`, `/reviews`, `/support-tickets`.

- **Public:** `GET /:resource`, `GET /:resource/:id`.
- **Protected** (requires `Authorization: Bearer <token>`): `POST /:resource`, `PUT /:resource/:id`, `DELETE /:resource/:id`.

### Client rules

- All HTTP goes through `src/utils/api.js` — **no `fetch` or `axios` in components or pages.**
- Store the JWT from login/register via a context-backed `localStorage` wrapper; attach as `Authorization: Bearer <token>` on protected calls.
- Replace `mockCourses` / `mockUsers` reads in `src/context/AppContext.jsx` with API calls. **Keep the context's public shape stable** so pages don't need rewrites.
- Validate client-side with `src/utils/validators.js`; surface server 4xx/5xx as user-friendly messages via `src/components/Toast.jsx`.
- Every data-fetching view renders **loading, error, empty, and success** states explicitly.
- **IDs are MongoDB ObjectIds** (e.g. `6801abc...`), not the Phase 1 string IDs — never hardcode IDs.
- **Passwords are never returned** in any response.
- **Free-tier cold start:** first request after ~15 min idle takes ~30 s — show a "waking up" indicator if pending > 3 s.

## Running Locally

Two terminals — `concurrently` is **not** installed, and should not be added without team agreement.

- **Frontend:** `npm run dev` (Vite, port 5173)
- **Backend:** `npm run dev:server` (nodemon, `server/server.js`, port 5000 by default)

Before the first backend run: `cp .env.example .env` and fill in `MONGODB_URI` and a non-default `JWT_SECRET`. `.env` must never be committed.

## Deployment

- **Frontend:** currently `gh-pages` via `npm run deploy`; Netlify is an acceptable alternative per the PDF.
- **Backend:** Render (or Cyclic / Heroku) per the PDF.
- **CORS:** set `CLIENT_ORIGIN` on the backend to the deployed frontend URL.
- Submission requires both live URLs in the README along with full API documentation.

## Styling Conventions

- Tailwind utility classes on JSX `className`. Theme tokens (colors, fonts) extended in `tailwind.config.js`; CSS variables and `@tailwind` layers in `src/index.css`.
- Palette: dark theme with amber `#d97706` accent.
- Typography: Playfair Display (headings), DM Sans (body).
- Consistent radius: 8 px inputs, 16 px cards.
- Accessible focus states on all interactive elements.
