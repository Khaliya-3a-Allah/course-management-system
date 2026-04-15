# Plan: Fix Category Field — Single-Select Autocomplete Input

## Context

Using `AutocompleteSelect` with `maxSelections={1}` for the category field results in bad UX: after selection it shows a chip + "Maximum of 1 interests selected" message, making it look like a broken multi-select. The user wants a standard autocomplete input — type to search, dropdown appears, select one, input shows the value as plain text.

**Goal:** Create a new `AutocompleteInput` component for single-select typeahead, and use it for the category field in CourseForm.

---

## File to Create

### `src/components/AutocompleteInput.jsx` (~100 lines)
Single-select autocomplete input. Reuses patterns from `AutocompleteSelect`:
- `useClickOutside` hook for closing dropdown
- `INPUT_CLASS` / `buildInputBorder` from FormField
- Same dropdown styling, keyboard nav (ArrowUp/Down, Enter, Escape)

**Props:** `options`, `value` (string), `onChange` (string callback), `placeholder`, `label`, `error`

**Behavior:**
- Input always visible, displays `value` as text
- On focus/type: filters `options` by query, shows dropdown
- On select: calls `onChange(option)`, sets input text to selected value, closes dropdown
- User can clear/retype to change selection
- When input text doesn't match any option and user blurs, keep last valid value

## File to Modify

### `src/pages/CourseForm.jsx`
- Replace `import AutocompleteSelect` with `import AutocompleteInput`
- Replace the `<AutocompleteSelect>` usage with:
  ```jsx
  <AutocompleteInput
    options={INTERESTS}
    value={form.category}
    onChange={(val) => set("category", val)}
    placeholder="Type to search categories..."
    label="Select category"
    error={errors.category}
  />
  ```

## Verification

1. Type in category field — dropdown filters INTERESTS
2. Select one — input shows the value as plain text (no chip, no limit message)
3. Clear input and retype to change selection
4. Edit mode prefills the input with existing category text
5. Validation still works (required field)
6. `npm run build` passes
