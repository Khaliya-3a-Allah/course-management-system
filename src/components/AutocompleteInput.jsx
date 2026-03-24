import { useState, useRef, useCallback } from "react";
import useClickOutside from "../hooks/useClickOutside";
import { INPUT_CLASS, buildInputBorder } from "./FormField";

const MAX_VISIBLE = 8;

/**
 * AutocompleteInput — single-select typeahead input with dropdown.
 * The input always stays visible and displays the selected value as plain text.
 */
export default function AutocompleteInput({
  options,
  value,
  onChange,
  placeholder = "Type to search...",
  label = "Select option",
  error,
  id,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(0);
  }, []);

  useClickOutside(wrapperRef, () => {
    closeDropdown();
    setQuery("");
  });

  const displayValue = query !== "" ? query : value;

  const searchTerm = query !== "" ? query : "";
  const filteredOptions = searchTerm.trim()
    ? options
        .filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, MAX_VISIBLE)
    : [];

  function selectItem(option) {
    onChange(option);
    setQuery("");
    closeDropdown();
    inputRef.current?.blur();
  }

  function handleInputChange(event) {
    setQuery(event.target.value);
    setHighlightedIndex(0);
    if (!isOpen) setIsOpen(true);

    if (event.target.value === "") {
      onChange("");
    }
  }

  function handleFocus() {
    setIsOpen(true);
    if (value && query === "") {
      setQuery(value);
    }
  }

  function handleBlur() {
    if (query !== "" && query !== value) {
      const exactMatch = options.find(
        (opt) => opt.toLowerCase() === query.toLowerCase()
      );
      if (exactMatch) {
        onChange(exactMatch);
      }
      setQuery("");
    }
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
          selectItem(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setQuery("");
        closeDropdown();
        break;
      default:
        break;
    }
  }

  const highlightedId =
    highlightedIndex >= 0 && filteredOptions[highlightedIndex]
      ? `ac-input-option-${highlightedIndex}`
      : undefined;

  return (
    <div ref={wrapperRef} className="relative" aria-label={label}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={INPUT_CLASS}
        style={buildInputBorder(error)}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="ac-input-listbox"
        aria-autocomplete="list"
        aria-activedescendant={highlightedId}
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <ul
          role="listbox"
          id="ac-input-listbox"
          className="absolute top-full left-0 right-0 z-50 rounded-lg mt-1 max-h-[220px] overflow-y-auto list-none p-1"
          style={{ backgroundColor: "#1a1a1f", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              role="option"
              id={`ac-input-option-${index}`}
              aria-selected={index === highlightedIndex}
              className={`flex justify-between items-center px-3 py-2 cursor-pointer text-[0.88rem] font-body rounded transition-colors ${
                index === highlightedIndex ? "text-brand" : "text-text-secondary"
              }`}
              style={index === highlightedIndex ? { backgroundColor: "rgba(217,119,6,0.08)" } : undefined}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectItem(option);
              }}
            >
              <span>{option}</span>
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {isOpen && searchTerm.length > 0 && filteredOptions.length === 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 rounded-lg mt-1 p-1"
          style={{ backgroundColor: "#1a1a1f", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <p className="px-3 py-2 text-text-dim text-[0.85rem] m-0 font-body">
            No matching options found.
          </p>
        </div>
      )}
    </div>
  );
}
