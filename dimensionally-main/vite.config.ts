import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Allow configuring base path via environment (VITE_BASE) for GitHub Pages project sites
  base: process.env.VITE_BASE || "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Proxy to forward API calls to Hugging Face and inject the API token from server env
    proxy: {
      '/api/hf': {
        target: 'https://api-inference.huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hf/, '/models'),
        configure: (proxy, options) => {
          // Add Authorization header using the env token on the dev server
          proxy.on('proxyReq', (proxyReq) => {
            const token = process.env.VITE_HUGGINGFACE_API_TOKEN;
            if (token) {
              proxyReq.setHeader('Authorization', `Bearer ${token}`);
            }
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
