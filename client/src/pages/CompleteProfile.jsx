import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../store/authStore";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, completeProfile, checkUsername, logout } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: user?.username || "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [usernameStatus, setUsernameStatus] = useState("checking");
  const [usernameError, setUsernameError] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (!user.needsProfileSetup) {
        navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    let active = true;

    timerRef.current = setTimeout(async () => {
      if (!formData.username) {
        setUsernameStatus("");
        setUsernameError("Username is required");
        return;
      }

      if (formData.username.length < 3) {
        setUsernameStatus("invalid");
        setUsernameError("Must be at least 3 characters");
        return;
      }

      setUsernameStatus("checking");
      setUsernameError("");

        try {
            const res = await checkUsername(formData.username);
        if (!active) return;
            if (res.available) {
                setUsernameStatus("available");
            } else {
                setUsernameStatus("taken");
                setUsernameError(res.reason || "Username is taken");
            }
        } catch {
            if (!active) return;
            setUsernameStatus("error");
            setUsernameError("Could not check username");
        }
    }, 400);
    
    return () => {
      active = false;
      clearTimeout(timerRef.current);
    };
  }, [formData.username, checkUsername]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "username") {
      setUsernameStatus("checking");
      setUsernameError("");
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (usernameStatus !== "available") {
      setError("Please choose a valid and available username");
      return;
    }
    
    setLoading(true);
    try {
      await completeProfile({ 
          username: formData.username, 
          password: formData.password 
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
      await logout();
      navigate("/users/login");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#e6edf3]">Complete your profile</h1>
          <p className="text-sm text-[#8b949e] mt-2">
            You signed up with Google. Please set a username and password to complete your account.
          </p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-[#da3633]/10 border border-[#da3633]/20 text-[#da3633] text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              icon={User}
              required
              error={usernameError}
              hint={usernameStatus === "available" ? "Username available!" : "Letters, numbers, and underscores only"}
              className={usernameStatus === "available" ? "border-green-500/50 focus:border-green-500 focus:ring-green-500" : ""}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Set a password"
              icon={Lock}
              required
              hint="At least 8 chars, 1 letter, 1 number"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
            
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={loading || usernameStatus !== "available"}
            >
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
              <button onClick={handleLogout} className="text-sm text-[#00bcd4] hover:underline">
                  Log out
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
