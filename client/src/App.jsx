import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TopologyBuilder from "./pages/TopologyBuilder";
import Run from "./pages/Run";
import Race from "./pages/Race";
import History from "./pages/History";
import Explore from "./pages/Explore";
import Share from "./pages/Share";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/users/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/users/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/share/:shareToken" element={<Share />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/topology/new" element={<ProtectedRoute><TopologyBuilder /></ProtectedRoute>} />
        <Route path="/topology/:id" element={<ProtectedRoute><TopologyBuilder /></ProtectedRoute>} />
        <Route path="/run" element={<ProtectedRoute><Run /></ProtectedRoute>} />
        <Route path="/run/:id" element={<ProtectedRoute><Run /></ProtectedRoute>} />
        <Route path="/race" element={<ProtectedRoute><Race /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;