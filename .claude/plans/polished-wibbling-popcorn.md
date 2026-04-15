# Plan: Replace Interests Chips with Autocomplete Multi-Select

## Context

The current interests field on the Register page uses a `CategoryChips` component with only 6 static options (Development, Design, Backend, etc.). The user wants a much broader set of interests spanning many fields (math, physics, business, programming, etc.) with a free-text search input, dropdown suggestions with "+" buttons, and removable chips for selected items.

## Files to Modify/Create

| File | Action | Lines |
|------|--------|-------|
| `src/hooks/useClickOutside.js` | **CREATE** | ~20 |
| `src/data/constants.js` | **MODIFY** | ~100 |
| `src/components/AutocompleteSelect.jsx` | **CREATE** | ~250 |
| `src/pages/Register.jsx` | **MODIFY** (small) | ~3 lines changed |
| `src/data/mockUsers.js` | **MODIFY** (1 line) | unchanged |

## Steps

### 1. Create `src/hooks/useClickOutside.js`
Custom hook: `useClickOutside(ref, handler)`. Adds a `mousedown` listener on `document`, calls `handler` when click is outside `ref.current`. Cleans up on unmount.

### 2. Expand `src/data/constants.js` with INTERESTS array
Add ~80 interests organized across domains. Keep existing `CATEGORIES` and `LEVELS` unchanged.

Domains covered:
- **Programming**: JavaScript, Python, Java, C++, Go, Rust, TypeScript, etc.
- **Web & Mobile**: React, Angular, Node.js, Next.js, Flutter, REST APIs, GraphQL, etc.
- **Data & AI**: Machine Learning, Data Science, Deep Learning, NLP, Computer Vision, etc.
- **Cloud & DevOps**: AWS, Docker, Kubernetes, CI/CD, Linux, Terraform, etc.
- **CS Fundamentals**: Algorithms, Data Structures, Databases, Distributed Systems, etc.
- **Math & Science**: Linear Algebra, Calculus, Probability, Physics, Statistics, etc.
- **Design**: UI Design, UX Design, Figma, Motion Graphics, etc.
- **Business**: Digital Marketing, Product Management, Entrepreneurship, Agile/Scrum, etc.
- **Security**: Cybersecurity, Ethical Hacking, Cryptography, etc.
- **Other**: Blockchain, Game Development, IoT, Robotics, AR/VR, etc.

### 3. Create `src/components/AutocompleteSelect.jsx`
Reusable autocomplete multi-select component.

**Props:** `options`, `selected`, `onChange`, `placeholder`, `maxSelections` (default 10), `label`

**UI structure:**
- Selected items shown as amber chips with "x" remove button
- Text input that filters suggestions (case-insensitive substring match)
- Dropdown list below input showing filtered options (max 8 visible), each with a "+" button
- Already-selected items excluded from dropdown
- "No matches found" message when query has no results
- "Maximum of N interests selected" when limit reached (input hidden)

**Keyboard support:** ArrowUp/Down to navigate, Enter to select, Escape to close, Backspace on empty input removes last chip.

**Accessibility:** `role="combobox"`, `aria-expanded`, `role="listbox"` / `role="option"`, `aria-selected`, `aria-activedescendant`.

**Click outside:** Uses `useClickOutside` hook to close dropdown.

### 4. Update `src/pages/Register.jsx`
- Import `AutocompleteSelect` instead of `CategoryChips`
- Import `INTERESTS` from constants
- Replace the `CategoryChips` JSX with `AutocompleteSelect` passing `INTERESTS` as options
- Update interest validation filter from `CATEGORIES.includes` to `INTERESTS.includes`

### 5. Update `src/data/mockUsers.js`
Update Alex's interests from old category values to new INTERESTS values:
```js
interests: ["React", "Node.js", "Data Structures"]
```

## Key Design Decisions

- **No custom/free-text interests** — only predefined suggestions selectable (prevents duplicates like "ML" vs "Machine Learning")
- **Max 10 interests** — prevents UI overflow
- **CategoryChips.jsx kept** — still potentially used elsewhere (FilterPanel pattern)
- **`useClickOutside` as separate hook** — reusable for future dropdowns
- **8 suggestions max shown** — keeps dropdown compact

## Verification

1. Run `npm run dev`, navigate to `/#/register`
2. Select "Student" role — interests field appears with search input
3. Type "rea" — dropdown shows "React", "React Native" with "+" buttons
4. Click "+" on "React" — chip appears, "React" removed from dropdown
5. Type "py" — shows "Python", "PyTorch"
6. Press ArrowDown + Enter — adds highlighted item
7. Click "x" on a chip — removes it
8. Add 10 interests — input hides, limit message shown
9. Remove one — input reappears
10. Click outside dropdown — dropdown closes
11. Switch role to instructor — interests clear
12. Register with interests — user object contains valid interests array
