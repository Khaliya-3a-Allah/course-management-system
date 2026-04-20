function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="m20 20-3.4-3.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true" focusable="false">
      <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function SearchBar({ value, onChange, placeholder = "Search courses..." }) {
  return (
    <div
      className="group relative flex items-center w-full rounded-xl border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_8px_20px_rgba(0,0,0,0.25)] focus-within:border-[rgba(245,158,11,0.45)] focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.14),0_10px_22px_rgba(0,0,0,0.3)] transition-all"
      role="search"
    >
      <label htmlFor="course-search" className="sr-only">
        Search courses
      </label>

      <span
        className="absolute left-3.5 text-text-dim group-focus-within:text-[#f6c56b] transition-colors pointer-events-none"
        aria-hidden="true"
      >
        <SearchIcon />
      </span>

      <input
        id="course-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search courses"
        autoComplete="off"
        className="w-full py-3.5 pl-10 pr-11 rounded-xl text-[0.93rem] bg-transparent text-[#f5f2ec] placeholder:text-[#7d8798] outline-none"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 w-7 h-7 rounded-md border border-transparent hover:border-[rgba(245,158,11,0.35)] hover:bg-[rgba(245,158,11,0.08)] cursor-pointer text-text-dim hover:text-[#f6c56b] transition-all flex items-center justify-center"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}