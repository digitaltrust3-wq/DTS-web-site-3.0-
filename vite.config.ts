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
    optimizeDeps: {
      // Without this, Vite's dev-time dependency scanner also crawls
      // animaciones/robot-dog-3d/index.html, an orphaned demo page that
      // loads an unrelated external project via an absolute /@fs/ path
      // (see docs/... audit notes). That project's imports (three, gsap,
      // @react-three/*) aren't dependencies of this app and were removed
      // from package.json; scanning them breaks dependency optimization.
      entries: ["index.html", "src/**/*.{ts,tsx}"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/app"),
      },
    },
  };
});
