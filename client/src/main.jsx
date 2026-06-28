import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import useAuthStore from "./store/authStore.js";

const init = async () => {
  await useAuthStore.getState().checkAuth();
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <GoogleOAuthProvider 
      clientId="920895604984-o1bili0hcholi7t4fedmqm1hbr0cpm5p.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </StrictMode>
  );
};

init();