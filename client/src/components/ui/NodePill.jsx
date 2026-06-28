const NodePill = ({ label, selected = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 rounded-full border-2 text-sm font-semibold
        transition-all duration-150 flex items-center justify-center
        ${selected
          ? "border-[#f0a000] text-[#f0a000] bg-[#f0a000]/10"
          : "border-[#30363d] text-[#8b949e] bg-transparent hover:border-[#8b949e] hover:text-[#e6edf3]"
        }
      `}
    >
      {label}
    </button>
  );
};

export default NodePill;