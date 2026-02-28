import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
    server: {
      deps: {
        inline: ["react-intersection-observer"],
      },
    },
  },
});

// Made with Bob
