export default function SearchBar({ value, onChange, placeholder = "Search courses..." }) {
  return (
    <search className="relative flex items-center w-full" role="search">
      <label htmlFor="course-search" className="sr-only">
        Search courses
      </label>

      <span
        className="absolute left-3.5 text-[0.85rem] pointer-events-none"
        aria-hidden="true"
      >
        🔍
      </span>

      <input
        id="course-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search courses"
        autoComplete="off"
        className="w-full py-3 pl-10 pr-10 rounded-lg text-[0.92rem] outline-none border border-[rgba(255,255,255,0.09)] bg-surface text-[#e8e6e0]"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3.5 border-none cursor-pointer text-[0.85rem] p-1 leading-none text-text-dim hover:text-text-muted transition-colors"
        >
          ✕
        </button>
      )}
    </search>
  );
}