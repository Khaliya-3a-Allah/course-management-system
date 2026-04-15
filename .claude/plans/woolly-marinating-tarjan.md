# Plan — Member 3: Frontend API Integration + Real TOTP 2FA

## Context

CSC443 Phase 2 (due **2026-04-20**). The Express + MongoDB backend is live, but the React frontend still reads from `src/data/mockCourses.js` and `src/data/mockUsers.js`, and the `TwoFactorForm` step is a purely client-side mock (the 6-digit code is generated in the browser and compared in the browser). Member 3 must:

1. Replace all mock data in the frontend with real HTTP calls to `/api/v1/*`, wiring JWT auth and surfacing loading / error / empty / success everywhere.
2. Upgrade the 2FA mock into **real TOTP 2FA** (authenticator-app based) on both the backend and the frontend — per user decision, Member 3 owns both ends.

This plan extends (does not replace) `.claude/plans/member3-frontend-api-integration.md`. Read that file first for the base scope and the API contract; this file adds the 2FA backend work and locks in the three open-question answers.

## Decisions locked in this session

| Question | Decision |
|---|---|
| 2FA strategy | **Real TOTP** via authenticator app (Google Authenticator / Authy). Member 3 implements backend endpoints *and* frontend wiring. |
| Edit/Delete controls for non-owners | **Hide by default**; on any 403 from the server, show a "Not authorized" toast and refresh the affected view. |
| Register role | **Keep the existing role picker**; send the selected role in `POST /auth/register`. |

## Key findings from code inspection

- `src/context/AppContext.jsx` currently seeds from `mockCourses` / `mockUsers` (lines 2–3, 63–65) and exposes a wide synchronous API: `addCourse`, `updateCourse`, `deleteCourse`, `enrollCourse`, `purchaseCourse`, `unenrollCourse`, `saveCourse`, `unsaveCourse`, `submitReview`, `updateProfile`, `markLessonComplete`, `markCourseComplete`, `getCourseProgress`, plus `logout` and setters. **`login` and `register` are NOT exported today** — `src/pages/Login.jsx` and `src/pages/Register.jsx` call `setCurrentUser` / `setUsers` directly. After this plan they must be `async` actions on the context.
- User-side ownership currently uses `currentUser.createdCourseIds` (an array on the user doc). The backend enforces ownership via a `creator` reference on each resource. The frontend must migrate to checking `currentUser._id === resource.creator` (or `currentUser.role === "admin"`).
- `src/utils/` has only `codeGenerator.js` and `validators.js`. No `api.js`, no `authStorage.js`.
- `server/controllers/auth.controller.js` has `register` / `login` / `me` / `logout`. No 2FA surface. `User` model (at `server/models/User.js`) has `email`, `password`, `role`, `phone`, `bio`, etc. — no 2FA fields.
- `src/components/TwoFactorForm.jsx` takes `verificationCode` as a prop and compares it locally (line 71). It needs to be rewired to POST to the backend and consume a server-side challenge token.

## Approach

### Layered integration, not a big-bang swap

Implement in thin, independently verifiable slices so the app keeps running at every step:

1. **HTTP + storage foundations** — add `src/utils/api.js` and `src/utils/authStorage.js`. Add `VITE_API_URL` to the frontend env.
2. **Auth rewire (no 2FA yet)** — add `login` / `register` / `logout` async actions to AppContext. Pages switch from `setCurrentUser` to these.
3. **Read paths** — `fetchCourses` → Home / Courses / CourseDetails; then modules, lessons.
4. **Write paths + ownership UI** — `createCourse` / `updateCourse` / `deleteCourse`; hide controls when `currentUser._id !== resource.creator`; toast on 403.
5. **Remaining entities** — enrollments, purchases, progress, reviews, support-tickets.
6. **Backend TOTP** — new model fields + endpoints.
7. **Frontend TOTP** — enroll UI (Dashboard/Profile) + login challenge flow rewiring TwoFactorForm.
8. **Cold-start + cleanup.**

### TOTP architecture

**Library:** `speakeasy` (RFC 6238 TOTP) on the backend, `qrcode.react` on the frontend to render the `otpauth://` URL as a QR image.

**User-model additions** (`server/models/User.js`):

| Field | Type | Notes |
|---|---|---|
| `twoFactorSecret` | `String`, `select: false` | Base32 secret; only read via `.select("+twoFactorSecret")` during verify/enable. |
| `twoFactorEnabled` | `Boolean`, default `false` | Source of truth for branching login. |

**Challenge token for step-1 login:** when a 2FA-enabled user passes password check, issue a short-lived (5 min) JWT with `{ id, purpose: "2fa-pending" }`. The client never stores this as the session token — it lives in React state until step 2 succeeds.

