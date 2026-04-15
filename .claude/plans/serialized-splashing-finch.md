# Plan: Update `.claude/CLAUDE.md` for Phase 2

## Context

Phase 2 of the CSC443 project has started (due **2026-04-20**). The Phase 2 PDF (`.claude/CSC443 - Project Phase 2.pdf`) requires a Node/Express RESTful API backed by MongoDB/PostgreSQL/MySQL, JWT + bcrypt auth, protected/authorized routes, full-stack integration (replacing all mock data with real API calls), and cloud deployment.

A `git pull` (`22d494d..ddd0d28`) has already landed:
- A fully scaffolded `server/` tree using **Express 5 + Mongoose/MongoDB + bcrypt + jsonwebtoken + helmet + cors + morgan + dotenv**. `server/controllers/auth.controller.js` and `server/middleware/authPlaceholder.js` implement real JWT issuance and verification (despite the "placeholder" filename).
- A Tailwind CSS migration across the frontend — `tailwind.config.js`, `src/index.css` with `@tailwind base/components/utilities`, and utility classes throughout `src/pages/*` and `src/components/*`.
- Frontend still reads mocks from `src/data/mockCourses.js` and `src/data/mockUsers.js` via `src/context/AppContext.jsx` — **API consumption is the Phase 2 work that remains**.

The current `.claude/CLAUDE.md` contradicts reality on two major points:
1. Declares **Phase 1 — Frontend Only** and forbids `server/` directories or backend dependencies.
2. Declares **inline CSS style objects, no Tailwind**.

Both are now false. If left as-is, future instructions will be graded against rules the team has already (correctly) outgrown. This plan updates CLAUDE.md to match the Phase 2 codebase. **Scope is limited to CLAUDE.md only — the Phase 2 implementation plan (wiring frontend to API, auth flows, deployment) is a separate follow-up planning session.**

---

## File to modify

- `/home/sami/course-management-system/.claude/CLAUDE.md` (single file)

## Sections to keep unchanged

These stay — they're still correct and still graded:
- `## Project Context` (university project, graded)
- `## Code Quality Standards` → Readability First, SOLID Principles, File Organization, Immutability, Error Handling

## Sections to replace

### 1. `## Current Phase` — rewrite

Replace the entire Phase 1 block with a Phase 2 block:

- **Phase 2 — Full-Stack Integration.** Due 2026-04-20.
- Summarize PDF requirements (concise bullets, not a copy-paste):
  - RESTful Express API for users + primary data entities (CRUD)
  - MongoDB via Mongoose (already wired)
  - bcrypt password hashing, JWT on login, protected write routes, ownership-based authorization on update/delete
  - Replace all mock data in the React frontend with real `fetch`/`axios` calls; surface loading + success/error states
  - Deploy backend (Render/Cyclic/Heroku) and frontend (Netlify/GH Pages); entire app must be reachable online
  - Comprehensive README: team, entities, deploy links, local setup, API docs, screenshots, per-member contributions, challenges
- **Drop** the "Do NOT install backend dependencies / Do NOT create `server/`" rules — obsolete.

### 2. `## Tech Stack` — expand

Replace the current single list with **Frontend / Backend / Dev tooling** subsections reflecting actual `package.json`:

- **Frontend:** React 19 + Vite 8, React Router DOM v7 (HashRouter), Tailwind CSS 3, plain JavaScript, custom validators in `src/utils/validators.js`, `jspdf` for certificates.
- **Backend:** Node.js + Express 5, Mongoose + MongoDB, `bcrypt`, `jsonwebtoken`, `helmet`, `cors`, `morgan`, `dotenv`.
- **Dev tooling:** `nodemon` (backend watch), ESLint 9, Playwright (`test:e2e`), `gh-pages` (frontend deploy).

### 3. `## Styling Conventions` — rewrite

Swap the "inline CSS style objects / no Tailwind" rules for:
- Tailwind utility classes on JSX `className`; theme tokens extend in `tailwind.config.js`; CSS variables + `@tailwind` layers in `src/index.css`.
- Keep the palette and typography conventions (amber `#d97706` accent, Playfair Display headings, DM Sans body, 8 px input / 16 px card radius, accessible focus states).

## Sections to add

### 4. `## Project Structure`

