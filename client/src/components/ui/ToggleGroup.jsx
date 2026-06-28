const ToggleGroup = ({ options = [], value, onChange }) => {
  return (
    <div className="flex rounded-md border border-[#30363d] overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wide
            transition-all duration-150
            ${value === opt.value
              ? "bg-[#1c2128] text-[#e6edf3]"
              : "bg-transparent text-[#8b949e] hover:text-[#e6edf3]"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ToggleGroup;