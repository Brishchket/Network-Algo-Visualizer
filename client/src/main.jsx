import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import useAuthStore from "./store/authStore.js";

const init = async () => {
  await useAuthStore.getState().checkAuth();
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

init();