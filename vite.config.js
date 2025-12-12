import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