**New endpoints** (mounted under `/api/v1/auth`):

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/2fa/setup` | full JWT | Generates a fresh base32 secret, saves it on the user (but `twoFactorEnabled` stays `false`), returns `{ otpauthUrl, secret }`. Secret is surfaced once, for the QR + manual-entry fallback. |
| POST | `/auth/2fa/enable` | full JWT | Body `{ code }`. Verifies TOTP against the saved secret with a ±1-window tolerance; flips `twoFactorEnabled = true`. |
| POST | `/auth/2fa/verify` | challenge JWT (purpose `2fa-pending`) | Body `{ code }`. Verifies TOTP; on success issues the real session JWT and returns `{ token, data: user }`. |
| POST | `/auth/2fa/disable` | full JWT + `{ password, code }` | Re-verifies password *and* current TOTP before clearing the secret and flipping `twoFactorEnabled = false`. |

**Modified `POST /auth/login`:** after password check, if `user.twoFactorEnabled` → respond `{ success: true, twoFactorRequired: true, challengeToken }` (no session token yet). Otherwise current behavior (`{ token, data: user }`).

**`authenticateRequest` middleware stays unchanged** — it only accepts full JWTs. The challenge token is verified inside `verify2FA` explicitly (checking `purpose === "2fa-pending"`), so it can never be used against protected routes.

## Files to create

### Frontend
- `src/utils/api.js` — single `fetch` wrapper (`apiGet/apiPost/apiPut/apiDelete`), reads `import.meta.env.VITE_API_URL` once, parses JSON, lifts `.status` and `.message` onto thrown `Error`s, maps network failures to `status === 0`.
- `src/utils/authStorage.js` — `readToken` / `writeToken` / `clearToken` / `readUser` / `writeUser` / `clearUser`, all with `try/catch` around `JSON.parse` and `localStorage` per CLAUDE.md.
- `src/hooks/useAsyncResource.js` *(optional helper, only if repetition is obvious across ≥3 pages)* — encapsulates the `{ status, data, error }` state matrix. Default: skip it and inline the states; add only if the duplication becomes painful.
- `.env.local.example` (frontend) — `VITE_API_URL=http://localhost:5000/api/v1` with the live URL as a commented alternate. Confirm `.env.local` is already in `.gitignore` (it is).

### Backend
- `server/controllers/twoFactor.controller.js` — `setup2FA`, `enable2FA`, `verify2FA`, `disable2FA`. Each wrapped in `asyncHandler`; each throws `ApiError` on failure.
- `server/routes/twoFactor.routes.js` — mounts the four endpoints; wire into `server/routes/auth.routes.js` under `/2fa/*`.
- `server/utils/totp.js` — thin module around `speakeasy.generateSecret` / `speakeasy.totp.verify` + `issuer`/`label` formatting, so controllers stay free of library internals.

## Files to modify

### Frontend
- `src/context/AppContext.jsx` — **largest change.** Remove mock imports for state seeding. Add async actions (`login`, `register`, `logout`, `fetchCourses`, `createCourse`, `updateCourse`, `deleteCourse`, and equivalents for modules / lessons / enrollments / purchases / progress / reviews / support-tickets). **Preserve the current public shape** so pages don't need rewrites — the *names* and *signatures* stay the same; only the implementations change. Add `authStatus` (`"idle" | "loading" | "authenticated" | "error"`) and per-collection `coursesStatus` (etc.) for the loading/error/empty/success rendering. On mount, if `readToken()` returns a token, call `GET /auth/me` to rehydrate.
- `src/pages/Login.jsx` + `src/components/LoginForm.jsx` — call `login({ email, password })` from context. If it resolves with `{ twoFactorRequired: true, challengeToken }`, render `TwoFactorForm`; otherwise redirect. (Sami owns these pages per memory — coordinate before large edits.)
- `src/components/TwoFactorForm.jsx` — drop the local `verificationCode` prop; accept a `challengeToken` and an `onSubmit(code)` callback. Remove the client-side comparison (line 71). The 60-second countdown becomes informational only (real TOTP codes rotate every 30 s regardless of UI timer). Keep the 5-attempt lockout but enforce it through the server response path.
- `src/pages/Register.jsx` — `register({ name, email, password, role })` from context; keep the existing role picker; show loading; toast on error. After registration success (not 2FA-enabled), route to an "Enroll in 2FA" prompt (optional step).
- Data-bearing pages — `Home`, `Courses`, `CourseDetails`, `CourseForm`, `ModuleDetails`, `Dashboard`, `Checkout`, `Certificates`, `Support`. Each: consume the new async actions; render loading / error / empty / success explicitly; no `fetch`/`axios` directly.
- `src/pages/CourseForm.jsx` + `src/pages/Dashboard.jsx` — migrate ownership check from `currentUser.createdCourseIds.includes(courseId)` to `currentUser._id === course.creator || currentUser.role === "admin"`. Hide Edit/Delete controls when the check fails; on any server 403, call `addToast("Not authorized", "error")` and re-fetch.
- `src/components/CourseCard.jsx` — map only from API-returned fields; stop assuming the Phase 1 shape (numeric IDs, local-only fields).
- New small component `src/components/TwoFactorEnroll.jsx` — renders the QR (from `qrcode.react`) + manual-entry secret + code-verification form; posts to `/auth/2fa/setup` then `/auth/2fa/enable`. Surfaced from Dashboard → Profile / Security section.

