import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(() => {
  // Use import.meta.env for Vite 3+ and browser compatibility
  const backendProxyTarget =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: "/",
      proxy: {
        "/api": backendProxyTarget,
      },
    },
  };
});
