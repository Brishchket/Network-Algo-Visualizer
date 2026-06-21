import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TopologyBuilder from "./pages/TopologyBuilder";
import Visualizer from "./pages/Visualizer";
import Compare from "./pages/Compare"
import Share from "./pages/Share";
import useAuthStore from "./store/authStore";


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
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/topology/new" element={<ProtectedRoute><TopologyBuilder /></ProtectedRoute>} />
        <Route path="/topology/:id" element={<ProtectedRoute><TopologyBuilder /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
        <Route path="/visualizer/:id" element={<ProtectedRoute><Visualizer /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
        <Route path="/share/:shareToken" element={<Share />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;