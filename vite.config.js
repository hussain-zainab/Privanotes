import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PrivaNotes AI — dev server binds to all interfaces so the app can be
// tested on the target Snapdragon-powered HP PC on the same network if needed.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  // Batch 2: @huggingface/transformers (Transformers.js) dynamically loads
  // onnxruntime-web and its WASM binaries at runtime, and the transcription
  // pipeline runs inside a module Web Worker. Both of the settings below
  // are the documented workaround for Vite's dependency pre-bundler not
  // supporting that combination (see vitejs/vite#11672) — without them the
  // worker fails to load the runtime correctly in the production build.
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["@huggingface/transformers"],
  },
});
