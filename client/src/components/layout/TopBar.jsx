import { Search, Share2, Play } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../ui/Button";
import useAuthStore from "../../store/authStore";

export default function TopBar({ onShare = null, showRun = false, onRun = null }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
          <Button variant="outline" size="sm" icon={Play} onClick={onRun || (() => navigate("/run"))}>
            Run
          </Button>
        )}
        
        {/* avatar */}
        <Link to="/profile" className="ml-1">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user?.username} 
              className="w-8 h-8 rounded-full border border-[#30363d] object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-8 h-8 rounded-full bg-[#00bcd4]/20 flex items-center justify-center"
            style={{ display: user?.avatar ? 'none' : 'flex' }}
          >
            <span className="text-xs font-semibold text-[#00bcd4] uppercase">
              {user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}