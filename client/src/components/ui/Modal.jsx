import { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = ""
}) => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* modal */}
      <div
        className={`
          relative w-full ${sizes[size]}
          bg-[#161b22] border border-[#30363d]
          rounded-xl shadow-2xl
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <h2 className="text-base font-semibold text-[#e6edf3]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#1c2128] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;