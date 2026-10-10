import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 纯静态前端工程：构建产物是 dist/ 下的普通静态文件，
// 可直接托管在 GitHub Pages / Netlify / Vercel / Cloudflare Pages 或任意静态服务器。
// base 使用相对路径，部署在域名根目录或任意子路径（例如 /galagame/）都能正常加载资源。
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
});
