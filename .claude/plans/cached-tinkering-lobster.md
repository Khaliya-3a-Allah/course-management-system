# Plan: Convert Extracted Components to Tailwind + Fix Merge Errors

## Context

During the merge of `login-courseform` into `main`, I kept the inline-style versions of Login.jsx and Register.jsx instead of the remote's Tailwind versions. The user wants **both**: the Tailwind styling from remote AND the new features from the local branch (2FA, extra form fields, extracted components, terms modal, etc.).

The fix: convert all extracted components from inline style objects to Tailwind utility classes, matching the patterns already established by the remote's code and the project's Tailwind config.

## Available Tailwind Custom Classes (from `tailwind.config.js`)
- Colors: `bg-base`, `bg-surface`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-text-dim`, `text-text-faint`, `text-brand`, `bg-brand`, `bg-sidebar`
- Fonts: `font-heading`, `font-body`

## Files to Modify (in order)

### 1. `src/index.css` — Add global focus styles
Add a reusable focus rule so components don't need per-component `<style>` tags:
```css
input:focus, textarea:focus, select:focus {
  border-color: rgba(217, 119, 6, 0.5) !important;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
}
```

### 2. `src/components/FormField.jsx` — Tailwind rewrite
- Convert inline styles to Tailwind classes
- Export `INPUT_CLASS` constant (the shared Tailwind className string for inputs)
- Export `buildInputBorder(hasError)` (returns `{ border: ... }` style object for dynamic error borders)
- Remove all inline style objects

### 3. `src/components/LoginForm.jsx` — Tailwind rewrite
- Match remote's card/form pattern: `article.bg-surface.rounded-2xl`, amber accent bar, etc.
- Use Tailwind classes for all layout/typography
- Use `INPUT_CLASS` + `buildInputBorder` from FormField
- Use `text-brand`/`bg-brand` for accent elements
- Remove `styles` object and `focusStyles` string
- Keep the `EyeIcon`/`EyeOffIcon` SVG components (better than emoji)

### 4. `src/components/TwoFactorForm.jsx` — Tailwind rewrite
- Same card pattern as LoginForm
- Convert all styles to Tailwind classes
- Keep all logic (countdown timer, attempt tracking, resend cooldown)
- Remove `styles` object and `focusStyles` string

### 5. `src/components/AutocompleteSelect.jsx` — Tailwind rewrite
- Convert dropdown, chips, input, and highlight styles to Tailwind
- Keep all keyboard navigation logic unchanged
- Remove `styles` object

### 6. `src/components/TermsContent.jsx` — Tailwind rewrite
- Convert section headings, paragraphs, footer to Tailwind classes
- Remove `styles` object

### 7. `src/pages/Login.jsx` — Bug fix
- Fix `</div>` → `</main>` on line 117 (mismatched JSX tag from merge)
- Remove orphaned `styles` object at bottom (dead code)
- Logic and imports stay as-is (2FA flow is correct)

### 8. `src/pages/Register.jsx` — Full Tailwind rewrite
- Take the remote's Tailwind JSX patterns (card structure, field layout, classes)
- Add all local branch features: phone, bio, interests, expertise, website, terms, isSubmitting, handleRoleChange
- Use `FormField` + `INPUT_CLASS` + `buildInputBorder` for field rendering
- Use `AutocompleteSelect` for interests
- Use `Modal` + `TermsContent` for terms
- Fix `</div>` → `</main>` wrapper
- Remove `styles` object and `focusStyles` string

## Files That Need NO Changes
- `src/components/Icons.jsx` — Already pure SVG, no styles
- `src/components/Modal.jsx` — Already uses Tailwind
- `src/components/Toast.jsx` — Not related
- `src/hooks/useClickOutside.js` — Pure logic hook
- `src/utils/codeGenerator.js` — Pure utility
- `src/utils/validators.js` — Pure validation
- `src/data/constants.js` — Pure data

## Verification
1. `npm run dev` — app starts without errors
2. Navigate to `/login` — Tailwind-styled login form renders
3. Submit valid credentials → 2FA form appears (Tailwind-styled)
4. Navigate to `/register` — all fields render (phone, bio, interests/expertise based on role, terms checkbox)
5. Click "Terms & Conditions" → modal opens
6. No inline style objects remain in modified files (except dynamic border colors)
7. No `<style>` tags needed in components (global focus rule handles it)