### Backend
- `server/models/User.js` — add `twoFactorSecret` (`select: false`) and `twoFactorEnabled` (`Boolean`, default `false`).
- `server/controllers/auth.controller.js` — branch `login` on `user.twoFactorEnabled`; when true, issue challenge token and return `{ twoFactorRequired: true, challengeToken }` instead of the session token.
- `server/routes/auth.routes.js` — mount the new `twoFactor.routes.js` sub-router under `/2fa`.
- `server/utils/tokens.js` (new) or existing JWT helpers — centralize `signSessionToken(userId)` and `signChallengeToken(userId)` so `purpose` and expirations are in one place.
- `package.json` (backend deps) — add `speakeasy`. Frontend adds `qrcode.react`.

## Reuse, not duplication

- `server/utils/ApiError.js` + `server/utils/asyncHandler.js` — every new controller uses these.
- `server/data/store.js` — `findById("users", id)` and `update("users", id, patch)` for the 2FA field writes; don't call the Mongoose model directly from controllers.
- `server/config/env.js` — add `TOTP_ISSUER` (default `"CMS-Phase2"`) and `JWT_CHALLENGE_EXPIRES_IN` (default `"5m"`) here; no scattered `process.env`.
- `src/components/Toast.jsx` via `addToast` — all user-facing feedback.
- `src/utils/validators.js` — `validateTwoFactorCode` already exists; reuse it for the enroll form and the login challenge form.

## Verification

End-to-end, in order:

1. `npm run dev:server` (backend, 5000) and `npm run dev` (frontend, 5173) in separate terminals, against a fresh `.env`.
2. **Register** a new user through the UI → token stored, reload keeps the session, `GET /auth/me` succeeds. No 2FA prompt (user has `twoFactorEnabled: false`).
3. From Dashboard → "Security" → **Enable 2FA**: QR renders, scan in Google Authenticator, type the current 6-digit code → `twoFactorEnabled = true` in DB.
4. Log out, log in: server responds with `twoFactorRequired: true` + challenge token → UI renders TwoFactorForm → typing the current Authenticator code issues the session JWT → redirect succeeds.
5. Enter a wrong code 5 times → UI locks out, server also rejects (attempt counting server-side if time permits, client-side otherwise).
6. As a logged-in **student**, visit another instructor's course page → Edit/Delete buttons are hidden. Manually `curl PUT /courses/:id` with that student's token → 403. Simulate the same request from the UI (devtools) → toast: "Not authorized".
7. Full course CRUD as the course owner: create → edit → delete; Network tab shows real `POST/PUT/DELETE`; state reflects server response.
8. Disconnect network → every data-bearing page renders its error state (no blank screens).
9. Point `VITE_API_URL` at the live Render URL after ~15 min idle → the "Waking up the server…" indicator renders during cold start (>3 s pending).
10. `npm run lint` clean; `npm run test:e2e` passes the golden flow (register → enroll 2FA → log out → log in with 2FA → enroll in course → view course).
11. **Backend unit test** (if time): `speakeasy.totp` generate + verify round-trip in `verify2FA`.

## Risks / watch-outs

- **Shared context shape is load-bearing.** Nine pages consume AppContext; renaming any field forces a cascade. Preserve the existing names exactly.
- **Ownership-check migration** is silent — if a page still references `createdCourseIds`, the UI *looks* fine but the control is always hidden. Grep for `createdCourseIds` before calling step 4 done.
- **TOTP clock drift** — set `window: 1` on `speakeasy.totp.verify` to allow ±30 s.
- **Challenge token confusion** — never store it under the session-token key in `localStorage`; keep it in component state only. The session-token key is reserved for full JWTs.
- **Phase 2 due 2026-04-20** — six days. If the TOTP backend slips, keep the frontend challenge UI behind a feature flag (`VITE_2FA_ENABLED`) and ship the integration first.
- **Sami owns Login/Register pages** — coordinate before large edits to those files.

## References

- `.claude/plans/member3-frontend-api-integration.md` — base scope for the frontend integration; this plan is a strict superset.
- `.claude/CLAUDE.md` — API contract, client rules, backend conventions.
- `server/controllers/auth.controller.js`, `server/models/User.js` — current auth surface.
- `src/context/AppContext.jsx` — the context shape this plan must preserve.
- `src/components/TwoFactorForm.jsx` — the form to rewire (line 71 is the mock-comparison site).
