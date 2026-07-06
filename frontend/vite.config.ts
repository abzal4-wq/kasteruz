import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // tarmoqqa ochish (telefon/boshqa qurilmalardan kirish uchun)
    port: Number(process.env.PORT) || 5173, // PORT env (preview) yoki standart 5173
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
