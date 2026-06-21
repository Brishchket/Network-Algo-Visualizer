import "./Input.css";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error = null
}) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input-field ${error ? "input-error" : ""}`}
      />
      {error && <p className="input-error-msg">{error}</p>}
    </div>
  );
}