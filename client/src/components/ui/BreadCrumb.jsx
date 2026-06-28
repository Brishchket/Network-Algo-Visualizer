import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items = [] }) => {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight size={12} className="text-[#30363d]" />}
          <span className={index === items.length - 1 ? "text-[#e6edf3] font-medium" : ""}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;