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
    // The screen tests render the whole app with real providers and wait for framer-motion
    // exit animations; on a slow machine (CI runners, coverage runs) one can pass the 5s
    // default without anything being wrong.
    testTimeout: 15000,
  },
})
