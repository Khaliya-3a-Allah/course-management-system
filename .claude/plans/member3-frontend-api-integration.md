# Plan — Member 3: Frontend Integration with Live Backend API

> **Execution note:** this plan will be executed in a fresh Claude context. Everything needed to run it is in this file or in `.claude/CLAUDE.md`. Do not assume prior conversational context.

## Context

CSC443 Phase 2 (due **2026-04-20**) — full-stack integration. The Express + MongoDB backend is already built and deployed. Member 3's scope is to **replace all mock data in the React frontend with real backend requests**, wire login/signup to JWT auth, and provide consistent loading/error/empty/success feedback everywhere that talks to the API.

**Live API base:** `https://course-management-system-fluu.onrender.com/api/v1`
**Local API base:** `http://localhost:5000/api/v1` (via `npm run dev:server`)

The full API contract and client rules are in `.claude/CLAUDE.md` under **Frontend–Backend Integration** — read those first; this plan does not duplicate them.

## Current state snapshot (as of 2026-04-14)

- `src/context/AppContext.jsx` imports `mockCourses` from `src/data/mockCourses.js` and `mockUsers` from `src/data/mockUsers.js`; all state reads/writes hit those arrays.
- `src/utils/` contains only `codeGenerator.js` and `validators.js` — **no `api.js` client exists yet**.
- No `VITE_API_URL` is defined; no frontend `.env.example` is present.
- Auth UI already exists: `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/components/LoginForm.jsx`, `src/components/TwoFactorForm.jsx`. They currently call into AppContext, not HTTP.
- `src/components/Toast.jsx` is the single source of user feedback and is already wired into AppContext.
- All pages use Tailwind (`tailwind.config.js` + `src/index.css`). Keep styling conventions from CLAUDE.md.

Constraint: **Sami owns login/register pages** (per project memory). Confirm with Sami before large edits to those specific files.

## Files to create

1. **`src/utils/api.js`** — single HTTP client.
   - Read `import.meta.env.VITE_API_URL` once; throw a clear error at import time if unset in dev.
   - Export `apiGet(path, { token })`, `apiPost(path, body, { token })`, `apiPut(path, body, { token })`, `apiDelete(path, { token })`.
   - Set `Content-Type: application/json` on bodied requests; `JSON.stringify` the body.
   - Attach `Authorization: Bearer <token>` only when `token` is passed.
   - Parse JSON once; on non-2xx throw an `Error` with `.status` and `.message` lifted from the server payload (fall back to `response.statusText`).
   - Wrap the underlying `fetch` call so network failures surface as an `Error` with `.status === 0` and a friendly message.

2. **`src/utils/authStorage.js`** — tiny wrapper over `localStorage` for `token` and `user`.
   - `readToken()` / `writeToken(token)` / `clearToken()`.
   - `readUser()` / `writeUser(user)` / `clearUser()` with `try/catch` around `JSON.parse` per CLAUDE.md error-handling rules.

3. **`.env.example`** (or `.env.local.example` — check whether the existing root `.env.example` is strictly backend first).
   - Add `VITE_API_URL=http://localhost:5000/api/v1` with a commented-out production URL.
   - Confirm `.env.local` and any new env files are in `.gitignore`.

## Files to modify

1. **`src/context/AppContext.jsx`** — the core change.
   - Remove imports from `src/data/mockCourses.js` / `src/data/mockUsers.js` for state seeding.
   - Initial state from `authStorage` (token, currentUser) + empty arrays; hydrate entity arrays via `useEffect` on mount.
   - Replace mock-mutating helpers with async actions that call `apiGet/Post/Put/Delete` and update context on resolve:
     - `login({ email, password })` → `POST /auth/login` → persist token + user → update context.
     - `register({ name, email, password, role = "student" })` → `POST /auth/register` → persist token + user → update context.
     - `logout()` → clear storage → reset context.
     - `fetchCourses()`, `createCourse(data)`, `updateCourse(id, data)`, `deleteCourse(id)`.
     - Same CRUD pattern for modules, lessons, enrollments, purchases, progress, reviews, support-tickets — add only what the UI actually uses.
   - **Preserve the exported surface** (names and signatures of `currentUser`, `courses`, `login`, `register`, `logout`, `enrollInCourse`, etc.) so pages don't need component-level rewrites. Only swap implementations.
   - `src/data/mockCourses.js` / `src/data/mockUsers.js` can remain for reference/tests — do not delete in this plan.

2. **`src/pages/Login.jsx`** + **`src/components/LoginForm.jsx`** (coordinate with Sami):
   - Await the async `login()` from context; show loading while awaiting; toast on error.
   - On success, redirect per the existing UX.

