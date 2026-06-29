import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { checkAuth, isAuthenticated, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    const finalizeGoogleAuth = async () => {
      await checkAuth();
    };

    finalizeGoogleAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isCheckingAuth) return;

    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    } else {
      navigate("/users/login", { replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, navigate, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#e6edf3]">
      <p>Finishing sign-in...</p>
    </div>
  );
}
