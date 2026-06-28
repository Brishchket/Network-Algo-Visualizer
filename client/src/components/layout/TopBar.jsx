import { Search, Share2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export default function TopBar({ onShare = null, showRun = false, onRun = null }) {
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-6 flex-shrink-0">
      {/* search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
        <input
          type="text"
          placeholder="Search resources..."
          className="
            pl-9 pr-4 py-1.5 text-xs
            bg-[#1c2128] border border-[#30363d]
            text-[#e6edf3] placeholder-[#8b949e]
            rounded-md outline-none w-64
            focus:border-[#00bcd4] transition-colors
          "
        />
      </div>

      {/* right actions */}
      <div className="flex items-center gap-2">
        {onShare && (
          <Button variant="outline" size="sm" icon={Share2} onClick={onShare}>
            Share
          </Button>
        )}
        {showRun && (
          <Button variant="primary" size="sm" icon={Play} onClick={onRun || (() => navigate("/run"))}>
            Run
          </Button>
        )}
        {!showRun && !onShare && (
          <Button variant="primary" size="sm" icon={Play} onClick={() => navigate("/run")}>
            Run
          </Button>
        )}

        {/* avatar */}
        <div className="w-8 h-8 rounded-full bg-[#00bcd4]/20 flex items-center justify-center ml-1">
          <span className="text-xs font-semibold text-[#00bcd4]">R</span>
        </div>
      </div>
    </header>
  );
}