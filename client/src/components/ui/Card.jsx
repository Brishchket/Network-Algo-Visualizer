const variants = {
  default: "bg-[#161b22] border-[#30363d]",
  surface2: "bg-[#1c2128] border-[#30363d]",
  cyan: "bg-[#161b22] border-[#00bcd4]",
  blue: "bg-[#161b22] border-[#3b82f6]"
};

const Card = ({
  children,
  variant = "default",
  className = "",
  onClick = null,
  accentTop = false,
  accentColor = "#00bcd4"
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative border rounded-lg overflow-hidden
        transition-all duration-150
        ${variants[variant]}
        ${onClick ? "cursor-pointer hover:border-[#00bcd4]" : ""}
        ${className}
      `}
    >
      {accentTop && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: accentColor }}
        />
      )}
      {children}
    </div>
  );
};

export default Card;