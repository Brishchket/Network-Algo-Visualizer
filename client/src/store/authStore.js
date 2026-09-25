import { create } from "zustand";
import { getCurrentUser, loginUser, logoutUser, registerUser, sendOtp, verifyOtp } from "../api/auth.api";
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await getCurrentUser();
      set({ user: res.data.data, isAuthenticated: true, isCheckingAuth: false });
    } catch {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  sendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendOtp({ email });
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Could not send OTP", isLoading: false });
      throw err;
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      await verifyOtp({ email, otp });
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Invalid or expired OTP", isLoading: false });
      throw err;
    }
  },


  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await registerUser(data);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Registration failed", isLoading: false });
      throw err;
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginUser(data);
      set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Login failed", isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUser();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;