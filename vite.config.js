import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Load environment variables starting with VITE_ from .env
export default defineConfig({
  root: 'frontend', // Set the root to 'frontend'
  build: {
    outDir: '../dist', // Output files to 'dist' in the root
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_APP_API_URL, // Use the environment variable for the API URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
