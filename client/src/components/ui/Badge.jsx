const variants = {
  cyan: "bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/20",
  blue: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
  green: "bg-[#238636]/10 text-[#238636] border-[#238636]/20",
  gray: "bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]/20",
  gold: "bg-[#f0a000]/10 text-[#f0a000] border-[#f0a000]/20",
  red: "bg-[#da3633]/10 text-[#da3633] border-[#da3633]/20"
};

const Badge = ({ children, variant = "gray", className = "" }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium rounded-full border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;