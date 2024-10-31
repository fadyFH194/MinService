import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: 'frontend', // Set the root to 'frontend'
  build: {
    outDir: '../dist', // Output files to 'dist' in the root
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:7070",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
