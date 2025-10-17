import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: true,
    include: ["tests/**/*.spec.{ts,tsx}"],
    exclude: [
      "tests/e2e.spec.ts",
      "tests/ui.spec.ts",
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.pnpm/**"
    ]
  },
  resolve: {
    alias: [
      { find: "@/lib", replacement: path.resolve(__dirname, "./lib") },
      { find: "@/hooks", replacement: path.resolve(__dirname, "./hooks") },
      { find: "@/components", replacement: path.resolve(__dirname, "./app/components") },
      { find: "@", replacement: path.resolve(__dirname, "./app") },
      {
        find: "mirai-theme",
        replacement: path.resolve(__dirname, "../..", "packages/mirai-theme/src")
      }
    ]
  }
});
