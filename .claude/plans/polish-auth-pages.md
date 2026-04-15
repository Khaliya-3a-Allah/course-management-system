# Login & Register Pages — Fix Plan

## Context

Login and register pages need UI polish, session persistence, route guards, password toggle fix, and better feedback. Phase 1: frontend only, no backend/DB.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Login.jsx` | UI polish, password toggle, loading state, success feedback |
| `src/pages/Register.jsx` | UI polish, password toggle, loading state, success feedback |
| `src/context/AppContext.jsx` | Add localStorage persistence for `currentUser`, expose `logout()` |
| `src/routes/AppRouter.jsx` | Add `ProtectedRoute` wrapper for guarded routes |
| `src/utils/validators.js` | No changes needed (already solid) |

## New Files

| File | Purpose |
|------|---------|
| `src/components/ProtectedRoute.jsx` | Route guard — redirects unauthenticated users to `/login` |
| `src/components/Toast.jsx` | Lightweight toast notification component for success/error feedback |

---

## Step-by-Step Implementation

### 1. Session Persistence (`AppContext.jsx`)

**Problem:** User state is lost on page refresh — `currentUser` starts as `null` every time.

**Fix:**
- Initialize `currentUser` from `localStorage.getItem("currentUser")` (JSON.parse, with try/catch)
- Add a `useEffect` that writes `currentUser` to `localStorage` whenever it changes (or removes on logout)
- Add a `logout()` function that sets `currentUser` to `null` and clears localStorage
- Expose `logout` in the context value

### 2. Route Guards (`ProtectedRoute.jsx` + `AppRouter.jsx`)

**Problem:** Anyone can navigate to `/dashboard`, `/course-form`, etc. without logging in.

**Fix:**
- Create `src/components/ProtectedRoute.jsx`:
  - Reads `currentUser` from `useAppContext()`
  - If no user → redirect to `/login`
  - If user → render `<Outlet />` (or children)
- Update `AppRouter.jsx`:
  - Wrap `/dashboard`, `/course-form`, `/course-form/:courseId` in `<ProtectedRoute>`
  - Login/Register already redirect away if `currentUser` exists (keep that)

### 3. Password Visibility Toggle Fix (`Login.jsx` + `Register.jsx`)

**Problem:** Uses emoji (`👁`/`🙈`) which renders inconsistently across platforms and looks unprofessional.

**Fix:**
- Replace emojis with simple SVG eye/eye-off icons (inline, no library needed)
- Improve button styling — larger hit target, subtle hover state
- On Register page: add independent toggle for confirm password field (currently both fields share `showPw`)

### 4. Toast Notification Component (`Toast.jsx`)

**Problem:** No feedback after successful login/register. Errors use inline alerts but success just silently redirects.

**Fix:**
- Create `src/components/Toast.jsx`:
  - Supports `success`, `error`, `info` variants
  - Auto-dismisses after ~3 seconds
  - Positioned fixed top-right
  - Smooth slide-in/out animation
- Add toast state to `AppContext` (or a simple standalone context)
- Show toast on:
  - Successful login: "Welcome back, {name}!"
  - Successful register: "Account created successfully!"
  - Auth errors can optionally use toast too, but inline errors stay for field-level validation

### 5. UI Polish (`Login.jsx` + `Register.jsx`)

**Problem:** Pages look somewhat rough — needs general tightening.

**Improvements:**
- **Focus states**: Add visible focus ring on inputs (currently `outline: none` with nothing replacing it — accessibility issue)
- **Hover states**: Submit button needs hover/active feedback (currently static)
- **Submit button**: Add disabled state while "submitting" (brief loading simulation for UX feel)
- **Input focus glow**: Subtle amber border glow when focused
- **Consistent spacing**: Tighten gaps between field label and input
- **Form element**: Wrap fields in `<form>` tag with `onSubmit` instead of button `onClick` (enables native Enter-to-submit on all fields, not just the last one)
- **Loading state**: Brief simulated delay on submit with spinner/disabled button, so the transition feels intentional rather than jarring

---

## Verification

1. `npm run dev` — start dev server
2. **Session persistence**: Login → refresh page → should still be logged in. Logout → refresh → should stay logged out
3. **Route guards**: Visit `/#/dashboard` while logged out → should redirect to `/login`
4. **Password toggle**: Click eye icon → password visible. Click again → hidden. Verify both fields on register page toggle independently
5. **Toast**: Login → see "Welcome back" toast. Register → see "Account created" toast. Both auto-dismiss
6. **UI polish**: Tab through form fields → visible focus rings. Hover submit button → visual feedback. Submit → button shows loading briefly
7. **Existing functionality**: All validation errors still work (empty fields, bad email, short password, mismatched passwords, duplicate email)
