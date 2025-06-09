import { defineConfig } from "vite";
import path, { resolve } from "path";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      // You still need an entry point here, but we'll override with rollupOptions.input
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "prp-map",
      // fileName can be a function that returns different file names per entry
      fileName: (format, entryName) => {
        if (entryName === "index") return `index.${format}.js`;
        return `${entryName}.${format}.js`;
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      // Multiple inputs, each with its own entry point
      input: {
        index: path.resolve(__dirname, "src/index.ts"),
        hooks: path.resolve(__dirname, "src/hooks/index.ts"),
        layers: path.resolve(__dirname, "src/layers/index.ts"),
      },
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        entryFileNames: "[name].[format].js",
        inlineDynamicImports: false,
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
