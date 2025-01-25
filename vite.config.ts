import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/", // Explicitly set base URL to root
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Content-Type": "application/javascript",
    },
    mimeTypes: {
      "application/javascript": ["js", "mjs"],
      "text/javascript": ["js"],
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));