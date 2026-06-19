import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// placeholder pages for now
const Login = () => <div>Login</div>;
const Register = () => <div>Register</div>;
const Dashboard = () => <div>Dashboard</div>;
const TopologyBuilder = () => <div>Topology Builder</div>;
const Visualizer = () => <div>Visualizer</div>;
const Compare = () => <div>Compare</div>;
const Share = () => <div>Share</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:shareToken" element={<Share />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/topology/new" element={<TopologyBuilder />} />
          <Route path="/topology/:id" element={<TopologyBuilder />} />
          <Route path="/visualizer/:id" element={<Visualizer />} />
          <Route path="/compare" element={<Compare />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;