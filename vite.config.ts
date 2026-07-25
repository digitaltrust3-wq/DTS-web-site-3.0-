import { defineConfig, loadEnv } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const developmentApiTarget = env.VITE_DEV_API_TARGET || "http://127.0.0.1:3001";

  return {
    base: env.VITE_BASE_PATH || "/DTS-web-site-3.0-/",
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: developmentApiTarget,
          changeOrigin: false,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/app"),
      },
    },
  };
});
