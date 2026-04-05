import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.ts"], // any .ts file inside tests/
    exclude: ["tests/utils.ts"],
  },
});
