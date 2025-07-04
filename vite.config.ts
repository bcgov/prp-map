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
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/index.ts"),
      },
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        entryFileNames: "[name].[format].js",
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
});
