# Plan: Set Up Playwright E2E Testing & Find Bugs

## Context
All the new features (login with 2FA, registration overhaul, protected routes, toasts, session persistence) are untested. We need to set up Playwright, write E2E tests covering every feature, run them, and report any bugs found.

## Phase 1: Setup
1. `npm install --save-dev @playwright/test`
2. `npx playwright install --with-deps chromium` (chromium-only — sufficient for this project)
3. Create `playwright.config.js` at project root:
   - `baseURL: "http://localhost:5173/course-management-system/"` (matches Vite `base`)
   - `webServer` config to auto-start `npm run dev`
   - `testDir: "./e2e"`
   - HashRouter URLs: all navigation uses `/#/route` pattern
4. Add `"test:e2e"` script to `package.json`
5. Create `e2e/helpers.js` with shared utilities:
   - `loginAs(page, email, password)` — full login + 2FA code extraction from toast
   - `injectAuthUser(page, user)` — skip login by injecting into localStorage
   - User constants (STUDENT_USER, INSTRUCTOR_USER — without passwords, matching what the app stores)

## Phase 2: Write Tests (organized by feature)

### `e2e/login.spec.js` (~14 tests)
- Empty field validation, invalid email, wrong credentials
- 2FA flow: extract code from toast (`[aria-live="polite"] [role="status"]`), enter in `#two-factor-code`, verify
- Wrong 2FA code error, lockout after 5 attempts
- Code expiry (use `page.clock` to advance 61s)
- Resend code (new toast with new code), resend cooldown
- Back to login button
- Password visibility toggle
- Authenticated user redirect away from /login

### `e2e/registration.spec.js` (~18 tests)
- Required field validation (name, email, password, confirmPassword, terms)
- Name constraints (min 2 chars, max 50, letters only)
- Phone validation (optional, 7-15 digits)
- Bio length (max 300)
- Role switching: student shows interests autocomplete, instructor shows expertise + website
- Autocomplete: type-ahead, chip selection, keyboard nav, max 10 limit
- Terms modal opens/closes
- Successful student + instructor registration → redirect to dashboard
- Duplicate email prevention
- Link to login page

### `e2e/protected-routes.spec.js` (~6 tests)
- Unauthenticated → redirect to /login for /dashboard, /course-form, /course-form/:id
- Authenticated → access granted for all protected routes
- Public routes accessible without auth

### `e2e/session-persistence.spec.js` (~5 tests)
- Session survives page reload
- Stored user excludes password
- Logout clears localStorage + redirects
- Logout modal cancel keeps session
- Corrupted localStorage handled gracefully

### `e2e/navigation.spec.js` (~6 tests)
- Navbar links differ for authenticated vs unauthenticated
- Logo, Courses, Dashboard navigation
- Home page hero, featured courses, category links

### `e2e/toast-notifications.spec.js` (~4 tests)
- Toast appears with correct content
- Auto-dismiss after ~3s
- Manual dismiss via close button
- Multiple toasts stack

## Phase 3: Run & Report Bugs
- Run `npx playwright test`
- Fix any test infrastructure issues
- Report all application bugs found

## Key Technical Decisions
- **2FA code extraction**: Wait for `[role="status"]` toast containing "verification code", parse 6-digit code with regex
- **localStorage cleanup**: Every test clears localStorage in `beforeEach`
- **HashRouter URLs**: Use `page.goto("/#/login")`, assert with `toHaveURL(/.*#\/dashboard/)`
- **Clock mocking**: Use `page.clock.install()` + `page.clock.fastForward()` for timer-dependent tests (2FA expiry, resend cooldown)

## Bug Hunting Focus Areas (from code review)
1. Session persistence of enrollments — after reload, `users` array resets to mockUsers but `currentUser` persists from localStorage, potential inconsistency
2. Registered users can't log in after page reload (users state resets, only mockUsers persist)
3. CourseForm uses `onClick` not `<form onSubmit>` — Enter key may not submit
4. Rating calculation uses simple average of 2 values, not a proper multi-rating average
5. 2FA code comparison — verify string comparison handles edge cases

## Files to Create
- `playwright.config.js`
- `e2e/helpers.js`
- `e2e/login.spec.js`
- `e2e/registration.spec.js`
- `e2e/protected-routes.spec.js`
- `e2e/session-persistence.spec.js`
- `e2e/navigation.spec.js`
- `e2e/toast-notifications.spec.js`

## Files to Modify
- `package.json` — add `test:e2e` script, `@playwright/test` devDep
- `.gitignore` — add Playwright artifacts: `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`
