import { useState, useRef, useCallback } from "react";
import useClickOutside from "../hooks/useClickOutside";
import { INPUT_CLASS } from "./FormField";

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
    <div ref={wrapperRef} className="relative" aria-label={label}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2" aria-label="Selected interests">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-brand text-[0.8rem] font-body border border-[rgba(217,119,6,0.35)] bg-[rgba(217,119,6,0.12)]"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="bg-transparent border-none text-brand cursor-pointer text-[0.85rem] p-0 leading-none font-body"
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
        <p className="text-[0.78rem] text-text-dim m-0 py-2">
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
          className={`${INPUT_CLASS} border border-[rgba(255,255,255,0.12)]`}
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
          className="absolute top-full left-0 right-0 z-50 rounded-xl mt-1 max-h-[220px] overflow-y-auto list-none p-1 bg-[#1a1a1f] border border-[rgba(255,255,255,0.12)] shadow-[0_14px_35px_rgba(0,0,0,0.36)]"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              role="option"
              id={`autocomplete-option-${index}`}
              aria-selected={index === highlightedIndex}
              className={`flex justify-between items-center px-3 py-2 cursor-pointer text-[0.88rem] font-body rounded transition-colors ${
                index === highlightedIndex ? "text-brand bg-[rgba(217,119,6,0.12)]" : "text-text-secondary"
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => addItem(option)}
            >
              <span>{option}</span>
              <span className="text-brand font-bold text-lg leading-none">+</span>
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {isOpen && !isAtLimit && query.length > 0 && filteredOptions.length === 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 rounded-xl mt-1 p-1 bg-[#1a1a1f] border border-[rgba(255,255,255,0.12)] shadow-[0_14px_35px_rgba(0,0,0,0.36)]"
        >
          <p className="px-3 py-2 text-text-dim text-[0.85rem] m-0 font-body">
            No matching interests found.
          </p>
        </div>
      )}
    </div>
  );
}
