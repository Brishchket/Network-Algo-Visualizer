const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error = null,
  icon: Icon = null,
  className = ""
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">
            <Icon size={14} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-3 py-2 text-sm
            bg-[#1c2128] border border-[#30363d]
            text-[#e6edf3] placeholder-[#8b949e]
            rounded-md outline-none
            focus:border-[#00bcd4] focus:ring-1 focus:ring-[#00bcd4]
            transition-colors duration-150
            ${Icon ? "pl-9" : ""}
            ${error ? "border-[#da3633] focus:border-[#da3633] focus:ring-[#da3633]" : ""}
            ${className}
          `}
        />
      </div>
      {error && (
        <p className="text-xs text-[#da3633]">{error}</p>
      )}
    </div>
  );
};

export default Input;