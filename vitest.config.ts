import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: ["**/node_modules/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: "src/test-setup.ts",
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text"],
      include: ["src"],
    },
  },
});
