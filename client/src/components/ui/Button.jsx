import "./Button.css";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  type = "button"
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? "btn-full" : ""}`}
    >
      {children}
    </button>
  );
}