Short tree-style reference so future work lands in the right place:
- `src/` — React frontend (pages, components, context, data, utils, routes)
- `server/` — Express backend: `app.js`, `server.js`, `config/`, `db/`, `routes/`, `controllers/`, `models/`, `middleware/`, `data/store.js`, `utils/`
- `.claude/` — project-level Claude config + planning/reference docs
- `.env.example` — backend env vars (copy to `.env`, never commit)

### 5. `## Backend Conventions`

- **RESTful layering:** `routes/*.routes.js` → `controllers/*.controller.js` → `models/*.js`. Aggregate routes in `server/routes/index.js`. Use `server/utils/createCrudRouter.js` + `server/controllers/crudFactory.js` for uniform CRUD; add entity-specific logic in the controller.
- **Middleware pipeline (set up in `server/app.js`):** `helmet` → `cors` → `morgan` → `express.json()` → routes → `notFound` → `errorHandler`. Don't reorder without reason.
- **Errors:** throw `ApiError` (`server/utils/ApiError.js`) from controllers; wrap async handlers with `server/utils/asyncHandler.js` so nothing bypasses the global error handler. Never `res.send` an error directly from a controller.
- **Persistence abstraction:** go through `server/data/store.js` rather than calling Mongoose models from controllers where possible — keeps controllers swappable if the DB changes.
- **Config:** all env reads via `server/config/env.js`. No `process.env.X` scattered in code. No hardcoded secrets, URIs, or JWT strings.
- **Auth:** JWT issued in `auth.controller.js` on login (7 d expiry via `JWT_EXPIRES_IN`). Protect write routes with the middleware in `server/middleware/authPlaceholder.js` (note: misnamed — it's the real auth middleware; rename to `auth.js` is a separate future task, flagged). Enforce owner-or-admin checks on update/delete.

### 6. `## Frontend–Backend Integration`

- API base URL comes from a Vite env var (e.g. `VITE_API_URL`) read in a small `src/utils/api.js` client — not hardcoded per component. Add `VITE_API_URL` to a frontend env example.
- Replace `mockCourses` / `mockUsers` reads in `src/context/AppContext.jsx` with `fetch` calls. Keep the context shape identical so pages don't need to change.
- Every API call must surface loading + success/error states in the UI (Phase 2 requirement; use the existing `Toast` component for feedback).
- Store the JWT in `localStorage` (or a context-backed wrapper), attach as `Authorization: Bearer <token>` on protected requests.

### 7. `## Running Locally`

- Frontend: `npm run dev` (Vite, port 5173)
- Backend: `npm run dev:server` (nodemon watching `server/server.js`, port 5000 by default)
- Two terminals required — `concurrently` is **not** installed; do not add it without the team's agreement.
- Required backend env before first run: copy `.env.example` → `.env`, fill `MONGODB_URI` and a non-default `JWT_SECRET`.

### 8. `## Deployment`

- Frontend: currently `gh-pages` via `npm run deploy`. Phase 2 PDF suggests Netlify as an acceptable alternative.
- Backend: Render (or Cyclic/Heroku) per the PDF.
- CORS: `CLIENT_ORIGIN` env var must match the deployed frontend URL.
- Submission requires both live URLs and a README with full API documentation.

---

## Loose ends to surface (not in scope to fix here)

- `server/middleware/authPlaceholder.js` is not a placeholder — it's the production auth middleware. Noting in CLAUDE.md now; actual rename is a separate commit.
- Frontend currently has no `VITE_API_URL` convention; introducing it belongs to the follow-up Phase 2 implementation plan, not this doc edit.

## Verification

After editing `.claude/CLAUDE.md`:

1. Grep sanity checks — none of these should return hits:
   - `Phase 1`
   - `no backend`
   - `Do NOT create any .server.`
   - `Inline CSS style objects`
   - `no Tailwind`
2. Manual read-through: confirm each section (Phase, Tech Stack, Project Structure, Backend Conventions, Frontend–Backend Integration, Running Locally, Deployment, Styling) is internally consistent and references only files that exist (`server/config/env.js`, `server/utils/asyncHandler.js`, `server/utils/ApiError.js`, `src/context/AppContext.jsx`, `tailwind.config.js`, `.env.example`).
3. Spot-check that the "keep" sections (Code Quality Standards, SOLID, Immutability, Error Handling) still read naturally in context of a full-stack project — add a one-line note that these apply to **both** frontend and backend.

## Next (after this plan lands)

Separate planning session for the actual Phase 2 project work: design `src/utils/api.js`, port `AppContext` off mocks, auth UX flow (JWT storage + protected routes on the client), deployment pipeline, and README additions.
