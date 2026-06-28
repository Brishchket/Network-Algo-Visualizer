import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  Play,
  Zap,
  History,
  Compass,
  User,
  LogOut
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Box, label: "Builder", path: "/topology/new" },
  { icon: Play, label: "Run", path: "/run" },
  { icon: Zap, label: "Race", path: "/race" },
  { icon: History, label: "History", path: "/history" },
  { icon: Compass, label: "Explore", path: "/explore" }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/topology/new") return location.pathname.startsWith("/topology");
    if (path === "/run") return location.pathname.startsWith("/run");
    return location.pathname === path;
  };

  return (
    <aside className="w-[150px] min-w-[150px] h-screen bg-[#161b22] border-r border-[#30363d] flex flex-col">
      {/* logo */}
      <div
        className="px-4 py-4 border-b border-[#30363d] cursor-pointer"
        onClick={() => navigate("/")}
      >
        <h1 className="text-base font-bold text-[#e6edf3]">NetAlgoVis</h1>
      </div>

      {/* project info */}
      <div className="px-4 py-3 border-b border-[#30363d]">
        <p className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-0.5">
          Project
        </p>
        <p className="text-xs font-semibold text-[#e6edf3] truncate">
          {user?.username}
        </p>
      </div>

      {/* nav items */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                text-xs font-medium transition-all duration-150
                relative
                ${active
                  ? "text-[#00bcd4] bg-[#00bcd4]/5"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#1c2128]"
                }
              `}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00bcd4]" />
              )}
              <item.icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* profile + logout */}
      <div className="border-t border-[#30363d] p-3 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-1 py-1">
          <div className="w-6 h-6 rounded-full bg-[#00bcd4]/20 flex items-center justify-center">
            <User size={12} className="text-[#00bcd4]" />
          </div>
          <span className="text-xs text-[#e6edf3] truncate">{user?.username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-1 py-1.5 text-xs text-[#8b949e] hover:text-[#da3633] transition-colors rounded"
        >
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </aside>
  );
}