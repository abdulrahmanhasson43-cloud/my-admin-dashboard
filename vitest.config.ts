import path from "path"
import { defineConfig } from "vitest/config"

// Kept separate from vite.config.ts so the production build config (plugins,
// chunk splitting) is untouched by the test setup.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Services and lib code are framework-free, so plain Node is enough.
    // The one UI smoke test opts into jsdom with a `@vitest-environment` docblock.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.ts"],
  },
})
