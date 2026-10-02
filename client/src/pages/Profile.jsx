import { useState, useEffect, useRef } from "react";
import { User, Lock, Save, Eye, EyeOff, Edit3 } from "lucide-react";
import useAuthStore from "../store/authStore";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Profile() {
  const { user, updateProfile, setPassword, changePassword, checkUsername } = useAuthStore();
  
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    bio: user?.bio || ""
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  
  const [usernameStatus, setUsernameStatus] = useState("available");
  const [usernameError, setUsernameError] = useState("");
  const timerRef = useRef(null);
  
  const [passData, setPassData] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    let active = true;

    timerRef.current = setTimeout(async () => {
        if (profileData.username === user?.username) {
            setUsernameStatus("available");
            setUsernameError("");
            return;
        }

        if (!profileData.username) {
            setUsernameStatus("");
            setUsernameError("Username is required");
            return;
        }

        if (profileData.username.length < 3) {
            setUsernameStatus("invalid");
            setUsernameError("Must be at least 3 characters");
            return;
        }

        setUsernameStatus("checking");
        setUsernameError("");

        try {
            const res = await checkUsername(profileData.username);
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
  }, [profileData.username, checkUsername, user?.username]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
        if (e.target.name === "username") {
            setUsernameStatus("checking");
            setUsernameError("");
        }
    setProfileMessage(null);
  };
  
  const handlePassChange = (e) => {
      setPassData({ ...passData, [e.target.name]: e.target.value });
      setPassMessage(null);
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus !== "available") return;
    
    setProfileLoading(true);
    setProfileMessage(null);
    try {
      await updateProfile(profileData);
      setProfileMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setProfileMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (passData.newPassword !== passData.confirmPassword) {
          setPassMessage({ type: "error", text: "New passwords do not match" });
          return;
      }
      
      setPassLoading(true);
      setPassMessage(null);
      try {
          if (user.hasPassword) {
              await changePassword({ currentPassword: passData.currentPassword, newPassword: passData.newPassword });
          } else {
              await setPassword({ newPassword: passData.newPassword });
          }
          setPassMessage({ type: "success", text: "Password saved successfully" });
          setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (err) {
          setPassMessage({ type: "error", text: err.response?.data?.message || "Failed to save password" });
      } finally {
          setPassLoading(false);
      }
  };
  
  const renderMessage = (msg) => {
      if (!msg) return null;
      return (
          <div className={`mb-4 p-3 rounded-md text-sm ${msg.type === 'error' ? 'bg-[#da3633]/10 border border-[#da3633]/20 text-[#da3633]' : 'bg-green-500/10 border border-green-500/20 text-green-500'}`}>
              {msg.text}
          </div>
      );
  };

  return (
    <AppLayout>
      <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-[#e6edf3] mb-6 flex items-center gap-2">
            <User className="text-[#00bcd4]" /> Profile Settings
        </h1>
        
        {/* Header Section */}
        <Card className="mb-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-[#30363d] bg-[#00bcd4]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user?.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <span className="text-2xl font-semibold text-[#00bcd4] uppercase" style={{ display: user?.avatar ? 'none' : 'flex' }}>
                        {user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[#e6edf3]">{user?.fullName || user?.username}</h2>
                    <p className="text-sm text-[#8b949e]">{user?.email}</p>
                    <div className="flex gap-2 mt-2">
                        {user?.authProviders?.map(p => (
                            <span key={p} className="text-[10px] uppercase tracking-wider bg-[#1c2128] border border-[#30363d] px-2 py-0.5 rounded text-[#8b949e]">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Form */}
            <Card>
                <h3 className="text-base font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
                    <Edit3 size={16} className="text-[#00bcd4]" /> Edit Profile
                </h3>
                {renderMessage(profileMessage)}
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <Input
                      label="Username"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      required
                      error={usernameError}
                      hint={profileData.username !== user?.username && usernameStatus === "available" ? "Username available!" : "Letters, numbers, and underscores only"}
                    />
                    <Input
                      label="Full Name"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      maxLength={60}
                      placeholder="Your name"
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
                        Bio
                      </label>
                      <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          maxLength={160}
                          placeholder="Tell us about yourself"
                          rows={3}
                          className="w-full px-3 py-2 text-sm bg-[#1c2128] border border-[#30363d] text-[#e6edf3] placeholder-[#8b949e] rounded-md outline-none focus:border-[#00bcd4] focus:ring-1 focus:ring-[#00bcd4] transition-colors duration-150 resize-none"
                      />
                      <p className="text-xs text-[#8b949e] text-right">{profileData.bio.length}/160</p>
                    </div>
                    
                    <div className="pt-2 border-t border-[#30363d] flex justify-end">
                        <Button type="submit" variant="primary" icon={Save} disabled={profileLoading || usernameStatus !== "available"}>
                            {profileLoading ? "Saving..." : "Save Profile"}
                        </Button>
                    </div>
                </form>
            </Card>
            
            {/* Password Form */}
            <Card>
                <h3 className="text-base font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
                    <Lock size={16} className="text-[#00bcd4]" /> 
                    {user?.hasPassword ? "Change Password" : "Set a Password"}
                </h3>
                {renderMessage(passMessage)}
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {user?.hasPassword && (
                        <Input
                          label="Current Password"
                          name="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={passData.currentPassword}
                          onChange={handlePassChange}
                          required
                        />
                    )}
                    <Input
                      label="New Password"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passData.newPassword}
                      onChange={handlePassChange}
                      required
                      hint="At least 8 chars, 1 letter, 1 number"
                      rightSlot={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                    <Input
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={passData.confirmPassword}
                      onChange={handlePassChange}
                      required
                    />
                    
                    <div className="pt-2 border-t border-[#30363d] flex justify-end">
                        <Button type="submit" variant="primary" disabled={passLoading}>
                            {passLoading ? "Saving..." : (user?.hasPassword ? "Update Password" : "Set Password")}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
