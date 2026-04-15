# Finish API integration in AppContext.jsx

## Context

Member 3's PR replaced mock data for auth and courses, but left eight user-scoped helpers in `src/context/AppContext.jsx` as client-only state mutations:

- `enrollCourse`, `purchaseCourse`, `unenrollCourse`
- `saveCourse`, `unsaveCourse`
- `markLessonComplete`, `markCourseComplete`
- `submitReview`

Today these mutate React state only — the data is lost on reload/logout. That violates the project rule that `AppContext.jsx` should only hit the API (no stubs, no localStorage fallbacks for user data). This plan finishes the integration so every write persists to the backend and every read is sourced from it.

Dependencies like `src/utils/api.js`, `src/utils/authStorage.js`, `ResourceState`, and the token-attaching pattern (`addCourse` / `updateCourse` / `deleteCourse`) are already in place and will be reused.

## Endpoints we will use

All through `src/utils/api.js` (`apiGet` / `apiPost` / `apiPut` / `apiDelete`) with `Authorization: Bearer <token>` on writes.

| Helper | Verb + path | Body / notes |
|---|---|---|
| enrollCourse | `POST /enrollments` | `{ userId, courseId }` |
| unenrollCourse | `DELETE /enrollments/:id` | find row by `(userId, courseId)` from state |
| purchaseCourse | `POST /purchases` + `POST /enrollments` | `{ userId, courseId, amount, status: "completed" }` then enroll for consistency |
| saveCourse / unsaveCourse | `PUT /users/{currentUser.id}` | `{ savedCourseIds: [...] }` — read-modify-write |
| markLessonComplete | first call: `POST /progress`, subsequent: `PUT /progress/:id` | `{ userId, courseId, completedLessonIds, percentage }` |
| markCourseComplete | same upsert pattern on `/progress` | add `{ completed: true, percentage: 100 }` |
| submitReview | `POST /reviews` | `{ userId, courseId, rating, comment }` |

Backend confirmed: `/enrollments`, `/purchases`, `/progress`, `/reviews` all expose full CRUD via `createCrudRouter`; GETs return the full collection (no server-side userId filter). Client filters by `row.userId === currentUser.id`.

## State additions in AppContext

Add per-resource arrays and status/error flags:

```js
const [enrollments, setEnrollments] = useState([]);
const [purchases,   setPurchases]   = useState([]);
const [progress,    setProgress]    = useState([]);
const [reviews,     setReviews]     = useState([]);

const [myDataStatus, setMyDataStatus] = useState("idle"); // idle | loading | success | error
const [myDataError,  setMyDataError]  = useState(null);
```

Keep `currentUser.enrolledCourseIds`, `purchasedCourseIds`, `savedCourseIds`, `completedCourseIds` in sync after each write so existing page filters in Dashboard / CourseDetails / Checkout keep working without page changes (preserves the public context shape per CLAUDE.md).

Derive `lessonProgress` (legacy shape still used by `ModuleDetails.jsx:332`) from the new `progress` array via a `useMemo`, so its consumers don't break.

## New loader

`loadMyData()` — fetches `/enrollments`, `/purchases`, `/progress`, `/reviews` in parallel with `Promise.all`, then filters each list by `userId === currentUser.id` and writes into the four new state arrays. Fires from a `useEffect` when `authStatus` transitions to `AUTHENTICATED`. Clears all four on `logout`.

Reuses the existing cold-start banner timer pattern from `fetchCourses` at `src/context/AppContext.jsx:181-203`.

## Helper rewrites (summary)

Each helper: call the API, on success update both the resource array and the relevant `currentUser.*Ids` mirror; on error, rethrow so the calling page can toast. All helpers become `async`.

- **enrollCourse**: `POST /enrollments` → append row → add courseId to `currentUser.enrolledCourseIds`.
- **unenrollCourse**: lookup enrollment id in state → `DELETE /enrollments/:id` → remove from enrollments → strip courseId from `enrolledCourseIds` and `completedCourseIds` → best-effort `DELETE /progress/:id` if a progress row exists.
- **purchaseCourse**: `POST /purchases` → append → also `POST /enrollments` if not already enrolled → update both id mirrors.
- **saveCourse / unsaveCourse**: `PUT /users/{id}` with `{ savedCourseIds: nextArray }` → replace `currentUser` from response (normalized).
- **markLessonComplete**: find progress row for courseId. If exists, `PUT /progress/:id` with new `completedLessonIds` and recomputed `percentage` (done/total * 100). If not, `POST /progress`. Replace/append row in state.
- **markCourseComplete**: same upsert, with `completed: true, percentage: 100`. Also add to `currentUser.completedCourseIds`.
- **submitReview**: `POST /reviews` → append row. Do not PUT the course's `rating` (server-owned field; PUT would clobber other fields). A separate server-side aggregation is the correct fix — out of scope here.
- **getCourseProgress(courseId)**: read from `progress` state — find row by courseId, return `row.percentage`. Fallback: compute from `completedLessonIds.length / totalLessons` using the course's modules/lessons if present.

## Critical files

- `src/context/AppContext.jsx` — the only file that needs to change. No page-level edits required if the public context shape stays stable.

Reference files (read-only, for shape/patterns):
- `src/utils/api.js` — `apiGet/Post/Put/Delete` already handle token + error envelope.
- `src/utils/authStorage.js:28` — `readToken()`.
- `server/models/Progress.js` — confirms `{ userId, courseId, completedLessonIds[], percentage, completed }`.
- `server/controllers/crudFactory.js` — confirms response envelope `{ success, data }`.
- `server/utils/createCrudRouter.js:7-23` — confirms auth is required on writes only.

## Verification

Run both servers (`npm run dev` + `npm run dev:server`) and walk the flows, watching DevTools Network + Application → Local Storage.

1. **Login** → exactly 4 parallel requests after `/auth/me`: `GET /enrollments`, `/purchases`, `/progress`, `/reviews`.
2. **Enroll** on CourseDetails → `POST /enrollments` 201 → reload → still enrolled.
3. **Unenroll** from Dashboard → `DELETE /enrollments/:id` → reload → gone.
4. **Purchase** through Checkout → `POST /purchases` followed by `POST /enrollments` → reload → still purchased + enrolled.
5. **Save / unsave** on CourseDetails → `PUT /users/:id` with updated `savedCourseIds` → reload → toggle persists.
6. **Mark lesson complete** on ModuleDetails → first click is `POST /progress`, next clicks are `PUT /progress/:id` with the array growing. Progress bar reflects percentage from the server.
7. **Mark course complete** (finish last lesson) → final PUT carries `completed: true, percentage: 100` → Dashboard shows course under "Completed".
8. **Submit review** on CourseDetails → `POST /reviews` 201 → reload → review persists.
9. **Logout → login as a different user** → only the new user's rows appear (client filter works).
10. **Lint** clean: `npm run lint`.
11. **Grep guard** to confirm no helper remains client-only: `grep -n "setCurrentUser(updated)" src/context/AppContext.jsx` should only show genuine in-memory updates (toasts, theme), not enroll/purchase/save/progress/review paths.

## Out of scope (flag as tech debt, do not fix here)

- Server-side `userId` / `courseId` query filters on list GETs (backend work for Member 2).
- Missing auth middleware on `PUT /users/:id` (backend security bug — document and escalate).
- Course `rating` aggregation from `/reviews` (needs backend aggregation endpoint).
- Client-only `expertise`, `website`, `profileImage` fields on `updateProfile` (noted in existing code; backend User schema gap).
