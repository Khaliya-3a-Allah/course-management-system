# Align 2FA with Member 3 API-Integration Conventions

## Context

Verification of Member 3's "Frontend Integration Lead" scope passed (mock
data removed, `src/utils/api.js` is the sole HTTP boundary, explicit
loading/error states via `ResourceState`, cold-start banner wired, request
shapes match the backend contract).

Three small convention gaps remain in the 2FA feature that predates
Member 3's work. This plan fixes all three with minimal, focused edits.
The goal is consistency — not new behavior.

## The three mismatches to fix

### A. Error-string mapping is inlined in 2FA components

- Member 3 uses dedicated `describe*Error(error)` helpers in `src/pages/Login.jsx:121-142` and `src/components/ResourceState.jsx:69-84` that map `error.status` (0, 401, 404, 5xx) to user-facing text.
- 2FA (`src/components/TwoFactorEnroll.jsx:40-43, 65-70, 97-102`) inlines the same pattern ad hoc per call site.

### B. 2FA uses a local `isLoading` boolean instead of the status enum

- Member 3 uses the `RESOURCE_STATUS` / `AUTH_STATUS` enums in `src/context/AppContext.jsx:16-29`; pages read those (e.g. `coursesStatus` in `src/pages/Courses.jsx`).
- `TwoFactorEnroll.jsx:25` uses a single `isLoading` boolean shared across three operations (setup / enable / disable), which also lets two in-flight ops clobber each other's spinner label.

### C. `.trim()` not applied at the API-call boundary in 2FA

- Member 3 normalizes at the boundary: `src/context/AppContext.jsx:333` does `email.trim().toLowerCase()` before posting. `src/components/TwoFactorForm.jsx:35` already does `inputCode.trim()`.
- `TwoFactorEnroll.jsx:61, 92` pass raw state into `enableTwoFactor({ code })` / `disableTwoFactor({ password, code })`.
- Note: passwords are **intentionally not** run through `sanitizeInput` (it strips HTML, trims, collapses whitespace — would corrupt legitimate passwords). Register does the same — `src/context/AppContext.jsx:334` passes `password: form.password` unmodified. So the fix here is only `.trim()` on `code` and `password` — never `sanitizeInput`.

## Files to change

| File | Type | Purpose |
|---|---|---|
| `src/utils/status.js` | **new** | Export `RESOURCE_STATUS` enum (single source of truth). |
| `src/utils/authErrors.js` | **new** | Export `describeLoginError`, `describeTwoFactorError`, `describeTwoFactorEnableError`, `describeTwoFactorDisableError`. |
| `src/context/AppContext.jsx` | edit | Import `RESOURCE_STATUS` from `src/utils/status.js` (remove the inline const at lines 24-29). `AUTH_STATUS` stays local — only auth uses it. |
| `src/pages/Login.jsx` | edit | Replace the local `describeLoginError` / `describeTwoFactorError` (lines 121-142) with imports from `src/utils/authErrors.js`. |
| `src/components/TwoFactorEnroll.jsx` | edit | (a) Replace `isLoading` boolean with a `status` string using `RESOURCE_STATUS`; (b) use `describeTwoFactorEnableError` / `describeTwoFactorDisableError` for error text; (c) `.trim()` the code/password before calling context methods. |

## Change details

### 1) New `src/utils/status.js`

```js
export const RESOURCE_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};
```

`ResourceState.jsx` already reads the raw string values ("loading", "error", etc.) so no change needed there. `AppContext.jsx` imports from this new module and deletes its local copy.

### 2) New `src/utils/authErrors.js`

Four helpers, all with the same `(error) => string` signature. The first two move verbatim from `Login.jsx`; the last two replace the inline ad-hoc strings in `TwoFactorEnroll.jsx`.

