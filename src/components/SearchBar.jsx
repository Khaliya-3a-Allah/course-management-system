export default function SearchBar({ value, onChange, placeholder = "Search courses..." }) {
  return (
    <div className="relative flex w-full items-center">
      <span className="pointer-events-none absolute left-3 text-xs text-zinc-500" aria-hidden="true">Search</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-3 pl-16 text-sm text-stone-200 outline-none transition placeholder:text-zinc-500 focus:border-amber-500/60"
        aria-label="Search courses"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 text-sm text-zinc-500 transition hover:text-zinc-300"
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  );
}
