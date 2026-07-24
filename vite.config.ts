import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const animationsDirectory = path.resolve(__dirname, "../Animations");

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/DTS-web-site-3.0-/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        robotDog3d: path.resolve(__dirname, "animaciones/robot-dog-3d/index.html"),
      },
    },
  },
  server: {
    fs: {
      allow: [__dirname, animationsDirectory],
    },
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/app"),
    },
    dedupe: [
      "@react-three/drei",
      "@react-three/fiber",
      "gsap",
      "lucide-react",
      "react",
      "react-dom",
      "three",
    ],
  },
});
