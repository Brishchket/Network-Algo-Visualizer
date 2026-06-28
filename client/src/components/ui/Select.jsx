import { ChevronDown } from "lucide-react";

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  error = null,
  className = "",
  accentColor = null
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`
            w-full px-3 py-2 text-sm appearance-none
            bg-[#1c2128] text-[#e6edf3]
            rounded-md outline-none cursor-pointer
            transition-colors duration-150
            focus:ring-1
            ${accentColor
              ? `border-2 border-[${accentColor}] focus:border-[${accentColor}] focus:ring-[${accentColor}]`
              : "border border-[#30363d] focus:border-[#00bcd4] focus:ring-[#00bcd4]"
            }
            ${error ? "border-[#da3633]" : ""}
            ${className}
          `}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b949e]">
          <ChevronDown size={14} />
        </div>
      </div>
      {error && (
        <p className="text-xs text-[#da3633]">{error}</p>
      )}
    </div>
  );
};

export default Select;