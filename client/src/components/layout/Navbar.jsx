import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import Button from "../ui/Button";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/dashboard")}>
        <span className="brand-bracket">[</span>
        <span className="brand-name">NetAlgoVis</span>
        <span className="brand-bracket">]</span>
      </div>

      <div className="navbar-links">
        <span className="nav-link" onClick={() => navigate("/dashboard")}>
          dashboard
        </span>
        <span className="nav-link" onClick={() => navigate("/topology/new")}>
          new_topology
        </span>
        <span className="nav-link" onClick={() => navigate("/compare")}>
          compare
        </span>
      </div>

      <div className="navbar-right">
        <span className="nav-user">~/{user?.username}</span>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          logout
        </Button>
      </div>
    </nav>
  );
}