3. **`src/pages/Register.jsx`**: same treatment, defaulting `role: "student"`.

4. **Data-bearing pages** — audit each, wire to the async AppContext actions, render **loading + error + empty + success** explicitly:
   - `src/pages/Home.jsx`
   - `src/pages/Courses.jsx`
   - `src/pages/CourseDetails.jsx` — uses `:id` param; it is now an ObjectId, not a numeric string.
   - `src/pages/CourseForm.jsx` — wire to `createCourse` / `updateCourse`.
   - `src/pages/ModuleDetails.jsx`
   - `src/pages/Dashboard.jsx`
   - `src/pages/Checkout.jsx` — `/purchases`.
   - `src/pages/Certificates.jsx`
   - `src/pages/Support.jsx` — `/support-tickets`.

5. **`src/components/Navbar.jsx`** — should mostly be unchanged if it only reads `currentUser` and calls `logout`. Verify.

6. **`src/components/CourseCard.jsx`** — make sure it doesn't assume a local-only field removed by the backend shape; map only from API-returned fields.

## Step-by-step execution

Do not try to wire everything at once. Each step below is independently testable:

1. **Foundations.** Create `src/utils/api.js`, `src/utils/authStorage.js`, and the env example. Verify a throwaway `apiGet("/courses")` call returns a JSON array against the live URL.
2. **Auth wiring.** Swap `login`, `register`, `logout` in AppContext to API calls. Confirm token persists across reloads and `GET /auth/me` works on rehydration.
3. **Courses read path.** Wire `fetchCourses` and render in `Home.jsx` + `Courses.jsx` + `CourseDetails.jsx`. Full state matrix (loading/error/empty/success).
4. **Courses write path.** Wire `createCourse` / `updateCourse` / `deleteCourse` via `CourseForm.jsx` + any delete triggers. Confirm 401 on missing token produces a friendly toast.
5. **Remaining entities.** One at a time: modules → lessons → enrollments → purchases → progress → reviews → support-tickets. Same state matrix each time.
6. **Cold-start UX.** Add a subtle "Waking up the server…" indicator if a request is pending > 3 s; cold starts on the free tier take ~30 s.
7. **Cleanup.** Remove any residual direct imports of `mockCourses` / `mockUsers` outside `AppContext.jsx`. Do not delete the mock files themselves.

## Conventions (applies to every file touched)

- No `fetch` / `axios` outside `src/utils/api.js`.
- No hardcoded IDs. IDs are ObjectIds; always come from fetched data or route params.
- Every data-fetching view explicitly handles loading, error, empty, success.
- Use `Toast` for all user feedback — both success and error.
- Validate with `src/utils/validators.js` before POST/PUT; server errors are the second line of defense.
- Keep AppContext's public shape stable.

## Open questions to raise before implementation

1. **2FA (`src/components/TwoFactorForm.jsx`)**: the backend doesn't expose a 2FA endpoint. Should the 2FA step be hidden/removed in Phase 2, or should we ask Members 1 & 2 to add a backend flow? **Ask the user before deleting the UI.**
2. **Ownership UI**: backend enforces owner-or-admin on update/delete. Should `Edit` / `Delete` controls be hidden for non-owners, or shown but gracefully fail with a toast? Confirm the preferred UX.
3. **Role UX**: backend accepts `role` on register. Should the register form expose a role picker, or default everyone to `"student"`?

## Verification

1. `npm run dev:server` (port 5000) and `npm run dev` (port 5173) both up in separate terminals.
2. Register a fresh user through the UI → token stored → reload keeps the session → `GET /auth/me` succeeds.
3. Log out → log in → same.
4. As a logged-in user, create → edit → delete a course. Verify the Network tab shows real `POST/PUT/DELETE` calls and the UI reflects the server state (not optimistic-only mock).
5. As a logged-out user, protected actions either hide or show a friendly "Please sign in" toast rather than crashing.
6. Point `VITE_API_URL` at the live URL after ~15 min idle → confirm the "Waking up" indicator renders during cold start.
7. Disconnect network → confirm error states render on every data-bearing page (no blank screens).
8. `npm run lint` clean; `npm run test:e2e` passes on the golden login + enroll + view-course flow.

## References

- `.claude/CLAUDE.md` — authoritative API contract, client rules, conventions, tech stack.
- Project memory: `project_phase2.md` for the phase context; `user_sami_role.md` (Sami owns login/register).
- Backend source (for request/response shapes): `server/routes/`, `server/controllers/`, `server/models/`.