```js
export function describeLoginError(error) {
  if (error?.status === 0) return "We couldn't reach the server…";
  if (error?.status === 401) return "Incorrect email or password.";
  if (error?.status >= 500) return "The server is having trouble right now…";
  return error?.message || "Sign-in failed. Please try again.";
}

export function describeTwoFactorError(error) { /* 401 → "Incorrect or expired verification code." */ }

export function describeTwoFactorEnableError(error) {
  if (error?.status === 0) return "We couldn't reach the server…";
  if (error?.status === 400) return "Incorrect code. Make sure your device clock is accurate.";
  return error?.message || "Could not enable 2FA. Please try again.";
}

export function describeTwoFactorDisableError(error) {
  if (error?.status === 0) return "We couldn't reach the server…";
  if (error?.status === 401) return "Incorrect password or verification code.";
  return error?.message || "Could not disable 2FA. Please try again.";
}
```

### 3) `src/components/TwoFactorEnroll.jsx` refactor

- `import { RESOURCE_STATUS } from "../utils/status";`
- `import { describeTwoFactorEnableError, describeTwoFactorDisableError } from "../utils/authErrors";`
- Replace `const [isLoading, setIsLoading] = useState(false);` with `const [status, setStatus] = useState(RESOURCE_STATUS.IDLE);`
- In each handler: set `LOADING` on entry, `SUCCESS`/`IDLE` on success, `ERROR` on failure. The existing `codeError` / `disableError` string state stays — it renders the error text; `status` drives the button's disabled/spinner label.
- The three disable-button / verify-button / enable-button conditionals that read `isLoading` become `status === RESOURCE_STATUS.LOADING`.
- Replace inline error strings at lines 66-70 and 98-102 with the helper calls.
- In `handleVerifyEnrollment`: `await enableTwoFactor({ code: code.trim() });`
- In `handleDisable`: `await disableTwoFactor({ password: disablePassword, code: disableCode.trim() });`

### 4) `src/pages/Login.jsx`

- Remove the local `describeLoginError` / `describeTwoFactorError` (lines 121-142).
- `import { describeLoginError, describeTwoFactorError } from "../utils/authErrors";`

### 5) `src/context/AppContext.jsx`

- `import { RESOURCE_STATUS } from "../utils/status";`
- Delete the inline `const RESOURCE_STATUS = { … };` at lines 24-29.
- Leave `AUTH_STATUS` in place — it's auth-flow-specific and only used in this file.

## Out of scope

- Splitting `AppContext.jsx` (914 lines) into smaller files — documented convention violation but outside this task.
- Introducing a per-feature status object in context for 2FA (would be invasive; component-local status is sufficient given the flow is always user-initiated from within `TwoFactorEnroll`).
- Any password-level sanitization — sanitizing passwords is a bug, not a convention (see Context section C).

## Verification

After the edits:

1. `npm run lint` → no new warnings or errors.
2. `npm run dev` + `npm run dev:server` with a populated `.env`.
3. **Enrollment happy path:** Dashboard → Enable 2FA → scan QR → enter code → see "Two-factor authentication enabled." toast, 2FA badge flips to Enabled.
4. **Enrollment error path:** Enter a wrong code → inline error reads exactly "Incorrect code. Make sure your device clock is accurate." (proves helper wired).
5. **Disable happy path:** Click Disable 2FA → enter password + current code → see toast, badge flips to Disabled.
6. **Disable error path:** Enter a bad password → inline error reads "Incorrect password or verification code." (proves helper wired).
7. **Loading state:** During each submit, the submit button's label flips to "Verifying…" / "Disabling…" / "Preparing…" and is disabled — confirms `status === LOADING` is read correctly.
8. **Login still works:** Sign out, sign back in (with 2FA on) → challenge screen → enter code → lands on Dashboard. `describeTwoFactorError` / `describeLoginError` imports exercised.
9. **Trim behavior:** In the disable form, paste "  123456  " into the code field — it's still accepted (proof the `.trim()` at the boundary works; the input onChange already strips non-digits, but trimming the final string is belt-and-braces).

No backend changes, no new dependencies, no user-visible UX regressions expected — only code-organisation changes.
