import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import useAuthStore from "../store/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
    } catch (error) {
      // error handled in store
      console.log("Error Occured !!!!", error)
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* logo */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold text-[#e6edf3] cursor-pointer hover:text-[#00bcd4] transition-colors"
            onClick={() => navigate("/")}
          >
            NetAlgoVis
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">Sign in to your account</p>
        </div>

        {/* card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 flex flex-col gap-5">

          {error && (
            <div className="px-4 py-3 rounded-md bg-[#da3633]/10 border border-[#da3633]/30 text-[#da3633] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
              icon={Mail}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />
            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              icon={ArrowRight}
              className="mt-1"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-[#30363d]" />
            <span className="text-xs text-[#8b949e]">or</span>
            <div className="flex-1 h-px bg-[#30363d]" />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={() => window.location.href = import.meta.env.VITE_GOOGLE_AUTH}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md border border-[#30363d] bg-transparent text-[#e6edf3] text-sm font-medium hover:bg-[#1c2128] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

        </div>

        <p className="text-center text-sm text-[#8b949e] mt-6">
          Don't have an account?{" "}
          <Link to="/users/register" className="text-[#00bcd4] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}