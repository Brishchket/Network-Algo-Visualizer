import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    clearError();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
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
        </div>

        <div className="auth-form-header">
          <span className="green"></span> Login
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            {isLoading ? "authenticating..." : "login"}
          </Button>
        </form>

        <p className="auth-link">
          no account? <Link to="/register">register</Link>
        </p>
      </div>
    </div>
  );
}