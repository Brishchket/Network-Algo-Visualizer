import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    clearError();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/login");
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            <span className="green">[</span>
            NetAlgoVis
            <span className="green">]</span>
          </h1>
          <p className="auth-subtitle">// network algorithm visualizer</p>
        </div>

        <div className="auth-form-header">
          <span className="green">$</span> register
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="raj"
            required
          />
          <Input
            label="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="user@example.com"
            required
          />
          <Input
            label="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "registering..." : "register"}
          </Button>
        </form>

        <p className="auth-link">
          have an account? <Link to="/login">login</Link>
        </p>
      </div>
    </div>
  );
}