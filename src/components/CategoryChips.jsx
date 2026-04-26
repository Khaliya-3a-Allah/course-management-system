export default function CategoryChips({ options, selected, onChange }) {
  function toggle(value) {
    const updated = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(updated);
  }

  return (
    <div className="flex flex-wrap gap-[0.45rem]" role="group" aria-label="Select interests">
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`px-[0.85rem] py-[0.45rem] rounded-[6px] text-[0.83rem] font-body cursor-pointer transition-all duration-150 border ${
              isActive
                ? "bg-[rgba(217,119,6,0.1)] border-[rgba(217,119,6,0.4)] text-[#d97706]"
                : "bg-[#111114] border-[rgba(255,255,255,0.08)] text-[#9ca3af]"
            }`}
            aria-pressed={isActive}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
