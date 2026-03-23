import { useState, useRef, useCallback } from "react";
import useClickOutside from "../hooks/useClickOutside";

const MAX_VISIBLE = 8;

/**
 * AutocompleteSelect — multi-select with typeahead search and dropdown.
 * Selected items appear as removable chips. Dropdown shows "+" buttons.
 */
export default function AutocompleteSelect({
  options,
  selected,
  onChange,
  placeholder = "Type to search...",
  maxSelections = 10,
  label = "Select options",
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setHighlightedIndex(0);
  }, []);

  useClickOutside(wrapperRef, closeDropdown);

  const isAtLimit = selected.length >= maxSelections;

  const filteredOptions = query.trim()
    ? options
        .filter((opt) => !selected.includes(opt))
        .filter((opt) => opt.toLowerCase().includes(query.toLowerCase()))
        .slice(0, MAX_VISIBLE)
    : [];

  function addItem(option) {
    onChange([...selected, option]);
    setQuery("");
    setHighlightedIndex(0);
    inputRef.current?.focus();
  }

  function removeItem(option) {
    onChange(selected.filter((item) => item !== option));
    inputRef.current?.focus();
  }

  function handleInputChange(event) {
    setQuery(event.target.value);
    setHighlightedIndex(0);
    if (!isOpen) setIsOpen(true);
  }

  function handleFocus() {
    if (!isAtLimit) setIsOpen(true);
  }

  function handleKeyDown(event) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setIsOpen(true);
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          addItem(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        closeDropdown();
        break;
      case "Backspace":
        if (query === "" && selected.length > 0) {
          removeItem(selected[selected.length - 1]);
        }
        break;
      default:
        break;
    }
  }

  const highlightedId =
    highlightedIndex >= 0 && filteredOptions[highlightedIndex]
      ? `autocomplete-option-${highlightedIndex}`
      : undefined;

  return (
    <div ref={wrapperRef} style={styles.wrapper} aria-label={label}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={styles.chipsContainer} aria-label="Selected interests">
          {selected.map((item) => (
            <span key={item} style={styles.chip}>
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                style={styles.chipRemove}
                aria-label={`Remove ${item}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input or limit message */}
      {isAtLimit ? (
        <p style={styles.limitMessage}>
          Maximum of {maxSelections} interests selected.
        </p>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={styles.input}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="autocomplete-listbox"
          aria-autocomplete="list"
          aria-activedescendant={highlightedId}
          autoComplete="off"
        />
      )}

      {/* Dropdown */}
      {isOpen && !isAtLimit && filteredOptions.length > 0 && (
        <ul
          role="listbox"
          id="autocomplete-listbox"
          style={styles.dropdown}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              role="option"
              id={`autocomplete-option-${index}`}
              aria-selected={index === highlightedIndex}
              style={
                index === highlightedIndex
                  ? { ...styles.dropdownItem, ...styles.dropdownItemHighlighted }
                  : styles.dropdownItem
              }
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => addItem(option)}
            >
              <span>{option}</span>
              <span style={styles.addButton}>+</span>
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {isOpen && !isAtLimit && query.length > 0 && filteredOptions.length === 0 && (
        <div style={styles.dropdown}>
          <p style={styles.noResults}>No matching interests found.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
  },
  chipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginBottom: "0.5rem",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    backgroundColor: "rgba(217,119,6,0.1)",
    border: "1px solid rgba(217,119,6,0.3)",
    borderRadius: "6px",
    padding: "0.3rem 0.6rem",
    color: "#d97706",
    fontSize: "0.8rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  chipRemove: {
    background: "none",
    border: "none",
    color: "#d97706",
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: "0 0.15rem",
    lineHeight: 1,
    fontFamily: "'DM Sans', sans-serif",
  },
  input: {
    width: "100%",
    padding: "0.8rem 1rem",
    backgroundColor: "#0c0c0e",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "8px",
    color: "#e8e6e0",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.93rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  limitMessage: {
    fontSize: "0.78rem",
    color: "#6b7280",
    margin: 0,
    padding: "0.5rem 0",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "#1a1a1f",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "8px",
    marginTop: "4px",
    maxHeight: "220px",
    overflowY: "auto",
    listStyle: "none",
    padding: "0.25rem 0",
  },
  dropdownItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.55rem 0.85rem",
    cursor: "pointer",
    color: "#d1cfc8",
    fontSize: "0.88rem",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background-color 0.1s",
  },
  dropdownItemHighlighted: {
    backgroundColor: "rgba(217,119,6,0.08)",
    color: "#d97706",
  },
  addButton: {
    color: "#d97706",
    fontWeight: 700,
    fontSize: "1.1rem",
    lineHeight: 1,
  },
  noResults: {
    padding: "0.55rem 0.85rem",
    color: "#6b7280",
    fontSize: "0.85rem",
    margin: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
};
