import { forwardRef } from "react";
const variants = {
  primary: "bg-[#3b82f6] hover:bg-[#2563eb] text-white border-transparent",
  cyan: "bg-[#00bcd4] hover:bg-[#0097a7] text-[#0d1117] border-transparent",
  outline: "bg-transparent hover:bg-[#1c2128] text-[#e6edf3] border-[#30363d]",
  ghost: "bg-transparent hover:bg-[#1c2128] text-[#8b949e] hover:text-[#e6edf3] border-transparent",
  danger: "bg-transparent hover:bg-[#da3633] text-[#da3633] hover:text-white border-[#da3633]",
  success: "bg-[#238636] hover:bg-[#2ea043] text-white border-transparent"
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base"
};

const Button = forwardRef(({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  icon: Icon = null
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-md border
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;