import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

// FUSE 0.0 — three independent build targets, matching the trust
// boundary described in docs/architecture: main (privileged, Node),
// preload (narrow typed bridge), renderer (untrusted-adjacent UI,
// no direct Node/Electron access).
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/main/index.ts"),
      },
    },
    resolve: {
      alias: {
        "@main": resolve(__dirname, "src/main"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/preload/index.ts"),
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "src/renderer"),
    plugins: [react()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/renderer/index.html"),
      },
    },
    resolve: {
      alias: {
        "@renderer": resolve(__dirname, "src/renderer"),
      },
    },
  },
});
